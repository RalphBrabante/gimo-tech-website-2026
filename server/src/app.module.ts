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
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerGuard } from './common/app-throttler.guard';
import { PublicContentModule } from './public-content/public-content.module';
import { SettingsModule } from './settings/settings.module';
import { productUploadsPath } from './products/product-upload.config';
import { HomepageModule } from './homepage/homepage.module';
import { MediaModule } from './media/media.module';
import { MenusModule } from './menus/menus.module';
import { PagesModule } from './pages/pages.module';
import { contentUploadsPath } from './media/media-upload.config';
import { QuotationsModule } from './quotations/quotations.module';
import { DeskModule } from './desk/desk.module';

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
        AUTH_SECRET: Joi.string().min(32).required(),
        PUBLIC_BASE_URL: Joi.string().uri({ scheme: ['http', 'https'] }).default('https://gimosupplies.com'),
        PUBLIC_ANALYTICS_ADAPTER: Joi.string().pattern(/^\/assets\/[a-zA-Z0-9/_-]+\.js$/).optional(),
        HOSTINGER_MAIL_API_TOKEN: Joi.string().min(20).optional(),
        HOSTINGER_MAILBOX_ADDRESS: Joi.string().email().default('sales@gimosupplies.com')
      })
    }),
    DatabaseModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    AuthModule,
    SettingsModule,
    ProductsModule,
    QuotationsModule,
    DeskModule,
    HomepageModule,
    MediaModule,
    MenusModule,
    PublicContentModule,
    ServeStaticModule.forRoot({
      rootPath: productUploadsPath,
      serveRoot: '/uploads/products',
      serveStaticOptions: { maxAge: '30d', fallthrough: false }
    }),
    ServeStaticModule.forRoot({
      rootPath: contentUploadsPath,
      serveRoot: '/uploads/content',
      serveStaticOptions: { maxAge: '30d', fallthrough: false }
    }),
    // PagesModule must be the last import: its ApiNotFoundController owns every unmatched
    // /api and /internal path, so anything registered after it would be unreachable.
    // Public website documents are rendered by Next.js (see main.ts), not by NestJS.
    PagesModule
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: AppThrottlerGuard }]
})
export class AppModule {}
