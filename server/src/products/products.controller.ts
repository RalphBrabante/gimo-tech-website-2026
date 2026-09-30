import { Controller, Get, NotFoundException, BadRequestException, DefaultValuePipe, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query('category') category?: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1) {
    if (category !== undefined && typeof category !== 'string') throw new BadRequestException('Invalid category');
    if (page < 1 || !Number.isSafeInteger(page)) throw new BadRequestException('Invalid catalogue page');
    return (await this.productsService.findPage(page, 24, category)).products;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productsService.findOnePublic(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
