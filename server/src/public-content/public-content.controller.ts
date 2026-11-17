import { BadRequestException, Controller, Get, Logger, NotFoundException, Param, Query } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { HomepageService } from '../homepage/homepage.service';
import { MenusService } from '../menus/menus.service';
import { SettingsService } from '../settings/settings.service';
import { PagesService } from '../pages/pages.service';
import { imageDimensions, thumbnailUrl } from '../media/public-image';
import type { Product } from '../products/models/product.model';

export const CATALOGUE_PAGE_SIZE = 24;

type PublicProduct = Omit<Product, 'price' | 'rating' | 'isActive'> & { images: { id: number; url: string; thumbnailUrl: string }[] };

/**
 * Read-only data for the server-rendered public website (Next.js).
 * Every section fails independently so one unavailable table never blanks a page.
 * Prices and ratings stay internal: the public site is quote-only and must not imply offers or reviews.
 */
@Controller('api/public')
export class PublicContentController {
  private readonly logger = new Logger(PublicContentController.name);

  constructor(
    private readonly products: ProductsService,
    private readonly homepage: HomepageService,
    private readonly menus: MenusService,
    private readonly settings: SettingsService,
    private readonly pages: PagesService
  ) {}

  @Get('site')
  async site() {
    const [menus, settings] = await Promise.allSettled([this.menus.getPublic(), this.settings.get()]);
    if (menus.status === 'rejected') this.logger.warn('Public menus unavailable; the site falls back to default navigation');
    return {
      menus: menus.status === 'fulfilled' ? menus.value : null,
      settings: settings.status === 'fulfilled' ? { currencyCode: settings.value.currencyCode, freeShippingThresholdCents: settings.value.freeShippingThresholdCents } : null
    };
  }

  @Get('home')
  async home() {
    const [homepage, products] = await Promise.allSettled([this.homepage.getAll(), this.products.findPage(1, 4)]);
    return {
      homepage: homepage.status === 'fulfilled' ? homepage.value : null,
      products: products.status === 'fulfilled' ? products.value.products.map(toPublicProduct) : [],
      catalogueUnavailable: products.status === 'rejected'
    };
  }

  @Get('catalogue')
  async catalogue(@Query('page') rawPage?: string) {
    const page = rawPage === undefined ? 1 : /^[1-9]\d{0,5}$/.test(rawPage) ? Number(rawPage) : NaN;
    if (!Number.isSafeInteger(page)) throw new BadRequestException('Invalid catalogue page');
    const { products, total } = await this.products.findPage(page, CATALOGUE_PAGE_SIZE);
    return { page, pageSize: CATALOGUE_PAGE_SIZE, total, products: products.map(toPublicProduct) };
  }

  @Get('products/:id')
  async product(@Param('id') rawId: string) {
    const id = /^[1-9]\d{0,9}$/.test(rawId) ? Number(rawId) : NaN;
    const product = Number.isSafeInteger(id) ? await this.products.findOnePublic(id) : null;
    if (!product) throw new NotFoundException('Product not found');
    return toPublicProduct(product);
  }

  @Get('pages/:slug')
  async page(@Param('slug') slug: string) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) throw new NotFoundException('Page not found');
    const page = await this.pages.findPublishedBySlug(slug);
    if (!page) throw new NotFoundException('Page not found');
    // Intrinsic image sizes let the page reserve layout space (no CLS) for administrator uploads.
    const blocks = await Promise.all(page.blocks.map(async (block) => ({
      ...block,
      imageSize: block.blockType === 'image' && block.imageUrl ? await imageDimensions(block.imageUrl) : null
    })));
    return { slug: page.slug, title: page.title, metaDescription: page.metaDescription, ogImageUrl: page.ogImageUrl, updatedAt: page.updatedAt, blocks };
  }
}

function toPublicProduct(product: Product): PublicProduct {
  const { price: _price, rating: _rating, isActive: _active, ...rest } = product;
  const images = product.images.length ? product.images : product.imageUrl ? [{ id: 0, url: product.imageUrl }] : [];
  return { ...rest, images: images.map((image) => ({ ...image, thumbnailUrl: thumbnailUrl(image.url) })) };
}
