import type { Request, Response, NextFunction } from 'express';
import { publicOrigin } from './public-site';

export function publicDocumentMiddleware(request: Request, response: Response, next: NextFunction): void {
  const path = request.path;
  if (/^\/(?:index(?:\.csr)?\.html|dashboard(?:\/|$))/.test(path)) {
    response.status(404).type('text/html').send('<!doctype html><html lang="en"><head><title>Page not found | Gimo Tech Supplies</title><meta name="robots" content="noindex"></head><body><main><h1>Page not found</h1><a href="/">Gimo Tech Supplies home</a></main></body></html>'); return;
  }
  if (/^\/internal(?:\/|$)/.test(path)) {
    response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    if (path.endsWith('.html')) { response.status(404).type('text/html').send('<!doctype html><html lang="en"><head><title>Page not found</title><meta name="robots" content="noindex"></head><body><main><h1>Page not found</h1></main></body></html>'); return; }
  }
  const origin = publicOrigin();
  // Only the observed www alias, only public document GET/HEAD. HTTPS is already enforced by the edge.
  if (['GET', 'HEAD'].includes(request.method) && request.hostname === `www.${new URL(origin).hostname}` && !/^\/(?:api|internal|health|uploads|assets)(?:\/|$)/.test(path) && !/\.[a-z0-9]+$/i.test(path)) {
    response.redirect(301, `${origin}${request.originalUrl}`); return;
  }
  next();
}
export function redirectTrailingSlash(request: Request, response: Response): boolean {
  if (request.path.length > 1 && request.path.endsWith('/')) {
    response.redirect(301, `${request.path.replace(/\/+$/, '')}${request.originalUrl.includes('?') ? request.originalUrl.slice(request.originalUrl.indexOf('?')) : ''}`); return true;
  }
  return false;
}
