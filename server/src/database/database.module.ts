import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitialProductCatalog1760000000000 } from './migrations/1760000000000-initial-product-catalog';
import { ProductEntity } from '../products/entities/product.entity';

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
        entities: [ProductEntity],
        migrations: [InitialProductCatalog1760000000000],
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
