import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'node:path';
import * as Joi from 'joi';
import { HealthController } from './health.controller';
import { ProductsModule } from './products/products.module';
import { DatabaseModule } from './database/database.module';

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
        DB_RUN_MIGRATIONS: Joi.boolean().default(true)
      })
    }),
    DatabaseModule,
    ProductsModule,
    ServeStaticModule.forRoot({
      rootPath: storefrontPath,
      exclude: ['/api/{*splat}', '/health']
    })
  ],
  controllers: [HealthController]
})
export class AppModule {}
