import type { IncomingMessage, Server, ServerResponse } from 'node:http';
import type { Duplex } from 'node:stream';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { clientPath } from '../storefront-path';

type NextRequestHandler = (request: IncomingMessage, response: ServerResponse) => Promise<void>;
type NextUpgradeHandler = (request: IncomingMessage, socket: Duplex, head: Buffer) => Promise<void>;
interface NextServer {
  prepare(): Promise<void>;
  getRequestHandler(): NextRequestHandler;
  getUpgradeHandler?(): NextUpgradeHandler;
  close?(): Promise<void>;
}

/**
 * Paths owned by NestJS. Everything else is a public website document or asset rendered by Next.js.
 * Keep this in sync with `client/next.config.ts` and robots.txt.
 */
const NEST_PATH = /^\/(?:api|internal|uploads|health|sitemap\.xml)(?:\/|$)/;
export function isNestPath(path: string): boolean {
  return NEST_PATH.test(path);
}

/**
 * Public HTML is identical for every visitor (no cookies, no personalisation), so the CDN may cache
 * it briefly. Next.js marks dynamically rendered pages `private, no-store`, which forces every
 * request — including crawler and ad-review bursts — through to this single Node process. A short
 * shared cache keeps repeat traffic at Hostinger's edge, which is the main defence against 429s.
 */
const PUBLIC_DOCUMENT_CACHE = 'public, max-age=0, s-maxage=120, stale-while-revalidate=600';
const NEVER_CACHE = /^\/(?:quotation-request-received)(?:\/|$)/;

export function shareableDocumentCache(request: Request, response: Response): void {
  if (!['GET', 'HEAD'].includes(request.method) || NEVER_CACHE.test(request.path)) return;
  // React Server Component payloads and prefetches vary by request header; never share them.
  if (request.headers.rsc || request.headers['next-router-prefetch'] || request.headers['next-action']) return;
  // Administrators browse the public site too; keep their responses out of the shared cache.
  if (/(?:^|;\s*)gimo_internal_session=/.test(String(request.headers.cookie ?? ''))) return;
  const setHeader = response.setHeader.bind(response);
  response.setHeader = ((name: string, value: number | string | readonly string[]) => {
    if (name.toLowerCase() === 'cache-control' && typeof value === 'string' && value.startsWith('private, no-cache, no-store')
      && response.statusCode === 200 && String(response.getHeader('content-type') ?? 'text/html').includes('text/html')) {
      return setHeader(name, PUBLIC_DOCUMENT_CACHE);
    }
    return setHeader(name, value);
  }) as Response['setHeader'];
}

export async function createNextMiddleware(options: { dev: boolean; port: number; httpServer: Server }) {
  const requireFromClient = createRequire(resolve(clientPath, 'package.json'));
  const nextModule = requireFromClient('next') as { default?: (options: object) => NextServer } & ((options: object) => NextServer);
  const createNext = nextModule.default ?? nextModule;
  const app = createNext({ dev: options.dev, dir: clientPath, port: options.port, httpServer: options.httpServer, quiet: !options.dev });
  await app.prepare();
  const handle = app.getRequestHandler();
  const upgrade = app.getUpgradeHandler?.();

  // Development hot reload uses WebSockets on /_next/webpack-hmr.
  if (options.dev && upgrade) {
    options.httpServer.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      if (request.url?.startsWith('/_next/')) void upgrade(request, socket, head);
    });
  }

  const middleware = (request: Request, response: Response, next: NextFunction): void => {
    if (isNestPath(request.path)) { next(); return; }
    if (!options.dev) shareableDocumentCache(request, response);
    handle(request, response).catch(next);
  };
  return { middleware, close: () => app.close?.() };
}
