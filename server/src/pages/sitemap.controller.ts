import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagesService } from './pages.service';
import { ProductEntity } from '../products/entities/product.entity';

const SITE_ORIGIN = 'https://gimosupplies.com';
const STATIC_INDEXABLE_PATHS = [
  '',
  'products/nylon-syringe-filter-25mm-045um',
  'guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters'
];

@Controller()
export class SitemapController {
  constructor(
    private readonly pages: PagesService,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>
  ) {}

  @Get('sitemap.xml')
  async sitemap(@Res() response: Response): Promise<void> {
    const [slugs, products] = await Promise.all([
      this.pages.listPublishedSlugs(),
      this.products.find({ where: { isActive: true }, select: { id: true }, order: { id: 'ASC' } })
    ]);
    const paths = new Set([...STATIC_INDEXABLE_PATHS, ...slugs, ...products.map((product) => `product/${product.id}`)]);
    const urls = [...paths].map((path) => `<url><loc>${SITE_ORIGIN}/${path}</loc></url>`).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
    response.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    response.type('application/xml').send(xml);
  }
}
