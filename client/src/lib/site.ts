import BUSINESS_JSON from '../../../server/src/common/public-business.json';

/** Single source of truth for public business identity (shared with the NestJS API). */
export const BUSINESS = BUSINESS_JSON;

export const NYLON_PATH = '/products/nylon-syringe-filter-25mm-045um';
export const MEMBRANE_GUIDE_PATH = '/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters';
export const PORE_SIZE_GUIDE_PATH = '/guides/0-22-vs-0-45-micron-syringe-filters';
export const LAZADA_NYLON_URL = 'https://www.lazada.com.ph/products/i3969520270.html';
export const SHOPEE_NYLON_URL = 'https://shopee.ph/product/229076897/50816380888/';
export const MAPS_URL = 'https://www.google.com/maps/place/GIMO+Laboratory+Supplies/@14.3808892,121.0679065,15z/data=!4m6!3m5!1s0x3397d1d871eba07b:0x8ca7e1b4bd2d5c7a!8m2!3d14.3723706!4d121.0582515!16s%2Fg%2F11jgc0gmss?entry=ttu';

export const ADDRESS_LINE = `${BUSINESS.streetAddress}, ${BUSINESS.locality}, ${BUSINESS.region} ${BUSINESS.postalCode}, Philippines`;

/** Canonical origin; never derived from request headers. */
export function siteOrigin(): string {
  const url = new URL(process.env.PUBLIC_BASE_URL || 'https://gimosupplies.com');
  return url.origin;
}

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteOrigin()}/`).toString();
}

export function productPath(product: { id: number }): string {
  return `/product/${product.id}`;
}

/** Cut at a word boundary so search snippets do not end mid-word. */
export function metaDescription(value: string, max = 160): string {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max / 2)).replace(/[\s,;:.–—-]+$/, '')}…`;
}

export function mailto(subject: string): string {
  return `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}`;
}

/** Legacy CMS hash links point at standalone pages now. */
export function publicHref(href: string): string {
  const replacements: Record<string, string> = { '#contact': '/contact-us', '/#contact': '/contact-us', '#shop': '/products', '/#shop': '/products', '#syringe-filters': '/syringe-filters', '#biohazard-bags': '/biohazard-bags' };
  return replacements[href] ?? href;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href) && !href.startsWith(siteOrigin());
}
