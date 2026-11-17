import type { Metadata } from 'next';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { pageMetadata, JsonLd, breadcrumbNode, webPageNode } from '@/lib/seo';
import { BUSINESS, LAZADA_NYLON_URL, SHOPEE_NYLON_URL, absoluteUrl } from '@/lib/site';
import { RANGES } from '@/content/ranges';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const PATH = '/products';
const TITLE = 'Laboratory Supplies Catalogue Philippines';
const DESCRIPTION = 'Laboratory supplies from Gimo Tech Supplies: nylon syringe filters, sequential QR code labels and custom biohazard bags in the Philippines. Request a quote.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const crumbs = [{ name: 'Home', path: '/' }, { name: 'Catalogue', path: PATH }];

export default function CataloguePage() {
  return (
    <>
      <SiteAnalytics />
      <JsonLd nodes={[
        webPageNode('CollectionPage', TITLE, DESCRIPTION, PATH, { mainEntity: { '@type': 'ItemList', itemListElement: RANGES.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: absoluteUrl(item.path) })) } }),
        breadcrumbNode(crumbs)
      ]} />
      <div className="page-hero">
        <div className="shell">
          <Breadcrumbs items={crumbs} />
          <h1 style={{ marginTop: '1.5rem' }}>Laboratory Supplies Catalogue</h1>
          <p className="lede" style={{ maxWidth: '62ch' }}>Gimo Tech Supplies, also known as GIMO Laboratory Supplies, supplies syringe filters, sequential QR code labels and customized biohazard bags to laboratories and procurement teams in the Philippines. Pricing, packaging and availability are confirmed with each quotation.</p>
        </div>
      </div>

      <section className="section-tight" aria-labelledby="ranges-title" style={{ paddingTop: 0 }}>
        <div className="shell">
          <h2 id="ranges-title" className="title">Product ranges</h2>
          <div className="grid grid-4">
            {RANGES.map((range) => <a key={range.path} className="card card-link" href={range.path}><strong>{range.name}</strong><span>{range.text}</span></a>)}
          </div>
        </div>
      </section>

      <section className="section-tight bg-pale" aria-labelledby="online-title">
        <div className="shell">
          <h2 id="online-title" className="title">Order online</h2>
          <p>Ready-to-ship items can be ordered through our official marketplace shops.</p>
          <div className="btn-row">
            <a className="btn btn-outline" href={BUSINESS.lazadaShop} target="_blank" rel="noopener noreferrer">GIMO on Lazada <span aria-hidden="true">↗</span></a>
            <a className="btn btn-outline" href={BUSINESS.shopeeShop} target="_blank" rel="noopener noreferrer">GIMO on Shopee <span aria-hidden="true">↗</span></a>
            <a className="link-arrow" href={LAZADA_NYLON_URL} target="_blank" rel="noopener noreferrer">Nylon filters on Lazada</a>
            <a className="link-arrow" href={SHOPEE_NYLON_URL} target="_blank" rel="noopener noreferrer">Nylon filters on Shopee</a>
          </div>
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
