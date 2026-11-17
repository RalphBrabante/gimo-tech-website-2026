import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { HomepageModule } from '../homepage/homepage.module';
import { MenusModule } from '../menus/menus.module';
import { SettingsModule } from '../settings/settings.module';
import { PagesService } from '../pages/pages.service';
import { PageEntity } from '../pages/entities/page.entity';
import { PageBlockEntity } from '../pages/entities/page-block.entity';
import { PublicContentController } from './public-content.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity, PageBlockEntity]), ProductsModule, HomepageModule, MenusModule, SettingsModule],
  controllers: [PublicContentController],
  providers: [PagesService]
})
export class PublicContentModule {}
