import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateQuotationRequestDto } from './dto/create-quotation-request.dto';
import { QuotationsService } from './quotations.service';

@Controller('api/quotation-requests')
export class QuotationsController {
  constructor(private readonly quotations: QuotationsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() input: CreateQuotationRequestDto) { return this.quotations.create(input); }
}
