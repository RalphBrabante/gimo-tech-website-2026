import 'reflect-metadata';
import { randomBytes } from 'node:crypto';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { internalUiPath, storefrontPath } from './storefront-path';
import { publicDocumentMiddleware } from './common/public-document.middleware';
import { publicOrigin } from './common/public-site';
import { contentSecurityPolicy, publicSiteContentSecurityPolicy } from './common/content-security-policy';
import { productUploadsPath } from './products/product-upload.config';
import { contentUploadsPath } from './media/media-upload.config';
import { createNextMiddleware, isNestPath } from './next/next-handler';

const cacheableAssetPattern = /[\\/]assets[\\/]/;

/** Must run before NestFactory.create so the Next.js renderer and the API agree on the loopback origin. */
export function prepareRenderEnvironment(port: number): void {
  process.env.GIMO_INTERNAL_API_ORIGIN = `http://127.0.0.1:${port}`;
  process.env.GIMO_RENDER_TOKEN ||= randomBytes(32).toString('hex');
}

/**
 * HTTP pipeline shared by production (main.ts) and the database-free test fixture:
 * security headers → host/legacy rules → cached static assets → uploads → Next.js website,
 * with NestJS controllers handling /api, /internal, /health and /sitemap.xml.
 */
export async function configureHttp(app: NestExpressApplication, options: { dev: boolean; port: number }) {
  const { dev, port } = options;
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  const nestSecurity = helmet({ contentSecurityPolicy });
  const siteSecurity = helmet({ contentSecurityPolicy: publicSiteContentSecurityPolicy(dev) });
  app.use((request: Request, response: Response, next: NextFunction) => (isNestPath(request.path) ? nestSecurity : siteSecurity)(request, response, next));

  publicOrigin(); // Fail startup on a malformed configured public origin.
  app.use(publicDocumentMiddleware);

  // Long-lived caching for the public assets (fonts, images, robots.txt). Next.js would serve
  // them with max-age=0, which turns every page view into extra origin requests.
  app.useStaticAssets(storefrontPath, {
    index: false,
    fallthrough: true,
    setHeaders: (response, assetPath) => {
      response.setHeader('Cache-Control', cacheableAssetPattern.test(assetPath) ? 'public, max-age=604800, stale-while-revalidate=86400' : 'public, max-age=3600');
    }
  });
  // Internal dashboard stylesheets/scripts. HTML documents are served by authenticated controllers
  // and direct .html requests are refused by publicDocumentMiddleware.
  app.useStaticAssets(`${internalUiPath}/internal`, {
    prefix: '/internal',
    index: false,
    fallthrough: true,
    setHeaders: (response) => response.setHeader('Cache-Control', 'private, max-age=300')
  });
  // Uploaded media must be registered before controller routes.
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

  // Every non-NestJS path is a public website document rendered by Next.js (multi-page, SSR).
  const site = await createNextMiddleware({ dev, port, httpServer: app.getHttpServer() });
  app.use(site.middleware);

  if (process.env.CLIENT_ORIGIN) {
    app.enableCors({ origin: process.env.CLIENT_ORIGIN, credentials: true });
  }

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));
  return site;
}
