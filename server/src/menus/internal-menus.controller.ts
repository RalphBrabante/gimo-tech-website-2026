import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ReorderMenuItemsDto } from './dto/reorder-menu-items.dto';
import { MenusService } from './menus.service';

@Controller('api/internal/menus')
@UseGuards(InternalAuthGuard)
export class InternalMenusController {
  constructor(private readonly menus: MenusService) {}

  @Get()
  findAll() {
    return this.menus.findAllInternal();
  }

  @Post()
  @HttpCode(201)
  create(@Body() input: CreateMenuItemDto) {
    return this.menus.create(input);
  }

  @Patch('reorder')
  reorder(@Body() input: ReorderMenuItemsDto) {
    return this.menus.reorder(input);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() input: UpdateMenuItemDto) {
    return this.menus.update(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menus.remove(id);
  }
}
