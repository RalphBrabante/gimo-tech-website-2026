import 'server-only';
import { cache } from 'react';
import type { CmsPage, HomepageContent, PublicMenus, PublicProduct, StoreSettings } from './types';
import { FALLBACK_HOMEPAGE, FALLBACK_MENUS } from '@/content/fallbacks';
import { publicHref } from './site';

/**
 * Server-side reads from the NestJS public content API, which runs in the same Node process.
 *
 * A short in-memory cache means a burst of page views (crawlers, ad review, campaign launches)
 * costs one database read per endpoint every few seconds instead of one per request. On API
 * failure the last good response is served; with nothing cached, callers get their fallback.
 */
const TTL_MS = 30_000;
const memo = new Map<string, { at: number; value: unknown }>();

class ApiError extends Error {
  constructor(readonly status: number, path: string) { super(`Public API ${path} responded ${status}`); }
}

async function get<T>(path: string): Promise<T> {
  const hit = memo.get(path);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
  const origin = process.env.GIMO_INTERNAL_API_ORIGIN ?? `http://127.0.0.1:${process.env.PORT ?? 3000}`;
  try {
    const response = await fetch(`${origin}${path}`, {
      cache: 'no-store',
      headers: { accept: 'application/json', 'x-gimo-render-token': process.env.GIMO_RENDER_TOKEN ?? '' },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new ApiError(response.status, path);
    const value = (await response.json()) as T;
    memo.set(path, { at: Date.now(), value });
    if (memo.size > 500) memo.delete(memo.keys().next().value!);
    return value;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) throw error;
    if (hit) return hit.value as T; // Stale but valid content beats an error page.
    throw error;
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export interface SiteData { menus: PublicMenus; settings: StoreSettings | null }

export const getSite = cache(async (): Promise<SiteData> => {
  try {
    const data = await get<{ menus: PublicMenus | null; settings: StoreSettings | null }>('/api/public/site');
    const menus = data.menus?.header.length ? data.menus : FALLBACK_MENUS;
    return { menus: normaliseMenus(menus), settings: data.settings };
  } catch {
    return { menus: FALLBACK_MENUS, settings: null };
  }
});

export const getHome = cache(async (): Promise<{ homepage: HomepageContent; products: PublicProduct[]; catalogueUnavailable: boolean }> => {
  try {
    const data = await get<{ homepage: Partial<HomepageContent> | null; products: PublicProduct[]; catalogueUnavailable: boolean }>('/api/public/home');
    return { homepage: mergeHomepage(data.homepage), products: data.products, catalogueUnavailable: data.catalogueUnavailable };
  } catch {
    return { homepage: FALLBACK_HOMEPAGE, products: [], catalogueUnavailable: true };
  }
});

/** Returns null for a page beyond the catalogue; throws when the catalogue is unavailable. */
export const getCatalogue = cache(async (page: number) => {
  try {
    return await get<{ page: number; pageSize: number; total: number; products: PublicProduct[] }>(`/api/public/catalogue?page=${page}`);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
});

export const getProduct = cache(async (id: number): Promise<PublicProduct | null> => {
  try {
    return await get<PublicProduct>(`/api/public/products/${id}`);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
});

export const getCmsPage = cache(async (slug: string): Promise<CmsPage | null> => {
  try {
    return await get<CmsPage>(`/api/public/pages/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
});

function normaliseMenus(menus: PublicMenus): PublicMenus {
  const fix = (links: PublicMenus['header']) => links.map((link) => ({ ...link, href: publicHref(link.href) }));
  return { header: fix(menus.header), footer: { products: fix(menus.footer.products), services: fix(menus.footer.services), purchasing: fix(menus.footer.purchasing) } };
}

/** Administrator-edited sections replace defaults section by section; empty sections keep defaults. */
function mergeHomepage(content: Partial<HomepageContent> | null): HomepageContent {
  const merged = { ...FALLBACK_HOMEPAGE };
  for (const key of Object.keys(FALLBACK_HOMEPAGE) as (keyof HomepageContent)[]) {
    const section = content?.[key];
    if (section && Object.keys(section).length) Object.assign(merged, { [key]: section });
  }
  merged.location = { ...merged.location, description: merged.location.description.replace('Brgy., ', ''), tagline: merged.location.tagline.replace('Visit GIMO', 'GIMO') };
  return merged;
}
