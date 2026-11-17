import { ProductsModule } from '../products/products.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageEntity } from './entities/page.entity';
import { PageBlockEntity } from './entities/page-block.entity';
import { PagesService } from './pages.service';
import { InternalPagesController } from './internal-pages.controller';
import { SitemapController } from './sitemap.controller';
import { ApiNotFoundController } from './api-not-found.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity, PageBlockEntity]), AuthModule, ProductsModule],
  controllers: [InternalPagesController, SitemapController, ApiNotFoundController],
  providers: [PagesService]
})
export class PagesModule {}
