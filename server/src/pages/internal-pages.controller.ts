import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/auth.service';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

type AuthenticatedRequest = Request & { authenticatedUser: AuthenticatedUser };

@Controller('api/internal/pages')
@UseGuards(InternalAuthGuard)
export class InternalPagesController {
  constructor(private readonly pages: PagesService) {}

  @Get()
  findAll() {
    return this.pages.findAllInternal();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pages.findOneInternal(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() input: CreatePageDto, @Req() request: AuthenticatedRequest) {
    return this.pages.create(input, request.authenticatedUser.id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() input: UpdatePageDto, @Req() request: AuthenticatedRequest) {
    return this.pages.update(id, input, request.authenticatedUser.id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pages.remove(id);
  }
}
