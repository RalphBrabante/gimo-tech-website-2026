import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemEntity } from '../menus/entities/menu-item.entity';
import { PageRendererService } from './page-renderer.service';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItemEntity])],
  providers: [PageRendererService],
  exports: [PageRendererService]
})
export class PageRendererModule {}
