import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitialProductCatalog1760000000000 } from './migrations/1760000000000-initial-product-catalog';
import { CreateUsers1783741200000 } from './migrations/1783741200000-create-users';
import { ExpandProductsAndLinkUsers1783744800000 } from './migrations/1783744800000-expand-products-and-link-users';
import { CreateAppSettings1783748400000 } from './migrations/1783748400000-create-app-settings';
import { AppSettingsEntity } from '../settings/entities/app-settings.entity';
import { ProductImageEntity } from '../products/entities/product-image.entity';
import { CreateProductImages1783752000000 } from './migrations/1783752000000-create-product-images';
import { ProductEntity } from '../products/entities/product.entity';
import { UserEntity } from '../users/entities/user.entity';
import { HomepageSectionEntity } from '../homepage/entities/homepage-section.entity';
import { CreateHomepageSections1783755600000 } from './migrations/1783755600000-create-homepage-sections';
import { PageEntity } from '../pages/entities/page.entity';
import { CreatePages1783759200000 } from './migrations/1783759200000-create-pages';
import { PageBlockEntity } from '../pages/entities/page-block.entity';
import { CreatePageBlocks1783762800000 } from './migrations/1783762800000-create-page-blocks';
import { MenuItemEntity } from '../menus/entities/menu-item.entity';
import { CreateMenuItems1783766400000 } from './migrations/1783766400000-create-menu-items';
import { SeedMenuItems1783770000000 } from './migrations/1783770000000-seed-menu-items';
import { IntegrateBusinessLocation1783773600000 } from './migrations/1783773600000-integrate-business-location';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        charset: 'utf8mb4',
        entities: [ProductEntity, ProductImageEntity, UserEntity, AppSettingsEntity, HomepageSectionEntity, PageEntity, PageBlockEntity, MenuItemEntity],
        migrations: [
          InitialProductCatalog1760000000000,
          CreateUsers1783741200000,
          ExpandProductsAndLinkUsers1783744800000,
          CreateAppSettings1783748400000,
          CreateProductImages1783752000000,
          CreateHomepageSections1783755600000,
          CreatePages1783759200000,
          CreatePageBlocks1783762800000,
          CreateMenuItems1783766400000,
          SeedMenuItems1783770000000,
          IntegrateBusinessLocation1783773600000
        ],
        migrationsRun: config.get<boolean>('DB_RUN_MIGRATIONS', true),
        synchronize: false,
        retryAttempts: 5,
        retryDelay: 3000,
        ssl: config.get<boolean>('DB_SSL', false) ? { rejectUnauthorized: true } : undefined
      })
    })
  ]
})
export class DatabaseModule {}
