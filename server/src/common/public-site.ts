// Public identity already used by the site. No inferred legal name, hours or availability.
export function publicOrigin(): string {
  const url = new URL(process.env.PUBLIC_BASE_URL || 'https://gimosupplies.com');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('PUBLIC_BASE_URL must be a public HTTP(S) origin');
  return url.origin;
}
export const NYLON_PRODUCT_PATH = '/products/nylon-syringe-filter-25mm-045um';
export const PORE_SIZE_GUIDE_PATH = '/guides/0-22-vs-0-45-micron-syringe-filters';
/** Fixed public routes rendered by Next.js (client/src/app). Keep in sync when adding pages. */
export const PUBLIC_ROUTES = ['/', '/products', NYLON_PRODUCT_PATH, '/syringe-filters', '/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters', PORE_SIZE_GUIDE_PATH, '/sequential-qr-code-labels', '/contact-us', '/about-gimo', '/request-for-a-quote'];
export { default as BUSINESS } from './public-business.json';
import BUSINESS from './public-business.json';

// No verified SKU/configuration mapping is available. Numeric URLs stay distinct.
export function productPath(product: { id: number }): string { return `/product/${product.id}`; }
export function publicHref(href: string): string {
  const replacements: Record<string, string> = { '#contact': '/contact-us', '/#contact': '/contact-us', '#shop': '/products', '/#shop': '/products', '#syringe-filters': '/syringe-filters', '#biohazard-bags': '/biohazard-bags' };
  return replacements[href] || href;
}
export function identityGraph(): Record<string, unknown>[] {
  const origin = publicOrigin();
  return [
    { '@type': 'Organization', '@id': `${origin}/#organization`, name: BUSINESS.name, alternateName: BUSINESS.alternateName, url: `${origin}/`, email: BUSINESS.email, logo: { '@type': 'ImageObject', url: `${origin}/assets/brand/gimo-tech-supplies-logo-600.png`, width: 600, height: 200 }, sameAs: [BUSINESS.lazadaShop, BUSINESS.shopeeShop], address: { '@type': 'PostalAddress', streetAddress: BUSINESS.streetAddress, addressLocality: BUSINESS.locality, addressRegion: BUSINESS.region, postalCode: BUSINESS.postalCode, addressCountry: 'PH' }, contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: BUSINESS.email, areaServed: 'PH' }, areaServed: { '@type': 'Country', name: 'Philippines' } },
    { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: BUSINESS.name, alternateName: BUSINESS.alternateName, inLanguage: 'en-PH', publisher: { '@id': `${origin}/#organization` } }
  ];
}

/** Meta descriptions are cut at a word boundary so search snippets do not end mid-word. */
export function metaDescription(value: string, max = 160): string {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max / 2)).replace(/[\s,;:.–—-]+$/, '')}…`;
}

/** Visible breadcrumb trail plus the matching BreadcrumbList node; the last item is the current page. */
export function breadcrumbs(items: { name: string; path: string }[]): { html: string; jsonLd: Record<string, unknown> } {
  const origin = publicOrigin();
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const html = `<nav class="breadcrumb" aria-label="Breadcrumb">${items.map((item, index) => index === items.length - 1 ? `<span aria-current="page">${escape(item.name)}</span>` : `<a href="${escape(item.path)}">${escape(item.name)}</a><span aria-hidden="true">/</span>`).join('')}</nav>`;
  return { html, jsonLd: { '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: `${origin}${item.path}` })) } };
}

/** Optional owner-provided same-origin consent/measurement adapter. */
export function analyticsAdapterPath(): string | null {
  const path = process.env.PUBLIC_ANALYTICS_ADAPTER;
  return path && /^\/assets\/[a-zA-Z0-9/_-]+\.js$/.test(path) && !path.includes('..') ? path : null;
}
