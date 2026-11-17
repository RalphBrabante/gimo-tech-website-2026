export const RESERVED_SLUGS = new Set([
  'api',
  'products',
  'product',
  'guides',
  'quotation-request-received',
  'health',
  'uploads',
  'internal',
  'assets',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  // Dedicated Next.js routes; a CMS page with these slugs would be unreachable.
  'syringe-filters',
  'sequential-qr-code-labels',
  '_next'
]);
