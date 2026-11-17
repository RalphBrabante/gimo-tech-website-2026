import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cmsSlugs, getCmsPage } from '@/lib/content';
import type { CmsPage, PageBlock } from '@/lib/types';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { pageMetadata, JsonLd, breadcrumbNode, webPageNode } from '@/lib/seo';
import { metaDescription, publicHref, isExternal, siteOrigin } from '@/lib/site';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CONTACT_PAGES, BIOHAZARD_EXTRA } from '@/content/contact-pages';

type Props = { params: Promise<{ slug: string }> };

// Static export: exactly these pages exist; any other slug is a 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return [...cmsSlugs(), ...Object.keys(CONTACT_PAGES).filter((slug) => !cmsSlugs().includes(slug))].map((slug) => ({ slug }));
}

/** Administrator-managed CMS pages, plus built-in contact pages when no CMS page overrides them. */
async function resolve(params: Props['params']): Promise<{ kind: 'cms'; page: CmsPage } | { kind: 'contact'; slug: string }> {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  const page = getCmsPage(slug);
  if (page) return { kind: 'cms', page };
  if (CONTACT_PAGES[slug]) return { kind: 'contact', slug };
  notFound();
}

function description(page: CmsPage): string {
  return metaDescription(page.metaDescription?.trim() || page.blocks.find((b) => b.paragraphText?.trim())?.paragraphText || `${page.title}: product information and enquiries from Gimo Tech Supplies in the Philippines.`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await resolve(params);
  if (resolved.kind === 'contact') {
    const c = CONTACT_PAGES[resolved.slug];
    return pageMetadata({ title: c.title, absoluteTitle: true, description: c.description, path: `/${resolved.slug}` });
  }
  const { page } = resolved;
  const og = page.ogImageUrl && (page.ogImageUrl.startsWith('/') || page.ogImageUrl.startsWith(siteOrigin())) ? { url: page.ogImageUrl, alt: page.title } : undefined;
  return pageMetadata({ title: page.title, description: description(page), path: `/${page.slug}`, image: og });
}

function Block({ block, priority }: { block: PageBlock; priority: boolean }) {
  switch (block.blockType) {
    case 'heading':
      return block.headingLevel === 3 ? <h3>{block.headingText}</h3> : <h2>{block.headingText}</h2>;
    case 'paragraph':
      return <p>{block.paragraphText}</p>;
    case 'image':
      if (!block.imageUrl) return null;
      return <img className="cms-image" src={block.imageUrl} alt={block.imageAlt ?? ''}
        {...(block.imageSize ? { width: block.imageSize.width, height: block.imageSize.height } : { style: { aspectRatio: '4 / 3', objectFit: 'contain' as const } })}
        loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" />;
    case 'button': {
      if (!block.buttonHref) return null;
      const href = publicHref(block.buttonHref);
      return <a className="btn btn-primary" href={href} {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{block.buttonLabel}</a>;
    }
    default:
      return null;
  }
}

export default async function SlugPage({ params }: Props) {
  const resolved = await resolve(params);

  if (resolved.kind === 'contact') {
    const c = CONTACT_PAGES[resolved.slug];
    const path = `/${resolved.slug}`;
    const crumbs = [{ name: 'Home', path: '/' }, { name: c.heading, path }];
    return (
      <>
        <SiteAnalytics />
        <JsonLd nodes={[webPageNode(c.type, c.heading, c.description, path, { about: { '@id': `${siteOrigin()}/#organization` } }), breadcrumbNode(crumbs)]} />
        <div className="page-hero"><div className="shell-narrow"><Breadcrumbs items={crumbs} /><h1 style={{ marginTop: '1.5rem' }}>{c.heading}</h1><p className="lede">{c.lede}</p></div></div>
        <article className="shell-narrow prose section-tight" style={{ paddingTop: 0 }}>{c.body}</article>
      </>
    );
  }

  const { page } = resolved;
  const path = `/${page.slug}`;
  const crumbs = [{ name: 'Home', path: '/' }, { name: page.title, path }];
  const desc = description(page);
  return (
    <>
      <SiteAnalytics />
      <JsonLd nodes={[webPageNode('WebPage', page.title, desc, path), breadcrumbNode(crumbs)]} />
      <div className="page-hero"><div className="shell-narrow"><Breadcrumbs items={crumbs} /><h1 style={{ marginTop: '1.5rem' }}>{page.title}</h1></div></div>
      <article className="shell-narrow prose section-tight" style={{ paddingTop: 0 }}>
        {page.blocks.map((block, index) => <Block key={block.id} block={block} priority={index < 2} />)}
        {page.slug === 'biohazard-bags' && BIOHAZARD_EXTRA}
      </article>
    </>
  );
}
