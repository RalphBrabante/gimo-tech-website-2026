import type { Metadata } from 'next';
import { getCmsPage } from '@/lib/api';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { pageMetadata, JsonLd, breadcrumbNode, webPageNode, DEFAULT_SOCIAL_IMAGE } from '@/lib/seo';
import { BUSINESS, LAZADA_NYLON_URL, SHOPEE_NYLON_URL, MEMBRANE_GUIDE_PATH, NYLON_PATH, PORE_SIZE_GUIDE_PATH, absoluteUrl, metaDescription } from '@/lib/site';
import { MEMBRANES } from '@/content/nylon';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Picture, NYLON_PHOTO } from '@/components/Picture';
import { FilterScene } from '@/components/three/FilterScene';

const PATH = '/syringe-filters';
const DEFAULT_TITLE = 'Syringe Filters for HPLC Sample Preparation';
const DEFAULT_DESCRIPTION = 'Laboratory syringe filter supplier in the Philippines. Nylon, PTFE, PVDF and MCE syringe filters for HPLC sample preparation, incl. 25mm 0.45 micron nylon.';
const DEFAULT_INTRO = 'Gimo Tech Supplies provides syringe filters for routine HPLC sample preparation, sample clarification, and laboratory filtration workflows. Available membrane options include Nylon, PTFE, PVDF, and MCE.';

async function content() {
  // Title, description and intro stay editable in the CMS page "syringe-filters".
  const page = await getCmsPage('syringe-filters').catch(() => null);
  return {
    title: page?.title || DEFAULT_TITLE,
    description: metaDescription(page?.metaDescription?.trim() || DEFAULT_DESCRIPTION),
    intro: page?.blocks.find((block) => block.blockType === 'paragraph' && block.paragraphText?.trim())?.paragraphText ?? DEFAULT_INTRO
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await content();
  return pageMetadata({ title, description, path: PATH, image: DEFAULT_SOCIAL_IMAGE });
}

const crumbs = [{ name: 'Home', path: '/' }, { name: 'Syringe Filters', path: PATH }];

export default async function SyringeFiltersPage() {
  const { title, description, intro } = await content();
  return (
    <>
      <SiteAnalytics />
      <JsonLd nodes={[
        webPageNode('CollectionPage', title, description, PATH, {
          primaryImageOfPage: absoluteUrl(DEFAULT_SOCIAL_IMAGE.url),
          mainEntity: { '@type': 'ItemList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Nylon Syringe Filter 25mm 0.45µm', url: absoluteUrl(NYLON_PATH) }] }
        }),
        breadcrumbNode(crumbs)
      ]} />

      <section className="hero" aria-labelledby="sf-title">
        <div className="shell"><Breadcrumbs items={crumbs} /></div>
        <div className="shell" style={{ paddingTop: 'clamp(20px, 4vw, 40px)' }}>
          <p className="eyebrow">Precision sample preparation</p>
          <h1 id="sf-title" className="display">{title}</h1>
          <p className="lede">{intro}</p>
          <div className="btn-row center">
            <a className="btn btn-primary" href={NYLON_PATH}>View the nylon syringe filter</a>
            <a className="btn btn-outline" href={LAZADA_NYLON_URL} target="_blank" rel="noopener noreferrer">Shop on Lazada <span aria-hidden="true">↗</span></a>
            <a className="btn btn-outline" href={SHOPEE_NYLON_URL} target="_blank" rel="noopener noreferrer">Shop on Shopee <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="hero-visual">
          <FilterScene mode="hero" label="Interactive 3D model of a yellow 25 millimetre nylon syringe filter"
            fallback={<Picture {...NYLON_PHOTO} alt="Canister of GIMO 25 millimetre 0.45 micron nylon syringe filters" sizes="(max-width: 700px) 70vw, 520px" priority />} />
        </div>
      </section>

      <section className="section-tight" aria-labelledby="sf-proof-title">
        <div className="shell">
          <h2 id="sf-proof-title" className="sr-only">Syringe filter options at a glance</h2>
          <div className="highlights">
            {[{ v: '4', u: '', l: 'Membranes: Nylon, PTFE, PVDF, MCE' }, { v: '25', u: 'mm', l: 'Common laboratory diameter' }, { v: '0.45', u: 'µm', l: 'Verified nylon pore size' }, { v: 'PH', u: '', l: 'Delivery enquiries nationwide' }].map((item, index) => (
              <div key={item.l} className="highlight" data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.08}s` }}>
                <span className="highlight-value">{item.v}{item.u && <small>{item.u}</small>}</span><p>{item.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-pale" aria-labelledby="sf-membranes-title">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Membrane selection</p>
            <h2 id="sf-membranes-title" className="headline">Match the filter to your method.</h2>
            <p>Selection depends on the complete sample composition, solvent system, analytes, sterility needs, and validated laboratory method. These categories are a starting point, not a substitute for manufacturer compatibility data.</p>
          </div>
          <div className="compare">
            {MEMBRANES.map((membrane, index) => (
              <article key={membrane.key} className={`compare-col${membrane.key === 'nylon' ? ' is-current' : ''}`} data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.06}s` }}>
                <span className="swatch" style={{ ['--swatch' as string]: membrane.color }} aria-hidden="true" />
                <h3>{membrane.name} syringe filter</h3>
                <p className="muted small">{membrane.role}</p>
                <dl>
                  <div><dt>Typical positioning</dt><dd>{membrane.fit}</dd></div>
                  <div><dt>Before you order</dt><dd>{membrane.check}</dd></div>
                </dl>
                {membrane.key === 'nylon' && <p style={{ marginTop: '1rem' }}><a className="link-arrow" href={NYLON_PATH}>View 25mm 0.45 µm nylon</a></p>}
              </article>
            ))}
          </div>
          <p className="center small muted" style={{ marginTop: '1.5rem' }}>Product availability, packaging, and suitability are confirmed for each enquiry.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="sf-flow-title">
        <div className="shell split">
          <div>
            <p className="eyebrow">Syringe filter for HPLC</p>
            <h2 id="sf-flow-title" className="headline">A compact path from sample to analysis.</h2>
            <ol className="grid" style={{ listStyle: 'none', padding: 0 }}>
              {[
                ['01', 'Load the sample', 'Connect the selected filter using the inlet and outlet format specified by the applicable manufacturer documentation.'],
                ['02', 'Pass through the membrane', 'The membrane choice and pore size must align with your sample, solvent, analyte, and validated procedure.'],
                ['03', 'Collect for the next step', 'Use the filtrate according to your laboratory method and instrument-preparation requirements.']
              ].map(([n, h, p]) => (
                <li key={n} className="card" data-reveal><span className="tag">{n}</span><h3>{h}</h3><p>{p}</p></li>
              ))}
            </ol>
          </div>
          <a className="tile tile-blue" href={NYLON_PATH} data-reveal="scale" style={{ minHeight: 'auto' }}>
            <p className="eyebrow">Featured configuration</p>
            <h3>25 mm 0.45 µm Nylon</h3>
            <p>Non-sterile canister of 100 pieces for HPLC sample preparation.</p>
            <div className="btn-row"><span className="link-arrow">Review product details</span></div>
            <div className="tile-media"><Picture {...NYLON_PHOTO} alt="Canister of GIMO 25 millimetre 0.45 micron nylon syringe filters" sizes="(max-width: 900px) 90vw, 440px" /></div>
          </a>
        </div>
      </section>

      <section className="section bg-blue" aria-labelledby="sf-supplier-title">
        <div className="shell-narrow center">
          <p className="eyebrow">Laboratory syringe filter supplier</p>
          <h2 id="sf-supplier-title" className="headline">Syringe filters for laboratories across the Philippines.</h2>
          <p>{BUSINESS.name} (GIMO Laboratory Supplies) works with purchasing departments, researchers, schools, universities, clinics and industrial laboratories. Share your method, sample system, quantity and destination, and we confirm packaging, availability and delivery instead of assuming compatibility or stock.</p>
          <div className="btn-row center">
            <a className="btn btn-primary" href="/request-for-a-quote">Request a quotation</a>
            <a className="link-arrow" href={MEMBRANE_GUIDE_PATH}>Compare membranes</a>
            <a className="link-arrow" href={PORE_SIZE_GUIDE_PATH}>0.22 vs 0.45 micron</a>
          </div>
        </div>
      </section>
    </>
  );
}
