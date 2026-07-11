import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { Product } from './models/product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductImageEntity } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(category?: string): Promise<Product[]> {
    const normalizedCategory = category?.trim();
    const products = await this.productsRepository.find({
      where: normalizedCategory ? { category: normalizedCategory, isActive: true } : { isActive: true },
      relations: { images: true },
      order: { id: 'ASC', images: { sortOrder: 'ASC' } }
    });
    return products.map((product) => this.toModel(product));
  }

  async findAllInternal(): Promise<Product[]> {
    const products = await this.productsRepository.find({ relations: { images: true }, order: { createdAt: 'DESC', images: { sortOrder: 'ASC' } } });
    return products.map((product) => this.toModel(product));
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id }, relations: { images: true }, order: { images: { sortOrder: 'ASC' } } });
    if (!product) throw new NotFoundException('Product not found');
    return this.toModel(product);
  }

  async create(input: CreateProductDto, userId: number, imageUrls: string[]): Promise<Product> {
    const sku = input.sku.trim().toUpperCase();
    const existingProduct = await this.productsRepository.findOneBy({ sku });
    if (existingProduct) {
      throw new ConflictException('A product with this SKU already exists.');
    }

    const created = await this.dataSource.transaction(async (manager) => {
      const product = manager.create(ProductEntity, {
        name: input.name.trim(),
        sku,
        category: input.category.trim(),
        description: input.description.trim(),
        priceCents: input.priceCents,
        rating: (input.ratingTenths ?? 0) / 10,
        accent: input.accent ?? '#d8f3f1',
        imageUrl: imageUrls[0],
        isActive: input.isActive ?? true,
        createdByUserId: userId,
        updatedByUserId: userId
      });
      const savedProduct = await manager.save(product);
      const images = imageUrls.map((url, sortOrder) => manager.create(ProductImageEntity, { productId: savedProduct.id, url, sortOrder }));
      await manager.save(images);
      savedProduct.images = images;
      return savedProduct;
    });
    return this.toModel(created);
  }

  private toModel(entity: ProductEntity): Product {
    return {
      id: entity.id,
      name: entity.name,
      sku: entity.sku,
      category: entity.category,
      description: entity.description,
      price: entity.priceCents / 100,
      rating: entity.rating,
      accent: entity.accent,
      imageUrl: entity.images?.[0]?.url ?? entity.imageUrl,
      imageUrls: entity.images?.map((image) => image.url) ?? (entity.imageUrl ? [entity.imageUrl] : [])
    };
  }
}
