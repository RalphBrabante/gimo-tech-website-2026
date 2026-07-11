import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'node:path';
import * as Joi from 'joi';
import { HealthController } from './health.controller';
import { ProductsModule } from './products/products.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SettingsModule } from './settings/settings.module';
import { productUploadsPath } from './products/product-upload.config';

const storefrontPath = resolve(__dirname, '../../client/dist/client/browser');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [resolve(__dirname, '../../.env'), resolve(__dirname, '../.env')],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().port().default(3000),
        CLIENT_ORIGIN: Joi.string().uri().optional(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().port().default(3306),
        DB_NAME: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_SSL: Joi.boolean().default(false),
        DB_RUN_MIGRATIONS: Joi.boolean().default(true),
        AUTH_SECRET: Joi.string().min(32).required()
      })
    }),
    DatabaseModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    AuthModule,
    SettingsModule,
    ProductsModule,
    ServeStaticModule.forRoot({
      rootPath: storefrontPath,
      exclude: [
        '/api/{*splat}',
        '/health',
        '/uploads/{*splat}',
        '/internal/dashboard',
        '/internal/dashboard/',
        '/internal/dashboard/{*splat}',
        '/internal/products',
        '/internal/products/',
        '/internal/products/{*splat}',
        '/internal/settings',
        '/internal/settings/',
        '/internal/settings/{*splat}'
      ]
    }),
    ServeStaticModule.forRoot({
      rootPath: productUploadsPath,
      serveRoot: '/uploads/products',
      serveStaticOptions: { maxAge: '30d', fallthrough: false }
    })
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
