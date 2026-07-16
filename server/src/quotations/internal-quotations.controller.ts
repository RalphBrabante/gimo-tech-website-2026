import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CreateFormalQuotationDto } from './dto/create-formal-quotation.dto';
import { QuotationsService } from './quotations.service';

type AuthenticatedRequest = Request & { authenticatedUser: AuthenticatedUser };

@Controller('api/internal/quotations')
@UseGuards(InternalAuthGuard)
export class InternalQuotationsController {
  constructor(private readonly quotations: QuotationsService) {}
  @Get() findAll() { return this.quotations.findAll(); }
  @Post(':id/respond') prepare(@Param('id', ParseIntPipe) id: number, @Body() input: CreateFormalQuotationDto, @Req() request: AuthenticatedRequest) {
    return this.quotations.prepareFormalQuotation(id, input, request.authenticatedUser.id);
  }
}
