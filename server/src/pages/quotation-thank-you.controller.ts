import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PageRendererService } from './page-renderer.service';

function originFromRequest(request: Request): string {
  return `${request.protocol}://${request.get('host')}`;
}

@Controller()
export class QuotationThankYouController {
  constructor(private readonly renderer: PageRendererService) {}

  @Get('quotation-request-received')
  async render(@Query('request') requestNumber: string | undefined, @Req() request: Request, @Res() response: Response): Promise<void> {
    const safeRequestNumber = requestNumber && /^GQ-\d{6}$/.test(requestNumber) ? requestNumber : null;
    response.setHeader('Cache-Control', 'no-store');
    response.type('text/html').send(await this.renderer.renderQuotationThankYou(originFromRequest(request), safeRequestNumber));
  }
}
