import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductEntity } from './entities/product.entity';
import { AuthModule } from '../auth/auth.module';
import { InternalProductsController } from './internal-products.controller';
import { ProductImageEntity } from './entities/product-image.entity';
import { PageRendererModule } from '../pages/page-renderer.module';
import { ProductViewController } from './product-view.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductImageEntity]), AuthModule, PageRendererModule],
  controllers: [ProductsController, InternalProductsController, ProductViewController],
  providers: [ProductsService]
})
export class ProductsModule {}
