import type { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';

/**
 * The visitor's address for rate limiting.
 *
 * Production traffic reaches Node through Hostinger's CDN (Cloudflare-based) and its reverse proxy.
 * With `trust proxy = 1`, `req.ip` is the address of the hop *before* the last proxy, which is a
 * CDN edge address shared by many visitors. Keying the throttler on it puts unrelated visitors
 * (and the internal dashboard) into one bucket and produces HTTP 429 for everyone. The CDN sets
 * `CF-Connecting-IP`/`True-Client-IP` to the real visitor address and overwrites any client value.
 */
export function clientIp(request: Pick<Request, 'headers' | 'ip'> & { socket?: { remoteAddress?: string } }): string {
  for (const name of ['cf-connecting-ip', 'true-client-ip']) {
    const value = request.headers[name];
    const candidate = (Array.isArray(value) ? value[0] : value)?.trim();
    if (candidate && /^[0-9a-f:.]{2,45}$/i.test(candidate)) return candidate;
  }
  return request.ip || request.socket?.remoteAddress || 'unknown';
}

export const RENDER_TOKEN_HEADER = 'x-gimo-render-token';

/**
 * Server-side page renders call the public content API over loopback from the same process.
 * They all originate from 127.0.0.1, so they must not consume a visitor rate-limit bucket.
 * The per-process random token is never sent to browsers.
 */
export function isInternalRenderRequest(request: Pick<Request, 'headers'>): boolean {
  const expected = process.env.GIMO_RENDER_TOKEN;
  const supplied = request.headers[RENDER_TOKEN_HEADER];
  if (!expected || typeof supplied !== 'string' || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}
