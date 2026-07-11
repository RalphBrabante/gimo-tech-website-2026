import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductEntity } from './entities/product.entity';
import { AuthModule } from '../auth/auth.module';
import { InternalProductsController } from './internal-products.controller';
import { ProductImageEntity } from './entities/product-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductImageEntity]), AuthModule],
  controllers: [ProductsController, InternalProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}
