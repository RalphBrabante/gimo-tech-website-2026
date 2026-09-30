import { HomeRendererService } from '../homepage/home-renderer.service';
import { ProductsModule } from '../products/products.module';
import { HomepageModule } from '../homepage/homepage.module';
import { MenusModule } from '../menus/menus.module';
import { SettingsModule } from '../settings/settings.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageEntity } from './entities/page.entity';
import { PageBlockEntity } from './entities/page-block.entity';
import { PagesService } from './pages.service';
import { PageRendererService } from './page-renderer.service';
import { InternalPagesController } from './internal-pages.controller';
import { SitemapController } from './sitemap.controller';
import { PagesViewController } from './pages-view.controller';
import { QuotationThankYouController } from './quotation-thank-you.controller';
import { AuthModule } from '../auth/auth.module';
import { PageRendererModule } from './page-renderer.module';
import { ProductEntity } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity, PageBlockEntity, ProductEntity]), AuthModule, PageRendererModule, ProductsModule, HomepageModule, MenusModule, SettingsModule],
  controllers: [InternalPagesController, SitemapController, QuotationThankYouController, PagesViewController],
  providers: [PagesService, HomeRendererService]
})
export class PagesModule {}
