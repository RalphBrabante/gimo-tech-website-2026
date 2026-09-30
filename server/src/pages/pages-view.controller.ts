import { redirectTrailingSlash } from '../common/public-document.middleware';
import { HomeRendererService } from '../homepage/home-renderer.service';
import { publicOrigin } from '../common/public-site';
import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { resolve } from 'node:path';
import { PagesService } from './pages.service';
import { PageRendererService } from './page-renderer.service';
import { storefrontPath } from '../storefront-path';

function originFromRequest(request: Request): string {
  return publicOrigin();
}

@Controller()
export class PagesViewController {
  constructor(
    private readonly pages: PagesService,
    private readonly home: HomeRendererService,
    private readonly renderer: PageRendererService
  ) {}

  @Get('api/{*splat}')
  apiNotFound(@Res() response: Response): void {
    response.status(404).json({ statusCode: 404, error: 'Not Found', message: 'API endpoint not found' });
  }

  @Get('/')
  async renderHome(@Res() response: Response, @Query('add-to-quote') productId?: string): Promise<void> {
    response.setHeader('Cache-Control', 'no-cache');
    try { response.type('text/html').send(await this.home.render(productId)); }
    catch { response.status(503).setHeader('Retry-After', '60'); response.type('text/html').send('<!doctype html><html lang="en"><head><title>Temporarily unavailable | Gimo Tech Supplies</title><meta name="robots" content="noindex"></head><body><main><h1>Our catalogue is temporarily unavailable</h1><p>Please email <a href="mailto:gimotechsupplies@gmail.com">our supply team</a> for product and quotation enquiries.</p></main></body></html>'); }
  }

  @Get(':slug')
  async renderPage(@Param('slug') slug: string, @Req() request: Request, @Res() response: Response): Promise<void> {
    const page = await this.pages.findPublishedBySlug(slug);
    if (!page && ['contact-us', 'about-gimo', 'request-for-a-quote'].includes(slug)) {
      if (redirectTrailingSlash(request, response)) return;
      response.type('text/html').send(await this.renderer.renderContact(slug)); return;
    }
    if (!page) {
      const html = await this.renderer.renderNotFound(originFromRequest(request));
      response.status(404).type('text/html').send(html);
      return;
    }
    if (redirectTrailingSlash(request, response)) return;
    const html = await this.renderer.renderPage(page, originFromRequest(request));
    response.status(200).type('text/html').send(html);
  }

  @Get('{*splat}')
  async notFound(@Req() request: Request, @Res() response: Response): Promise<void> {
    const html = await this.renderer.renderNotFound(originFromRequest(request));
    response.status(404).type('text/html').send(html);
  }
}
