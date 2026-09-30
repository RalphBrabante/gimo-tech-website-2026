import { redirectTrailingSlash } from '../common/public-document.middleware';
import { publicOrigin } from '../common/public-site';
import { Controller, Get, Param, Query, Redirect, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PageRendererService } from '../pages/page-renderer.service';
import { ProductsService } from './products.service';

function originFromRequest(request: Request): string {
  return publicOrigin();
}

@Controller()
export class ProductViewController {
  constructor(
    private readonly products: ProductsService,
    private readonly renderer: PageRendererService
  ) {}

  @Get('products')
  async catalogue(@Query('page') rawPage: string | undefined, @Res() response: Response, @Req() request: Request): Promise<void> {
    const page = rawPage === undefined ? 1 : /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : NaN;
    if (!Number.isSafeInteger(page) || page < 1) { response.status(404).type('text/html').send(await this.renderer.renderNotFound(publicOrigin())); return; }
    const size = 24;
    const { products, total } = await this.products.findPage(page, size);
    if (page > 1 && (page - 1) * size >= total) { response.status(404).type('text/html').send(await this.renderer.renderNotFound(publicOrigin())); return; }
    if (redirectTrailingSlash(request, response)) return;
    if (rawPage === '1') { response.redirect(301, '/products'); return; }
    response.setHeader('Cache-Control', 'no-cache');
    response.type('text/html').send(await this.renderer.renderCatalogue(products, page, page * size < total));
  }

  @Get('products/nylon-syringe-filter-25mm-045um')
  async renderNylonSyringeFilter(@Res() response: Response, @Req() request: Request): Promise<void> {
    if (redirectTrailingSlash(request, response)) return;
    response.status(200).type('text/html').send(await this.renderer.renderNylonSyringeFilter());
  }

  @Get('sequential-qr-code-labels')
  async renderSequentialQrCodeLabels(@Res() response: Response, @Req() request: Request): Promise<void> {
    if (redirectTrailingSlash(request, response)) return;
    response.status(200).type('text/html').send(await this.renderer.renderSequentialQrCodeLabels());
  }

  @Get('guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters')
  async renderSyringeFilterGuide(@Res() response: Response, @Req() request: Request): Promise<void> {
    if (redirectTrailingSlash(request, response)) return;
    response.status(200).type('text/html').send(await this.renderer.renderSyringeFilterGuide());
  }

  @Get([
    'product/nylon-syringe-filter-25mm-045um',
    'products/nylon-syringe-filter-25mm-0-45um',
    'products/nylon-syringe-filter-25mm-045-micron'
  ])
  @Redirect('/products/nylon-syringe-filter-25mm-045um', 301)
  redirectNylonDuplicate(): void {}

  @Get('product/:id')
  async renderProduct(@Param('id') rawId: string, @Req() request: Request, @Res() response: Response): Promise<void> {
    const id = /^[1-9]\d*$/.test(rawId) ? Number(rawId) : NaN;
    const product = Number.isSafeInteger(id) ? await this.products.findOnePublic(id) : null;
    if (!product) {
      response.status(404).type('text/html').send(await this.renderer.renderNotFound(originFromRequest(request)));
      return;
    }
    if (redirectTrailingSlash(request, response)) return;
    response.type('text/html').send(await this.renderer.renderProduct(product, originFromRequest(request)));
  }
}
