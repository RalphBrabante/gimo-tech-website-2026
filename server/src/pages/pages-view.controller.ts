import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { resolve } from 'node:path';
import { PagesService } from './pages.service';
import { PageRendererService } from './page-renderer.service';
import { storefrontPath } from '../storefront-path';

function originFromRequest(request: Request): string {
  return `${request.protocol}://${request.get('host')}`;
}

@Controller()
export class PagesViewController {
  constructor(
    private readonly pages: PagesService,
    private readonly renderer: PageRendererService
  ) {}

  // The literal root must be handled here explicitly: the '{*splat}' catch-all below
  // also matches zero path segments (i.e. '/'), so without this the Angular homepage
  // would be shadowed by the branded 404 page.
  @Get('/')
  renderHome(@Res() response: Response): void {
    response.sendFile(resolve(storefrontPath, 'index.html'));
  }

  @Get(':slug')
  async renderPage(@Param('slug') slug: string, @Req() request: Request, @Res() response: Response): Promise<void> {
    const page = await this.pages.findPublishedBySlug(slug);
    if (!page) {
      const html = await this.renderer.renderNotFound(originFromRequest(request));
      response.status(404).type('text/html').send(html);
      return;
    }
    const html = await this.renderer.renderPage(page, originFromRequest(request));
    response.status(200).type('text/html').send(html);
  }

  @Get('{*splat}')
  async notFound(@Req() request: Request, @Res() response: Response): Promise<void> {
    const html = await this.renderer.renderNotFound(originFromRequest(request));
    response.status(404).type('text/html').send(html);
  }
}
