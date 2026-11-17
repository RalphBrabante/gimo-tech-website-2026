import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCatalogue } from '@/lib/api';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { pageMetadata, JsonLd, breadcrumbNode, webPageNode } from '@/lib/seo';
import { NYLON_PATH, absoluteUrl, productPath } from '@/lib/site';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductCard } from '@/components/ProductCard';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Product ranges with their own verified pages keep the catalogue useful when few records exist.
const RANGES = [
  { name: 'Nylon Syringe Filter 25mm 0.45µm', path: NYLON_PATH, text: 'Non-sterile 100-piece canister for HPLC sample preparation and general laboratory filtration.' },
  { name: 'Syringe Filters for HPLC Sample Preparation', path: '/syringe-filters', text: 'Compare Nylon, PTFE, PVDF and MCE membranes in the common 25 mm format.' },
  { name: 'Sequential QR Code Labels', path: '/sequential-qr-code-labels', text: '30 × 20 mm adhesive labels with unique QR codes and sequential numbering for tracking and inventory.' },
  { name: 'Customized Biohazard Bags with QR Code Printing', path: '/biohazard-bags', text: 'Printed identifiers, series-based layouts and QR code attachments for laboratory waste workflows.' }
];

/** "?page=N" with N ≥ 2 is a distinct, self-canonical document; anything else malformed is a 404. */
async function parsePage(searchParams: Props['searchParams']): Promise<number> {
  const raw = (await searchParams).page;
  if (raw === undefined) return 1;
  if (typeof raw !== 'string' || !/^[1-9]\d{0,5}$/.test(raw)) notFound();
  if (raw === '1') permanentRedirect('/products');
  return Number(raw);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = await parsePage(searchParams);
  const suffix = page > 1 ? ` — Page ${page}` : '';
  return pageMetadata({
    title: `Laboratory Supplies Catalogue Philippines${suffix}`,
    description: `Laboratory supplies from Gimo Tech Supplies: nylon syringe filters, sequential QR code labels and custom biohazard bags in the Philippines.${page > 1 ? ` Page ${page}.` : ' Request a quote.'}`,
    path: page > 1 ? `/products?page=${page}` : '/products'
  });
}

export default async function CataloguePage({ searchParams }: Props) {
  const page = await parsePage(searchParams);
  let catalogue: Awaited<ReturnType<typeof getCatalogue>> = null;
  let unavailable = false;
  try { catalogue = await getCatalogue(page); } catch { unavailable = true; }
  if (page > 1 && (unavailable || !catalogue || (page - 1) * catalogue.pageSize >= catalogue.total)) notFound();
  const products = catalogue?.products ?? [];
  const hasNext = !!catalogue && page * catalogue.pageSize < catalogue.total;
  const path = page > 1 ? `/products?page=${page}` : '/products';
  const label = `Laboratory Supplies Catalogue${page > 1 ? ` — Page ${page}` : ''}`;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Catalogue', path: '/products' }];
  const listed = [...(page === 1 ? RANGES.map((r) => ({ name: r.name, path: r.path })) : []), ...products.map((p) => ({ name: p.name, path: productPath(p) }))];

  return (
    <>
      <SiteAnalytics />
      <JsonLd nodes={[
        webPageNode('CollectionPage', label, 'Laboratory supplies catalogue', path, { mainEntity: { '@type': 'ItemList', itemListElement: listed.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: absoluteUrl(item.path) })) } }),
        breadcrumbNode(crumbs)
      ]} />
      <div className="page-hero">
        <div className="shell">
          <Breadcrumbs items={crumbs} />
          <h1 style={{ marginTop: '1.5rem' }}>{label}</h1>
          <p className="lede" style={{ maxWidth: '62ch' }}>Gimo Tech Supplies, also known as GIMO Laboratory Supplies, supplies syringe filters, sequential QR code labels and customized biohazard bags to laboratories and procurement teams in the Philippines. Pricing, packaging and availability are confirmed with each quotation.</p>
        </div>
      </div>

      {page === 1 && (
        <section className="section-tight" aria-labelledby="ranges-title" style={{ paddingTop: 0 }}>
          <div className="shell">
            <h2 id="ranges-title" className="title">Product ranges</h2>
            <div className="grid grid-4">
              {RANGES.map((range) => <a key={range.path} className="card card-link" href={range.path}><strong>{range.name}</strong><span>{range.text}</span></a>)}
            </div>
          </div>
        </section>
      )}

      <section className="section-tight bg-pale" aria-labelledby="items-title">
        <div className="shell">
          <h2 id="items-title" className="title">Catalogue items</h2>
          {products.length ? (
            <div className="grid grid-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          ) : (
            <p>{unavailable ? 'The catalogue is temporarily unavailable. ' : ''}Contact us for current product requirements, or start with the product ranges above.</p>
          )}
          {(page > 1 || hasNext) && (
            <nav className="pagination" aria-label="Catalogue pagination">
              {page > 1 ? <a className="btn btn-outline" href={page === 2 ? '/products' : `/products?page=${page - 1}`}>Previous page</a> : <span />}
              {hasNext && <a className="btn btn-outline" href={`/products?page=${page + 1}`}>Next page</a>}
            </nav>
          )}
        </div>
      </section>

      <section className="section-tight">
        <div className="shell">
          <aside className="callout" style={{ marginTop: 0 }}>
            <div><h2>Need a configuration that is not listed?</h2><p>Send the product, membrane, size, pack quantity and delivery destination. The supply team confirms what can be provided rather than assuming stock.</p></div>
            <a className="btn btn-primary" href="/request-for-a-quote">Request a quotation</a>
          </aside>
        </div>
      </section>
    </>
  );
}
