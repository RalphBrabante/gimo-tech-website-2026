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

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity, PageBlockEntity]), AuthModule, PageRendererModule],
  controllers: [InternalPagesController, SitemapController, QuotationThankYouController, PagesViewController],
  providers: [PagesService]
})
export class PagesModule {}
