import { BadRequestException, Body, Controller, Get, HttpCode, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { MAX_PRODUCT_IMAGE_BYTES, MAX_PRODUCT_IMAGES, productImageFilter, removeProductImages, saveProductImages } from './product-upload.config';

type AuthenticatedRequest = Request & { authenticatedUser: AuthenticatedUser };

@Controller('api/internal/products')
@UseGuards(InternalAuthGuard)
export class InternalProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAllInternal();
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(FilesInterceptor('images', MAX_PRODUCT_IMAGES, {
    storage: memoryStorage(),
    fileFilter: productImageFilter,
    limits: { files: MAX_PRODUCT_IMAGES, fileSize: MAX_PRODUCT_IMAGE_BYTES }
  }))
  async create(
    @Body() product: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: AuthenticatedRequest
  ) {
    if (!files?.length) throw new BadRequestException('Upload at least one product image.');
    const savedImages = await saveProductImages(files);
    try {
      return await this.productsService.create(product, request.authenticatedUser.id, savedImages.urls);
    } catch (error) {
      await removeProductImages(savedImages.paths);
      throw error;
    }
  }
}
