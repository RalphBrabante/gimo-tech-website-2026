import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { Product } from './models/product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImageEntity } from './entities/product-image.entity';
import { MAX_PRODUCT_IMAGES } from './product-upload.config';

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

  async update(
    id: number,
    input: UpdateProductDto,
    userId: number,
    newImageUrls: string[]
  ): Promise<{ product: Product; removedImageUrls: string[] }> {
    const existing = await this.productsRepository.findOne({ where: { id }, relations: { images: true } });
    if (!existing) throw new NotFoundException('Product not found');

    if (input.sku && input.sku !== existing.sku) {
      const conflict = await this.productsRepository.findOneBy({ sku: input.sku });
      if (conflict) throw new ConflictException('A product with this SKU already exists.');
      existing.sku = input.sku;
    }

    const removeIds = new Set(input.removeImageIds ?? []);
    const keptImages = existing.images.filter((image) => !removeIds.has(image.id));
    const removedImages = existing.images.filter((image) => removeIds.has(image.id));
    const totalImages = keptImages.length + newImageUrls.length;
    if (totalImages < 1) throw new BadRequestException('A product needs at least one image.');
    if (totalImages > MAX_PRODUCT_IMAGES) throw new BadRequestException(`A product can have at most ${MAX_PRODUCT_IMAGES} images.`);

    if (input.name !== undefined) existing.name = input.name.trim();
    if (input.category !== undefined) existing.category = input.category.trim();
    if (input.description !== undefined) existing.description = input.description.trim();
    if (input.priceCents !== undefined) existing.priceCents = input.priceCents;
    if (input.ratingTenths !== undefined) existing.rating = input.ratingTenths / 10;
    if (input.accent !== undefined) existing.accent = input.accent;
    if (input.isActive !== undefined) existing.isActive = input.isActive;
    existing.updatedByUserId = userId;

    const updated = await this.dataSource.transaction(async (manager) => {
      if (removedImages.length) {
        await manager.remove(ProductImageEntity, removedImages);
      }
      let sortOrder = keptImages.length ? Math.max(...keptImages.map((image) => image.sortOrder)) + 1 : 0;
      const createdImages = newImageUrls.map((url) =>
        manager.create(ProductImageEntity, { productId: existing.id, url, sortOrder: sortOrder++ })
      );
      if (createdImages.length) await manager.save(createdImages);
      const allImages = [...keptImages, ...createdImages].sort((a, b) => a.sortOrder - b.sortOrder);
      existing.imageUrl = allImages[0]?.url ?? null;
      const savedProduct = await manager.save(existing);
      savedProduct.images = allImages;
      return savedProduct;
    });

    return { product: this.toModel(updated), removedImageUrls: removedImages.map((image) => image.url) };
  }

  async remove(id: number): Promise<string[]> {
    const existing = await this.productsRepository.findOne({ where: { id }, relations: { images: true } });
    if (!existing) throw new NotFoundException('Product not found');
    const imageUrls = existing.images.map((image) => image.url);
    await this.productsRepository.remove(existing);
    return imageUrls;
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
      imageUrls: entity.images?.map((image) => image.url) ?? (entity.imageUrl ? [entity.imageUrl] : []),
      images: entity.images?.map((image) => ({ id: image.id, url: image.url })) ?? [],
      isActive: entity.isActive
    };
  }
}
