import type { Metadata } from 'next';
import { getHomepage } from '@/lib/content';
import { RANGES } from '@/content/ranges';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { pageMetadata, JsonLd, webPageNode } from '@/lib/seo';
import { BUSINESS, LAZADA_NYLON_URL, SHOPEE_NYLON_URL, MEMBRANE_GUIDE_PATH, NYLON_PATH, PORE_SIZE_GUIDE_PATH, absoluteUrl, isExternal } from '@/lib/site';
import { Picture, NYLON_PHOTO, QR_PHOTO } from '@/components/Picture';
import { FilterScene } from '@/components/three/FilterScene';

const TITLE = 'Syringe Filter Supplier Philippines | Gimo Tech Supplies';
const DESCRIPTION = 'Laboratory syringe filter supplier in the Philippines: 0.45 micron nylon syringe filters for HPLC, sequential QR code labels and custom biohazard bags.';

export const metadata: Metadata = pageMetadata({ title: TITLE, absoluteTitle: true, description: DESCRIPTION, path: '/' });

const external = (href: string) => (isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {});

export default function HomePage() {
  const h = getHomepage();

  return (
    <>
      <SiteAnalytics />
      <JsonLd nodes={[
        webPageNode('WebPage', TITLE, DESCRIPTION, '/', { mainEntity: { '@id': `${absoluteUrl('/')}#product-ranges` } }),
        { '@type': 'ItemList', '@id': `${absoluteUrl('/')}#product-ranges`, name: 'Gimo Tech Supplies product ranges', itemListElement: RANGES.map((range, index) => ({ '@type': 'ListItem', position: index + 1, name: range.name, description: range.text, url: absoluteUrl(range.path) })) }
      ]} />

      <section className="hero" aria-labelledby="home-title">
        <div className="shell">
          <p className="eyebrow">{h.hero.eyebrow}</p>
          <h1 id="home-title" className="display">{h.hero.heading}</h1>
          <p className="lede">{h.hero.body}</p>
          <ul className="ticks">{h.hero.ticks.map((tick) => <li key={tick}>{tick}</li>)}</ul>
          <div className="btn-row center">
            <a className="btn btn-primary" href={NYLON_PATH}>Shop nylon syringe filters</a>
            <a className="btn btn-outline" href={h.hero.ctaHref} {...external(h.hero.ctaHref)}>{h.hero.ctaLabel}</a>
          </div>
        </div>
        <div className="hero-visual">
          <FilterScene mode="hero" label="Interactive 3D model of a yellow 25 millimetre nylon syringe filter"
            fallback={<Picture {...NYLON_PHOTO} alt="GIMO nylon syringe filters, 25 mm and 0.45 micron, in a non-sterile 100-piece canister" sizes="(max-width: 700px) 70vw, 520px" priority />} />
        </div>
      </section>

      <section className="section-tight" aria-label="Featured products">
        <div className="shell tiles tiles-2">
          <a className="tile tile-blue tile-wide" href={NYLON_PATH} data-reveal>
            <p className="eyebrow">Featured · HPLC sample preparation</p>
            <h2>Nylon Syringe Filter</h2>
            <p>0.45 micron. 25 mm. 100 per canister.</p>
            <div className="btn-row"><span className="link-arrow">Learn more</span></div>
            <div className="tile-media"><Picture {...NYLON_PHOTO} alt="Canister of 25mm 0.45 micron nylon syringe filters" sizes="(max-width: 520px) calc(100vw - 80px), 440px" /></div>
          </a>
          <a className="tile" href="/sequential-qr-code-labels" data-reveal>
            <p className="eyebrow">Custom printing</p>
            <h2>Sequential QR Code Labels</h2>
            <p>30 × 20 mm adhesive labels with unique codes and numbering.</p>
            <div className="btn-row"><span className="link-arrow">Learn more</span></div>
            <div className="tile-media"><Picture {...QR_PHOTO} alt="Roll of white sequential QR code adhesive labels" sizes="(max-width: 520px) calc(100vw - 80px), 440px" /></div>
          </a>
          <a className="tile tile-navy" href="/biohazard-bags" data-reveal style={{ ['--reveal-delay' as string]: '0.08s' }}>
            <p className="eyebrow">{h.impact_banner.eyebrow}</p>
            <h2>Biohazard Bags with QR Codes</h2>
            <p>{h.impact_banner.heading}</p>
            <div className="btn-row"><span className="link-arrow">Explore custom bags</span></div>
            <div className="tile-media" aria-hidden="true">
              <svg viewBox="0 0 320 220" width="320" height="220"><rect x="70" y="20" width="180" height="200" rx="18" fill="#e9474f" /><rect x="70" y="20" width="180" height="26" rx="12" fill="#c7353c" /><circle cx="160" cy="98" r="30" fill="none" stroke="#fff" strokeWidth="8" /><rect x="120" y="148" width="80" height="54" rx="6" fill="#fff" /><path d="M130 158h14v14h-14zM176 158h14v14h-14zM130 180h14v14h-14zM154 168h12v12h-12zM176 184h14v10h-14z" fill="#102f55" /></svg>
            </div>
          </a>
          <a className="tile tile-aqua tile-wide" href={MEMBRANE_GUIDE_PATH} data-reveal>
            <p className="eyebrow">Selection guide</p>
            <h2>Nylon, PTFE, PVDF or MCE?</h2>
            <p>Compare syringe filter membranes before you order.</p>
            <div className="btn-row"><span className="link-arrow">Compare membranes</span></div>
          </a>
        </div>
      </section>

      <section className="section bg-pale" aria-labelledby="filter-types-title">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">{h.filter_types.eyebrow}</p>
            <h2 id="filter-types-title" className="headline">{h.filter_types.heading}</h2>
          </div>
          <div className="compare">
            {h.filter_types.items.map((item, index) => (
              <article key={item.name} className="compare-col" data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.06}s` }}>
                <span className="swatch" style={{ ['--swatch' as string]: item.color }} aria-hidden="true" />
                <h3>{item.name}</h3>
                <p className="muted small">{item.tag}</p>
                <p>{item.description}</p>
                <dl>
                  <div><dt>Format</dt><dd>{item.format}</dd></div>
                  <div><dt>Packaging</dt><dd>{item.pack}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <p className="center" style={{ marginTop: '2rem' }}><a className="link-arrow" href={PORE_SIZE_GUIDE_PATH}>0.22 vs 0.45 micron: choosing a pore size</a></p>
        </div>
      </section>

      <section className="section" aria-labelledby="benefits-title">
        <div className="shell split">
          <div data-reveal>
            <p className="eyebrow">{h.benefits.eyebrow}</p>
            <h2 id="benefits-title" className="headline">{h.benefits.heading}</h2>
            <p>{h.benefits.body}</p>
            <ul className="checklist">{h.benefits.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            <a className="btn btn-primary" href={h.benefits.ctaHref} {...external(h.benefits.ctaHref)}>{h.benefits.ctaLabel}</a>
          </div>
          <div className="grid grid-2">
            {h.benefits.cards.map((card, index) => (
              <article key={card.title} className="card" data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.06}s` }}>
                <span className="card-icon" aria-hidden="true">{card.icon}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <a className="link-arrow" href={card.linkHref} aria-label={`${card.linkLabel}: ${card.title}`} {...external(card.linkHref)}>{card.linkLabel}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-blue" aria-labelledby="catalogue-title">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Product catalogue</p>
            <h2 id="catalogue-title" className="headline">Laboratory consumables and custom supplies</h2>
            <p>Tell us the products and quantities you need, and we confirm pricing, availability and delivery by email.</p>
          </div>
          <div className="grid grid-4">
            {RANGES.map((range, index) => (
              <a key={range.path} className="card card-link" href={range.path} data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.06}s` }}>
                <strong>{range.name}</strong><span>{range.text}</span>
              </a>
            ))}
          </div>
          <p className="center" style={{ marginTop: '2rem' }}><a className="btn btn-outline" href="/products">View the full catalogue</a></p>
        </div>
      </section>

      <section className="section" aria-labelledby="selection-title">
        <div className="shell split">
          <div className="media-frame" data-reveal="scale">
            <Picture {...NYLON_PHOTO} alt="Nylon syringe filters for HPLC sample preparation" sizes="(max-width: 900px) calc(100vw - 40px), 560px" />
          </div>
          <div data-reveal>
            <p className="eyebrow">{h.split_1.eyebrow}</p>
            <h2 id="selection-title" className="headline">{h.split_1.heading}</h2>
            <p>{h.split_1.body}</p>
            <ul className="checklist check-grid">{h.split_1.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
            <div className="btn-row">
              <a className="btn btn-primary" href={h.split_1.ctaHref} {...external(h.split_1.ctaHref)}>{h.split_1.ctaLabel}</a>
              <a className="link-arrow" href={MEMBRANE_GUIDE_PATH}>Compare Nylon, PTFE, PVDF and MCE</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-pale" aria-labelledby="labeling-title">
        <div className="shell split reverse">
          <div className="media-frame" data-reveal="scale">
            <Picture {...QR_PHOTO} alt="Sequential QR code labels for laboratory tracking" sizes="(max-width: 900px) calc(100vw - 40px), 560px" />
          </div>
          <div data-reveal>
            <p className="eyebrow">{h.split_2.eyebrow}</p>
            <h2 id="labeling-title" className="headline">{h.split_2.heading}</h2>
            <p>{h.split_2.body}</p>
            <div className="highlights" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', margin: '1.5rem 0' }}>
              {h.split_2.stats.map((stat) => <div key={stat.label} className="highlight"><span className="highlight-value" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>{stat.value}</span><p>{stat.label}</p></div>)}
            </div>
            <a className="btn btn-primary" href={h.split_2.ctaHref} {...external(h.split_2.ctaHref)}>{h.split_2.ctaLabel}</a>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="plans-title">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">{h.plans.eyebrow}</p>
            <h2 id="plans-title" className="headline">{h.plans.heading}</h2>
          </div>
          <div className="grid grid-3">
            {h.plans.cards.map((card, index) => (
              <article key={card.title + card.subtitle} className={`card${card.featured ? ' featured-card' : ''}`} data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.08}s` }}>
                {card.featured && <span className="compare-badge">Main product</span>}
                <p className="tag" style={{ marginTop: '0.8rem' }}>{card.eyebrow}</p>
                <h3><span className="highlight-value" style={{ fontSize: '2.6rem' }}>{card.title}</span>{card.subtitle}</h3>
                <ul className="checklist">{card.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                <a className={`btn ${card.featured ? 'btn-primary' : 'btn-outline'}`} href={card.ctaHref} {...external(card.ctaHref)}>{card.ctaLabel}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-aqua" aria-labelledby="consult-title">
        <div className="shell split">
          <div data-reveal>
            <p className="eyebrow">{h.consult_intro.eyebrow}</p>
            <h2 id="consult-title" className="headline">{h.consult_intro.heading}</h2>
            <p>{h.consult_intro.body}</p>
            <div className="btn-row">
              <a className="btn btn-primary" href="/request-for-a-quote">Request a quotation</a>
              <a className="link-arrow" href={`mailto:${BUSINESS.email}?subject=Quote%20request`}>{BUSINESS.email}</a>
            </div>
          </div>
          <div className="grid" data-reveal>
            <div className="card">
              <img src="/assets/marketplaces/lazada-logo.svg" width={132} height={28} alt="Lazada" loading="lazy" decoding="async" style={{ marginBottom: '1rem' }} />
              <h3>Shop GIMO Laboratory Supplies on Lazada</h3>
              <p>Browse our laboratory supplies and order conveniently through our official Lazada shop.</p>
              <div className="btn-row">
                <a className="btn btn-outline" href={BUSINESS.lazadaShop} target="_blank" rel="noopener noreferrer">Visit our Lazada shop <span aria-hidden="true">↗</span></a>
                <a className="link-arrow" href={LAZADA_NYLON_URL} target="_blank" rel="noopener noreferrer">Nylon filters on Lazada</a>
              </div>
            </div>
            <div className="card">
              <span className="marketplace-label marketplace-shopee">Shopee</span>
              <h3>Shop GIMO Laboratory Supplies on Shopee</h3>
              <p>Prefer Shopee? Order our nylon syringe filters through the official GIMO shop on Shopee.</p>
              <div className="btn-row">
                <a className="btn btn-outline" href={BUSINESS.shopeeShop} target="_blank" rel="noopener noreferrer">Visit our Shopee shop <span aria-hidden="true">↗</span></a>
                <a className="link-arrow" href={SHOPEE_NYLON_URL} target="_blank" rel="noopener noreferrer">Nylon filters on Shopee</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="location-title">
        <div className="shell split">
          <div data-reveal>
            <p className="eyebrow">{h.location.tagline}</p>
            <h2 id="location-title" className="title">Gimo Tech Supplies, San Pedro, Laguna</h2>
            <p>{h.location.description}</p>
            <p className="small muted">Please contact us before arranging a visit.</p>
            <a className="link-arrow" href={h.location.ctaHref} target="_blank" rel="noopener noreferrer">{h.location.ctaLabel}</a>
          </div>
          <iframe className="map-frame" title="Map showing GIMO Laboratory Supplies in San Pedro, Laguna" src="https://www.google.com/maps?q=GIMO+Laboratory+Supplies&z=16&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </section>

      <section className="cta-band" aria-labelledby="cta-title">
        <div className="shell">
          <h2 id="cta-title" className="headline">{h.cta_banner.heading}</h2>
          <div className="btn-row center">
            <a className="btn btn-aqua" href={h.cta_banner.ctaHref} {...external(h.cta_banner.ctaHref)}>{h.cta_banner.ctaLabel}</a>
            <a className="btn btn-white" href={NYLON_PATH}>View nylon syringe filters</a>
          </div>
        </div>
      </section>
    </>
  );
}
