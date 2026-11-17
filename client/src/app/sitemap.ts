import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { cmsSlugs } from '@/lib/content';

export const dynamic = 'force-static';

/** Every indexable public document. Keep in sync when adding pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', '/products', '/products/nylon-syringe-filter-25mm-045um', '/syringe-filters', '/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters', '/guides/0-22-vs-0-45-micron-syringe-filters', '/sequential-qr-code-labels', '/contact-us', '/about-gimo', '/request-for-a-quote', ...cmsSlugs().map((slug) => `/${slug}`)];
  return [...new Set(paths)].map((path) => ({ url: absoluteUrl(path) }));
}
