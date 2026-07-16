import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { storefrontPath } from './storefront-path';
import { productUploadsPath } from './products/product-upload.config';
import { contentUploadsPath } from './media/media-upload.config';

const hashedAssetPattern = /-[A-Z0-9]{8,}\.(?:css|js)$/i;
const cacheableAssetPattern = /[\\/]assets[\\/]/;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn', 'log'] : undefined
  });

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'"],
        frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com']
      }
    }
  }));

  // Register storefront files directly on Express before Nest installs controller
  // routes. Otherwise the CMS catch-all controller can claim asset requests and
  // return its HTML 404 page, leaving the Angular shell unable to bootstrap.
  app.useStaticAssets(storefrontPath, {
    index: false,
    fallthrough: true,
    setHeaders: (response, assetPath) => {
      response.setHeader(
        'Cache-Control',
        hashedAssetPattern.test(assetPath)
          ? 'public, max-age=31536000, immutable'
          : cacheableAssetPattern.test(assetPath)
            ? 'public, max-age=604800, stale-while-revalidate=86400'
            : 'public, max-age=3600'
      );
    }
  });

  // Uploaded media must be registered before controller routes. The public-page
  // catch-all otherwise treats an image URL as a missing HTML page.
  app.useStaticAssets(productUploadsPath, {
    prefix: '/uploads/products',
    fallthrough: false,
    setHeaders: (response) => response.setHeader('Cache-Control', 'public, max-age=2592000')
  });
  app.useStaticAssets(contentUploadsPath, {
    prefix: '/uploads/content',
    fallthrough: false,
    setHeaders: (response) => response.setHeader('Cache-Control', 'public, max-age=2592000')
  });

  if (process.env.NODE_ENV !== 'production' || process.env.CLIENT_ORIGIN) {
    app.enableCors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200',
      credentials: true
    });
  }

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  app.enableShutdownHooks();
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Gimo Tech NestJS API listening on port ${port}`);
}

void bootstrap();
