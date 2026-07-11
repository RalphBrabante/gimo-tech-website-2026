import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemEntity } from './entities/menu-item.entity';
import { PageEntity } from '../pages/entities/page.entity';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { InternalMenusController } from './internal-menus.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItemEntity, PageEntity]), AuthModule],
  controllers: [MenusController, InternalMenusController],
  providers: [MenusService]
})
export class MenusModule {}
