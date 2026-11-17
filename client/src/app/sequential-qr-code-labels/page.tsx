import type { Metadata } from 'next';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { pageMetadata, JsonLd, breadcrumbNode, faqNode, webPageNode, QR_SOCIAL_IMAGE } from '@/lib/seo';
import { absoluteUrl, mailto, siteOrigin } from '@/lib/site';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Faq } from '@/components/Faq';
import { Picture, QR_PHOTO } from '@/components/Picture';

const PATH = '/sequential-qr-code-labels';
const TITLE = 'Sequential QR Code Labels Philippines | Gimo Tech Supplies';
const DESCRIPTION = 'Order custom 30 × 20 mm sequential QR code labels on durable adhesive paper for tracking, labeling, and inventory workflows in the Philippines.';
const QUOTE = mailto('Bulk order enquiry: Sequential QR code labels');

export const metadata: Metadata = pageMetadata({ title: TITLE, absoluteTitle: true, description: DESCRIPTION, path: PATH, image: QR_SOCIAL_IMAGE });

const FAQS = [
  { question: 'What size are the sequential QR code labels?', answer: 'This offer is for labels printed at 30 × 20 mm. Share your application and required quantity so the final layout and order details can be confirmed before production.' },
  { question: 'Can every label have a different QR code or number?', answer: 'Yes. The offer supports sequential numbering and unique QR code printing. Provide the required sequence or source data when requesting a quotation.' },
  { question: 'Are the labels suitable for wet or oily environments?', answer: 'The offered adhesive paper is described as water, oil, and scratch resistant. Confirm the intended surface, exposure conditions, and handling requirements before ordering so suitability can be reviewed.' },
  { question: 'Can I place a bulk order?', answer: 'Yes. Send the required quantity, numbering range, QR data, delivery destination, and target schedule to Gimo Tech Supplies for a custom quotation.' }
];

const icon = (d: string) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const crumbs = [{ name: 'Home', path: '/' }, { name: 'Sequential QR Code Labels', path: PATH }];

export default function QrLabelsPage() {
  const image = absoluteUrl(QR_SOCIAL_IMAGE.url);
  return (
    <>
      <SiteAnalytics />
      <JsonLd nodes={[
        webPageNode('WebPage', 'Sequential QR Code Labels', DESCRIPTION, PATH, { primaryImageOfPage: image }),
        { '@type': 'Service', name: 'Sequential QR Code Label Printing', description: DESCRIPTION, image, provider: { '@id': `${siteOrigin()}/#organization` }, areaServed: { '@type': 'Country', name: 'Philippines' }, url: absoluteUrl(PATH) },
        breadcrumbNode(crumbs),
        faqNode(FAQS)
      ]} />

      <section className="hero" aria-labelledby="qr-title">
        <div className="shell"><Breadcrumbs items={crumbs} /></div>
        <div className="shell" style={{ paddingTop: 'clamp(20px, 4vw, 40px)' }}>
          <p className="eyebrow">Custom identification labels</p>
          <h1 id="qr-title" className="display">Sequential QR Code Labels</h1>
          <p className="lede">Printed on 30 × 20 mm water-, oil- and scratch-resistant adhesive paper.</p>
          <div className="btn-row center">
            <a className="btn btn-primary" href={QUOTE}>Message us for bulk orders</a>
            <a className="link-arrow" href="#order-details">See order requirements</a>
          </div>
        </div>
        <div className="hero-visual" style={{ maxWidth: 820 }}>
          <div className="media-frame">
            <Picture {...QR_PHOTO} alt="Roll of white sequential QR code adhesive labels on a pale blue backing" sizes="(max-width: 860px) calc(100vw - 40px), 820px" priority />
          </div>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="qr-benefits-title">
        <div className="shell">
          <h2 id="qr-benefits-title" className="sr-only">Label features</h2>
          <div className="grid grid-3">
            {[
              { i: 'M12 3l8 4v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V7l8-4zm-3 9l2 2 4-5', t: 'Durable adhesive labels', b: 'Designed for clear, dependable identification.' },
              { i: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h2v2h-2v-2zm4 0h2v6h-6v-2h4v-4z', t: 'Clear QR code printing', b: 'Unique code data can be supplied per label.' },
              { i: 'M5 6h14M5 12h14M5 18h14', t: 'Sequential numbering', b: 'Organise series for repeatable tracking workflows.' }
            ].map((card, index) => (
              <article key={card.t} className="card" data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.08}s` }}>
                <span className="card-icon">{icon(card.i)}</span><h3>{card.t}</h3><p>{card.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-pale" aria-labelledby="qr-uses-title">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Built for traceability</p>
            <h2 id="qr-uses-title" className="headline">One label. A clear identity for every item.</h2>
            <p>Sequential QR labels can support organised tracking across equipment, samples, assets, packages, files, and inventory. The data structure remains yours; Gimo Tech Supplies coordinates the print specification.</p>
          </div>
          <div className="grid grid-4">
            {[
              ['Inventory labeling', 'Assign unique identifiers to stock, supplies, and storage locations.'],
              ['Asset tracking', 'Connect physical equipment or property to your chosen digital record.'],
              ['Sample identification', 'Keep a readable label and sequential reference close to each container.'],
              ['Batch organisation', 'Prepare ordered series for production, receiving, or distribution workflows.']
            ].map(([t, b], index) => <article key={t} className="card" data-reveal style={{ ['--reveal-delay' as string]: `${index * 0.06}s` }}><h3>{t}</h3><p>{b}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="qr-spec-title">
        <div className="shell-narrow">
          <div className="section-head">
            <p className="eyebrow">Offer details</p>
            <h2 id="qr-spec-title" className="headline">A compact label with room for a unique code.</h2>
            <p>The 30 × 20 mm format combines a QR code with an optional human-readable sequence. Final code density and readability depend on the supplied data, print layout, and scanner requirements.</p>
          </div>
          <dl className="spec-table" data-reveal>
            {[['Label size', '30 × 20 mm'], ['Print', 'QR code + sequence'], ['Paper', 'Water, oil & scratch resistant'], ['Format', 'Adhesive roll labels']].map(([k, v]) => <div key={k} className="spec-row"><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </section>

      <section id="order-details" className="section bg-blue" aria-labelledby="qr-order-title">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Bulk order workflow</p>
            <h2 id="qr-order-title" className="headline">What to include in your enquiry.</h2>
            <p>Complete details help the team review your label layout and prepare an accurate quotation without assuming quantity, price, or production timing.</p>
          </div>
          <ol className="grid grid-3" style={{ listStyle: 'none', padding: 0 }}>
            {[
              ['01', 'Describe the application', 'Share the surface, environment, scanning device, and how the labels will be used.'],
              ['02', 'Provide the QR data', 'Include the numbering range, encoded values or destinations, and any human-readable text.'],
              ['03', 'Confirm order details', 'State the required quantity, delivery destination, and target schedule for quotation review.']
            ].map(([n, t, b]) => <li key={n} className="card" data-reveal><span className="tag">{n}</span><h3>{t}</h3><p>{b}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="qr-faq-title">
        <div className="shell-narrow">
          <div className="section-head"><p className="eyebrow">Frequently asked questions</p><h2 id="qr-faq-title" className="headline">Before you order</h2></div>
          <Faq items={FAQS} />
        </div>
      </section>

      <section className="cta-band" aria-labelledby="qr-cta-title">
        <div className="shell">
          <h2 id="qr-cta-title" className="headline">Ready to prepare your label series?</h2>
          <p className="lede">Send your quantity, sequence, QR data, and delivery destination to request a quotation.</p>
          <a className="btn btn-aqua" href={QUOTE}>Message Gimo Tech Supplies</a>
        </div>
      </section>
    </>
  );
}
