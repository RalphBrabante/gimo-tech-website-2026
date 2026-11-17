import { All, Controller, Res } from '@nestjs/common';
import type { Response } from 'express';

/**
 * Registered last (PagesModule is the final AppModule import). Public documents are rendered by
 * Next.js; only unmatched NestJS-owned paths reach these handlers.
 */
@Controller()
export class ApiNotFoundController {
  @All('api/{*splat}')
  apiNotFound(@Res() response: Response): void {
    response.status(404).json({ statusCode: 404, error: 'Not Found', message: 'API endpoint not found' });
  }

  @All('internal/{*splat}')
  internalNotFound(@Res() response: Response): void {
    response.status(404).setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.type('text/html').send('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Page not found</title><meta name="robots" content="noindex"></head><body><main><h1>Page not found</h1><a href="/internal/">Internal sign-in</a></main></body></html>');
  }
}
