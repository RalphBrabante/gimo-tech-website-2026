import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateQuotationRequestDto } from './dto/create-quotation-request.dto';
import { CreateProductEnquiryDto } from './dto/create-product-enquiry.dto';
import { QuotationsService } from './quotations.service';

@Controller('api')
export class QuotationsController {
  constructor(private readonly quotations: QuotationsService) {}

  @Post('quotation-requests')
  @HttpCode(201)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(@Body() input: CreateQuotationRequestDto) { return this.quotations.create(input); }

  @Post('product-enquiries')
  @HttpCode(201)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  createProductEnquiry(@Body() input: CreateProductEnquiryDto) { return this.quotations.createProductEnquiry(input); }
}
