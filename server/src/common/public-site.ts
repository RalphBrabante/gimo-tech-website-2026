// Public identity already used by the site. No inferred legal name, hours or availability.
export function publicOrigin(): string {
  const url = new URL(process.env.PUBLIC_BASE_URL || 'https://gimosupplies.com');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('PUBLIC_BASE_URL must be a public HTTP(S) origin');
  return url.origin;
}
export const NYLON_PRODUCT_PATH = '/products/nylon-syringe-filter-25mm-045um';
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
    { '@type': 'Organization', '@id': `${origin}/#organization`, name: BUSINESS.name, alternateName: BUSINESS.alternateName, url: `${origin}/`, email: BUSINESS.email, logo: `${origin}/assets/brand/gimo-tech-supplies-logo-600.png`, sameAs: [BUSINESS.lazadaShop], address: { '@type': 'PostalAddress', streetAddress: BUSINESS.streetAddress, addressLocality: BUSINESS.locality, addressRegion: BUSINESS.region, postalCode: BUSINESS.postalCode, addressCountry: 'PH' } },
    { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: BUSINESS.name, publisher: { '@id': `${origin}/#organization` } }
  ];
}

/** Optional owner-provided same-origin consent/measurement adapter. */
export function analyticsAdapterPath(): string | null {
  const path = process.env.PUBLIC_ANALYTICS_ADAPTER;
  return path && /^\/assets\/[a-zA-Z0-9/_-]+\.js$/.test(path) && !path.includes('..') ? path : null;
}
