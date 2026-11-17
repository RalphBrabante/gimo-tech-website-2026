import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/api';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { pageMetadata, JsonLd, breadcrumbNode, webPageNode } from '@/lib/seo';
import { BUSINESS, absoluteUrl, mailto, metaDescription, productPath } from '@/lib/site';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductGallery } from '@/components/ProductGallery';
import { AddToQuoteButton } from '@/components/quote/QuoteBag';

type Props = { params: Promise<{ id: string }> };

async function load(params: Props['params']) {
  const { id } = await params;
  if (!/^[1-9]\d{0,9}$/.test(id)) notFound();
  const product = await getProduct(Number(id));
  if (!product) notFound();
  return product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await load(params);
  const image = product.images[0]?.url ?? product.imageUrl;
  return pageMetadata({ title: product.name, description: metaDescription(`${product.name}: ${product.description}`), path: productPath(product), image: image ? { url: image, alt: product.name } : undefined });
}

export default async function ProductPage({ params }: Props) {
  const product = await load(params);
  const path = productPath(product);
  const url = absoluteUrl(path);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Catalogue', path: '/products' }, { name: product.name, path }];
  const description = metaDescription(`${product.name}: ${product.description}`);
  const image = product.images[0]?.url ?? product.imageUrl;

  return (
    <>
      {/* No price, rating or availability claims: the public site is quote-only. */}
      <SiteAnalytics />
      <JsonLd nodes={[
        webPageNode('ItemPage', product.name, description, path, { mainEntity: { '@id': `${url}#product` } }),
        { '@type': 'Product', '@id': `${url}#product`, name: product.name, description: product.description, sku: product.sku, url, ...(product.category ? { category: product.category } : {}), ...(product.images.length ? { image: product.images.map((i) => absoluteUrl(i.url)) } : {}) },
        breadcrumbNode(crumbs)
      ]} />
      <div className="shell"><Breadcrumbs items={crumbs} /></div>
      <section className="section-tight">
        <div className="shell split" style={{ alignItems: 'start' }}>
          {product.images.length ? <ProductGallery images={product.images} name={product.name} /> : <div className="gallery-main" style={{ background: product.accent, display: 'grid', placeItems: 'center', fontSize: '4rem', fontWeight: 800, color: 'var(--heading)' }} aria-hidden="true">{product.category.charAt(0)}</div>}
          <div>
            <p className="eyebrow">{product.category}</p>
            <h1 className="headline">{product.name}</h1>
            <p className="muted">SKU: {product.sku}</p>
            <p>{product.description}</p>
            <div className="btn-row" style={{ margin: '1.5rem 0' }}>
              <AddToQuoteButton product={{ id: product.id, name: product.name, sku: product.sku, category: product.category, imageUrl: image, accent: product.accent }}>Add to quotation bag</AddToQuoteButton>
              <a className="link-arrow" href={mailto(`Quotation request: ${product.name}`)}>Ask about this product</a>
            </div>
            <p className="small muted">Pricing, availability, and delivery options are confirmed in your quotation from {BUSINESS.name}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
