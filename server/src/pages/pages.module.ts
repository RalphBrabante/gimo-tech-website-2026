import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageEntity } from './entities/page.entity';
import { PageBlockEntity } from './entities/page-block.entity';
import { MenuItemEntity } from '../menus/entities/menu-item.entity';
import { PagesService } from './pages.service';
import { PageRendererService } from './page-renderer.service';
import { InternalPagesController } from './internal-pages.controller';
import { SitemapController } from './sitemap.controller';
import { PagesViewController } from './pages-view.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity, PageBlockEntity, MenuItemEntity]), AuthModule],
  controllers: [InternalPagesController, SitemapController, PagesViewController],
  providers: [PagesService, PageRendererService]
})
export class PagesModule {}
