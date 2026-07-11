import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { Product } from './models/product.model';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>
  ) {}

  async findAll(category?: string): Promise<Product[]> {
    const normalizedCategory = category?.trim();
    const products = await this.productsRepository.find({
      where: normalizedCategory ? { category: normalizedCategory } : {},
      order: { id: 'ASC' }
    });
    return products.map((product) => this.toModel(product));
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    return this.toModel(product);
  }

  private toModel(entity: ProductEntity): Product {
    return {
      id: entity.id,
      name: entity.name,
      category: entity.category,
      price: entity.priceCents / 100,
      rating: entity.rating,
      accent: entity.accent
    };
  }
}
