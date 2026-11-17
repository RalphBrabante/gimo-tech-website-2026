import type { Metadata } from 'next';
import { BUSINESS, absoluteUrl, siteOrigin } from './site';

export const DEFAULT_SOCIAL_IMAGE = { url: '/assets/products/nylon-syringe-filter-hero-1280.jpg', width: 1280, height: 1024, alt: 'Canister of 25mm 0.45 micron nylon syringe filters from Gimo Tech Supplies' };
export const QR_SOCIAL_IMAGE = { url: '/assets/products/sequential-qr-labels-hero-1280.jpg', width: 1280, height: 853, alt: 'Roll of white sequential QR code adhesive labels' };

interface PageSeo {
  title: string;
  /** Use the title exactly as given (it already carries the brand or is length-tuned). */
  absoluteTitle?: boolean;
  description: string;
  path: string | null;
  image?: { url: string; width?: number; height?: number; alt: string } | null;
  type?: 'website' | 'article';
  noindex?: boolean;
}

/** Unique title, description, canonical, Open Graph and Twitter metadata for one document. */
export function pageMetadata(seo: PageSeo): Metadata {
  const title = seo.absoluteTitle || seo.title.includes(BUSINESS.name) ? seo.title : `${seo.title} | ${BUSINESS.name}`;
  const image = seo.image ?? DEFAULT_SOCIAL_IMAGE;
  const images = [{ url: absoluteUrl(image.url), ...(image.width ? { width: image.width, height: image.height } : {}), alt: image.alt }];
  return {
    title: { absolute: title },
    description: seo.description,
    // Markdown copy for AI agents (generated at build by scripts/build-markdown.mjs).
    alternates: seo.path ? { canonical: absoluteUrl(seo.path), types: { 'text/markdown': seo.path === '/' ? '/index.md' : `${seo.path}.md` } } : undefined,
    robots: seo.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: seo.type ?? 'website',
      locale: 'en_PH',
      siteName: BUSINESS.name,
      title: seo.title,
      description: seo.description,
      ...(seo.path ? { url: absoluteUrl(seo.path) } : {}),
      images
    },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images }
  };
}

export function organizationGraph(): Record<string, unknown>[] {
  const origin = siteOrigin();
  return [
    {
      '@type': 'Organization', '@id': `${origin}/#organization`, name: BUSINESS.name, alternateName: BUSINESS.alternateName, url: `${origin}/`, email: BUSINESS.email,
      logo: { '@type': 'ImageObject', url: `${origin}/assets/brand/gimo-tech-supplies-logo-600.png`, width: 600, height: 200 },
      sameAs: [BUSINESS.lazadaShop, BUSINESS.shopeeShop],
      address: { '@type': 'PostalAddress', streetAddress: BUSINESS.streetAddress, addressLocality: BUSINESS.locality, addressRegion: BUSINESS.region, postalCode: BUSINESS.postalCode, addressCountry: 'PH' },
      contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: BUSINESS.email, areaServed: 'PH' },
      areaServed: { '@type': 'Country', name: 'Philippines' }
    },
    { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: BUSINESS.name, alternateName: BUSINESS.alternateName, inLanguage: 'en-PH', publisher: { '@id': `${origin}/#organization` } }
  ];
}

export function webPageNode(type: string, name: string, description: string, path: string, extra: Record<string, unknown> = {}) {
  const url = absoluteUrl(path);
  return { '@type': type, '@id': `${url}#webpage`, name, description, url, inLanguage: 'en-PH', isPartOf: { '@id': `${siteOrigin()}/#website` }, ...extra };
}

export interface Crumb { name: string; path: string }
export function breadcrumbNode(items: Crumb[]) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path) })) };
}

export function faqNode(faqs: { question: string; answer: string }[]) {
  return { '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
}

/** Safe in script text, including administrator-managed content. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** One JSON-LD graph per document: shared identity plus the page's own nodes. */
export function JsonLd({ nodes }: { nodes: Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({ '@context': 'https://schema.org', '@graph': [...organizationGraph(), ...nodes] }) }} />;
}
