import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PagesService } from './pages.service';
import { ProductsService } from '../products/products.service';
import { publicOrigin, productPath, NYLON_PRODUCT_PATH } from '../common/public-site';
import { escapeHtml } from '../common/html.util';

@Controller()
export class SitemapController {
  constructor(private readonly pages: PagesService, private readonly products: ProductsService) {}
  @Get('sitemap.xml')
  async sitemap(@Res() response: Response): Promise<void> {
    const [pages, products] = await Promise.all([this.pages.listPublishedEntries(), this.products.findAll()]);
    const paths = new Map<string, Date | undefined>(['/', '/products', '/contact-us', '/about-gimo', '/request-for-a-quote', '/sequential-qr-code-labels', NYLON_PRODUCT_PATH, '/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters'].map(p => [p, undefined]));
    for (const page of pages) if (!/^(?:api|internal|quotation-request-received|product|products|guides|assets|uploads|health|robots\.txt|sitemap\.xml)$/.test(page.slug)) paths.set(`/${page.slug}`, page.updatedAt);
    for (const product of products) paths.set(productPath(product), product.updatedAt);
    for (let page = 2; page <= Math.ceil(products.length / 24); page++) paths.set(`/products?page=${page}`, undefined);
    const urls = [...paths].map(([path, date]) => `<url><loc>${escapeHtml(`${publicOrigin()}${path}`)}</loc>${date && Number.isFinite(new Date(date).getTime()) ? `<lastmod>${new Date(date).toISOString()}</lastmod>` : ''}</url>`).join('');
    // Re-query on every request. Publication/product edits cannot remain in a day-long stale cache.
    response.setHeader('Cache-Control', 'no-cache');
    response.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  }
}
