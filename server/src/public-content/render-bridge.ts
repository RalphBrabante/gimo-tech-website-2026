import { HttpException, type INestApplicationContext } from '@nestjs/common';
import { PublicContentController } from './public-content.controller';

export interface RenderBridgeResult { status: number; body: unknown }
export interface RenderBridge { get(path: string): Promise<RenderBridgeResult> }

declare global {
  // eslint-disable-next-line no-var
  var __gimoPublicContent: RenderBridge | undefined;
}

/**
 * In-process access to the public content API for the Next.js renderer, which runs inside this
 * Node process. Server-side pages must not call the API over loopback HTTP: on Hostinger the
 * app runs behind a process manager, so nothing listens on 127.0.0.1:$PORT and every loopback
 * request fails (pages fell back to "catalogue unavailable" and CMS pages returned 500).
 * Same controller, same validation and error semantics as `GET /api/public/*`.
 */
export function registerRenderBridge(app: INestApplicationContext): void {
  const controller = app.get(PublicContentController, { strict: false });
  const routes: [RegExp, (match: RegExpMatchArray, query: URLSearchParams) => Promise<unknown>][] = [
    [/^\/api\/public\/site$/, () => controller.site()],
    [/^\/api\/public\/home$/, () => controller.home()],
    [/^\/api\/public\/catalogue$/, (_m, query) => controller.catalogue(query.get('page') ?? undefined)],
    [/^\/api\/public\/products\/([^/]+)$/, (m) => controller.product(decodeURIComponent(m[1]))],
    [/^\/api\/public\/pages\/([^/]+)$/, (m) => controller.page(decodeURIComponent(m[1]))]
  ];
  globalThis.__gimoPublicContent = {
    async get(path: string): Promise<RenderBridgeResult> {
      const url = new URL(path, 'http://render.local');
      for (const [pattern, handler] of routes) {
        const match = url.pathname.match(pattern);
        if (!match) continue;
        try {
          // JSON round-trip gives the renderer exactly what the HTTP API would return (dates as strings).
          return { status: 200, body: JSON.parse(JSON.stringify(await handler(match, url.searchParams))) };
        } catch (error) {
          if (error instanceof HttpException) return { status: error.getStatus(), body: error.getResponse() };
          throw error;
        }
      }
      return { status: 404, body: { message: 'Unknown public content route' } };
    }
  };
}
