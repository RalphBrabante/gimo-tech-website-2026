import type { Metadata } from 'next';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { pageMetadata, JsonLd, breadcrumbNode, faqNode, webPageNode, DEFAULT_SOCIAL_IMAGE } from '@/lib/seo';
import { BUSINESS, LAZADA_NYLON_URL, SHOPEE_NYLON_URL, MEMBRANE_GUIDE_PATH, NYLON_PATH, PORE_SIZE_GUIDE_PATH, absoluteUrl } from '@/lib/site';
import { NYLON, NYLON_FAQS, NYLON_HIGHLIGHTS, NYLON_SPECS, NYLON_STORY, MEMBRANES } from '@/content/nylon';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LocalNav } from '@/components/LocalNav';
import { Faq } from '@/components/Faq';
import { Picture, NYLON_PHOTO } from '@/components/Picture';
import { FilterScene } from '@/components/three/FilterScene';
import { ScrollStory } from '@/components/three/ScrollStory';
import { EnquiryForm } from '@/components/quote/EnquiryForm';

export const metadata: Metadata = pageMetadata({ title: NYLON.title, absoluteTitle: true, description: NYLON.description, path: NYLON_PATH, image: DEFAULT_SOCIAL_IMAGE });

const crumbs = [{ name: 'Home', path: '/' }, { name: 'Syringe Filters', path: '/syringe-filters' }, { name: NYLON.name, path: NYLON_PATH }];

export default function NylonSyringeFilterPage() {
  const productUrl = absoluteUrl(NYLON_PATH);
  const photo = <Picture {...NYLON_PHOTO} alt={NYLON.imageAlt} sizes="(max-width: 700px) 70vw, 520px" priority />;

  return (
    <>
      <SiteAnalytics />
      <JsonLd nodes={[
        webPageNode('ItemPage', NYLON.name, NYLON.description, NYLON_PATH, { mainEntity: { '@id': `${productUrl}#product` }, primaryImageOfPage: absoluteUrl(DEFAULT_SOCIAL_IMAGE.url) }),
        {
          '@type': 'Product', '@id': `${productUrl}#product`, name: NYLON.name, description: NYLON.description, url: productUrl, category: 'Laboratory syringe filters',
          image: [absoluteUrl('/assets/products/nylon-syringe-filter-hero-1280.jpg'), absoluteUrl('/assets/products/nylon-syringe-filter-hero-640.jpg')],
          material: 'Nylon',
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'Membrane', value: 'Nylon' },
            { '@type': 'PropertyValue', name: 'Filter diameter', value: 25, unitCode: 'MMT', unitText: 'mm' },
            { '@type': 'PropertyValue', name: 'Pore size', value: 0.45, unitCode: '4H', unitText: 'µm' },
            { '@type': 'PropertyValue', name: 'Pieces per canister', value: 100 },
            { '@type': 'PropertyValue', name: 'Sterility', value: 'Non-sterile' }
          ]
        },
        breadcrumbNode(crumbs),
        faqNode(NYLON_FAQS)
      ]} />

      <LocalNav title={NYLON.shortName} cta={{ href: '#quote', label: 'Request a quote' }} links={[
        { href: '#overview', label: 'Overview' }, { href: '#inside', label: 'Inside' }, { href: '#specs', label: 'Specs' },
        { href: '#pore-size', label: '0.22 vs 0.45' }, { href: '#compare', label: 'Compare' }, { href: '#faq', label: 'FAQ' }
      ]} />

      <section id="overview" className="hero" aria-labelledby="nylon-title">
        <div className="shell"><Breadcrumbs items={crumbs} /></div>
        <div className="shell" style={{ paddingTop: 'clamp(20px, 4vw, 40px)' }}>
          <p className="eyebrow">Laboratory filtration · Philippines</p>
          <h1 id="nylon-title" className="display">Nylon Syringe Filter <span className="gradient-text">0.45&nbsp;Micron</span></h1>
          <p className="lede">25 mm nylon syringe filters for HPLC sample preparation and everyday lab filtration, supplied across the Philippines in non-sterile 100-piece canisters.</p>
          <div className="btn-row center">
            <a className="btn btn-primary" href="#quote">Request a quotation</a>
            <a className="btn btn-outline" href={LAZADA_NYLON_URL} target="_blank" rel="noopener noreferrer">Buy on Lazada <span aria-hidden="true">↗</span></a>
            <a className="btn btn-outline" href={SHOPEE_NYLON_URL} target="_blank" rel="noopener noreferrer">Buy on Shopee <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="hero-visual">
          <FilterScene mode="hero" label="Interactive 3D model of a yellow 25 millimetre nylon syringe filter" fallback={photo} />
        </div>
      </section>

      <section className="section-tight" aria-labelledby="highlights-title">
        <div className="shell">
          <h2 id="highlights-title" className="sr-only">Key specifications</h2>
          <div className="highlights">
            {NYLON_HIGHLIGHTS.map((item, index) => (
              <div key={item.label} className="highlight" data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.08}s` }}>
                <span className="highlight-value">{item.value}{item.unit && <small>{item.unit}</small>}</span>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="inside">
        <ScrollStory
          heading={<>Four facts. <span className="gradient-text">One clean sample.</span></>}
          intro="Scroll to look inside the filter: housing, nylon membrane and outlet."
          steps={NYLON_STORY}
          label="3D model of a nylon syringe filter separating into its housing and membrane layers"
          fallback={<Picture {...NYLON_PHOTO} alt="" sizes="(max-width: 700px) 70vw, 520px" />}
        />
      </div>

      <section className="section" aria-labelledby="canister-title">
        <div className="shell split">
          <div className="media-frame" data-reveal="scale">
            <Picture {...NYLON_PHOTO} alt="Canister of GIMO 25 millimetre 0.45 micron nylon syringe filters" sizes="(max-width: 900px) calc(100vw - 40px), 560px" />
          </div>
          <div data-reveal>
            <p className="eyebrow">Supplied as a 100-piece canister</p>
            <h2 id="canister-title" className="headline">Ready for routine HPLC sample prep.</h2>
            <p>GIMO Laboratory Supplies provides 25mm 0.45 micron nylon syringe filters for HPLC sample preparation, routine sample clarification and general laboratory filtration. Singles are also sold separately on Lazada and Shopee; confirm the selected listing option there.</p>
            <ul className="checklist">
              <li>Syringe filter for HPLC sample preparation</li>
              <li>Routine sample clarification and lab filtration</li>
              <li>For purchasing departments, researchers, schools, universities, clinics and industrial laboratories</li>
            </ul>
            <a className="link-arrow" href="#quote">Get pricing for your quantity</a>
          </div>
        </div>
      </section>

      <section id="specs" className="section bg-pale" aria-labelledby="specs-title">
        <div className="shell-narrow">
          <div className="section-head">
            <p className="eyebrow">Tech specs</p>
            <h2 id="specs-title" className="headline">Product specifications</h2>
            <p>Only verified details are listed. Anything not yet verified is marked, so your laboratory can request the manufacturer documentation it needs.</p>
          </div>
          <dl className="spec-table" data-reveal>
            {NYLON_SPECS.map((row) => <div key={row.label} className="spec-row"><dt>{row.label}</dt><dd>{row.value}</dd></div>)}
          </dl>
        </div>
      </section>

      <section id="pore-size" className="section" aria-labelledby="pore-title">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Choosing a pore size</p>
            <h2 id="pore-title" className="headline">0.45 micron or 0.22 micron?</h2>
            <p>Both are common nylon syringe filter pore sizes. Your validated method decides which one you need.</p>
          </div>
          <div className="compare compare-2">
            <div className="compare-col is-current" data-reveal>
              <span className="compare-badge">Supplied by GIMO</span>
              <h3>0.45 µm</h3>
              <p className="muted">0.45 micron nylon syringe filter</p>
              <dl>
                <div><dt>Typical use</dt><dd>General HPLC sample preparation and particulate removal</dd></div>
                <div><dt>Flow</dt><dd>Larger pores filter faster, with less back-pressure</dd></div>
                <div><dt>On this page</dt><dd>25 mm · non-sterile · 100 pieces</dd></div>
              </dl>
            </div>
            <div className="compare-col" data-reveal style={{ ['--reveal-delay' as string]: '0.1s' }}>
              <span className="compare-badge" style={{ background: 'var(--bg-blue)', color: 'var(--heading)' }}>Ask us</span>
              <h3>0.22 µm</h3>
              <p className="muted">0.22 micron syringe filter</p>
              <dl>
                <div><dt>Typical use</dt><dd>Finer filtration, such as UHPLC sample preparation or sterilising filtration with a sterile filter</dd></div>
                <div><dt>Flow</dt><dd>Smaller pores filter more slowly</dd></div>
                <div><dt>Availability</dt><dd>Not part of this listing. Mention it in your enquiry and we will confirm what can be supplied.</dd></div>
              </dl>
            </div>
          </div>
          <p className="center" style={{ marginTop: '2rem' }}><a className="link-arrow" href={PORE_SIZE_GUIDE_PATH}>Read the 0.22 vs 0.45 micron syringe filter guide</a></p>
        </div>
      </section>

      <section className="section bg-blue" aria-labelledby="supplier-title">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Why buy from GIMO</p>
            <h2 id="supplier-title" className="headline">Your nylon syringe filter supplier in the Philippines.</h2>
            <p>Gimo Tech Supplies, also known as GIMO Laboratory Supplies, is a laboratory syringe filter supplier serving laboratories and procurement teams nationwide.</p>
          </div>
          <div className="grid grid-3">
            {[
              { title: 'Based in San Pedro, Laguna', body: 'A local supply team you can email directly about configuration, quantity and documentation.' },
              { title: 'Delivery across the Philippines', body: 'Share your destination and the courier, lead time and charges are confirmed with your quotation.' },
              { title: 'Quotation or online checkout', body: 'Request a formal quotation for canister quantities, or buy through the official GIMO Lazada or Shopee shop.' }
            ].map((card, index) => (
              <article key={card.title} className="card" data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.08}s` }}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="compare" className="section" aria-labelledby="compare-title">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Compare membranes</p>
            <h2 id="compare-title" className="headline">Which syringe filter is right for your method?</h2>
          </div>
          <div className="compare">
            {MEMBRANES.map((membrane, index) => (
              <div key={membrane.key} className={`compare-col${membrane.key === 'nylon' ? ' is-current' : ''}`} data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.06}s` }}>
                <span className="swatch" style={{ ['--swatch' as string]: membrane.color }} aria-hidden="true" />
                <h3>{membrane.name}</h3>
                <p className="muted small">{membrane.role}</p>
                <dl>
                  <div><dt>Typical positioning</dt><dd>{membrane.fit}</dd></div>
                  <div><dt>Before you order</dt><dd>{membrane.check}</dd></div>
                </dl>
              </div>
            ))}
          </div>
          <p className="center" style={{ marginTop: '2rem' }}><a className="link-arrow" href={MEMBRANE_GUIDE_PATH}>Compare Nylon, PTFE, PVDF and MCE syringe filters</a></p>
        </div>
      </section>

      <section id="quote" className="section bg-aqua" aria-labelledby="quote-title">
        <div className="shell split" style={{ alignItems: 'start' }}>
          <div>
            <p className="eyebrow">Buy nylon syringe filters</p>
            <h2 id="quote-title" className="headline">Request a quotation.</h2>
            <p>Tell us how many canisters you need and where to deliver. The supply team replies by email with pricing, current availability and delivery timing for your location.</p>
            <ul className="checklist">
              <li>Nylon · 25 mm · 0.45 µm · 100 pieces per canister</li>
              <li>Formal quotations for purchasing departments</li>
              <li>Delivery enquiries throughout the Philippines</li>
            </ul>
            <p className="small">Prefer to order online now? Buy on <a href={LAZADA_NYLON_URL} target="_blank" rel="noopener noreferrer">Lazada</a> or <a href={SHOPEE_NYLON_URL} target="_blank" rel="noopener noreferrer">Shopee</a>. Or email <a href={`mailto:${BUSINESS.email}?subject=${encodeURIComponent('Quotation request: 25mm 0.45µm nylon syringe filters')}`}>{BUSINESS.email}</a>.</p>
          </div>
          <EnquiryForm product="nylon-syringe-filter-25mm-045um" unitLabel="canisters of 100" email={BUSINESS.email} />
        </div>
      </section>

      <section id="faq" className="section" aria-labelledby="faq-title">
        <div className="shell-narrow">
          <div className="section-head">
            <p className="eyebrow">Questions</p>
            <h2 id="faq-title" className="headline">Frequently asked questions</h2>
          </div>
          <Faq items={NYLON_FAQS} />
          <p style={{ marginTop: '1.5rem' }}><a className="link-arrow" href={PORE_SIZE_GUIDE_PATH}>0.22 vs 0.45 micron syringe filters explained</a></p>
        </div>
      </section>

      <section className="cta-band" aria-labelledby="cta-title">
        <div className="shell">
          <h2 id="cta-title" className="headline">Filters for your next sample run.</h2>
          <p className="lede">25mm 0.45 micron nylon syringe filters from a Philippine laboratory supplier.</p>
          <div className="btn-row center">
            <a className="btn btn-aqua" href="#quote">Request a quotation</a>
            <a className="btn btn-white" href={LAZADA_NYLON_URL} target="_blank" rel="noopener noreferrer">Buy on Lazada <span aria-hidden="true">↗</span></a>
            <a className="btn btn-white" href={SHOPEE_NYLON_URL} target="_blank" rel="noopener noreferrer">Buy on Shopee <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
