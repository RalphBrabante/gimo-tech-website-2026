import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PagesService } from './pages.service';

@Controller()
export class SitemapController {
  constructor(private readonly pages: PagesService) {}

  @Get('sitemap.xml')
  async sitemap(@Req() request: Request, @Res() response: Response): Promise<void> {
    const origin = `${request.protocol}://${request.get('host')}`;
    const slugs = await this.pages.listPublishedSlugs();
    const urls = ['', ...slugs].map((slug) => `<url><loc>${origin}/${slug}</loc></url>`).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
    response.type('application/xml').send(xml);
  }
}
