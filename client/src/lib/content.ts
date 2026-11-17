import type { CmsPage, HomepageContent, PublicMenus } from './types';
import { FALLBACK_HOMEPAGE, FALLBACK_MENUS } from '@/content/fallbacks';
import menusSnapshot from '@/content/snapshot/menus.json';
import homepageSnapshot from '@/content/snapshot/homepage.json';
import pagesSnapshot from '@/content/snapshot/pages.json';
import { publicHref } from './site';

/**
 * Static content for the exported website. Everything is read at build time from
 * `src/content/snapshot/` (the live CMS content exported on 17 Nov 2026), so the deployed site
 * has no API, database or server process that could fail. Edit the JSON and rebuild to change it.
 */

export function getMenus(): PublicMenus {
  const menus = (menusSnapshot as PublicMenus).header?.length ? (menusSnapshot as PublicMenus) : FALLBACK_MENUS;
  const fix = (links: PublicMenus['header']) => links.map((link) => ({ ...link, href: publicHref(link.href) }));
  return { header: fix(menus.header), footer: { products: fix(menus.footer.products), services: fix(menus.footer.services), purchasing: fix(menus.footer.purchasing) } };
}

/** Snapshot sections replace defaults section by section; empty sections keep defaults. */
export function getHomepage(): HomepageContent {
  const content = homepageSnapshot as Partial<HomepageContent>;
  const merged = { ...FALLBACK_HOMEPAGE };
  for (const key of Object.keys(FALLBACK_HOMEPAGE) as (keyof HomepageContent)[]) {
    const section = content[key];
    if (section && Object.keys(section).length) Object.assign(merged, { [key]: section });
  }
  return merged;
}

const PAGES = pagesSnapshot as unknown as Record<string, CmsPage>;

export function getCmsPage(slug: string): CmsPage | null {
  return PAGES[slug] ?? null;
}

/** CMS-style pages rendered by the generic `[slug]` route (dedicated routes are excluded). */
export function cmsSlugs(): string[] {
  return Object.keys(PAGES).filter((slug) => slug !== 'syringe-filters');
}
