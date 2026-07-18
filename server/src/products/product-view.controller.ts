import { Controller, Get, Param, ParseIntPipe, Redirect, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PageRendererService } from '../pages/page-renderer.service';
import { ProductsService } from './products.service';

function originFromRequest(request: Request): string {
  return `${request.protocol}://${request.get('host')}`;
}

@Controller()
export class ProductViewController {
  constructor(
    private readonly products: ProductsService,
    private readonly renderer: PageRendererService
  ) {}

  @Get('products/nylon-syringe-filter-25mm-045um')
  async renderNylonSyringeFilter(@Res() response: Response): Promise<void> {
    response.status(200).type('text/html').send(await this.renderer.renderNylonSyringeFilter());
  }

  @Get('guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters')
  async renderSyringeFilterGuide(@Res() response: Response): Promise<void> {
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
  async renderProduct(@Param('id', ParseIntPipe) id: number, @Req() request: Request, @Res() response: Response): Promise<void> {
    const product = await this.products.findOnePublic(id);
    if (!product) {
      response.status(404).type('text/html').send(await this.renderer.renderNotFound(originFromRequest(request)));
      return;
    }
    response.type('text/html').send(await this.renderer.renderProduct(product, originFromRequest(request)));
  }
}
