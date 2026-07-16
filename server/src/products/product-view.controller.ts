import { Controller, Get, Param, ParseIntPipe, Req, Res } from '@nestjs/common';
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
