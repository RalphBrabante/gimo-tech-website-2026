import type { Metadata } from 'next';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { pageMetadata, JsonLd, breadcrumbNode, faqNode, DEFAULT_SOCIAL_IMAGE } from '@/lib/seo';
import { BUSINESS, MEMBRANE_GUIDE_PATH, NYLON_PATH, PORE_SIZE_GUIDE_PATH, absoluteUrl, siteOrigin } from '@/lib/site';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Faq } from '@/components/Faq';

const TITLE = '0.22 vs 0.45 Micron Syringe Filters: Which Pore Size?';
const DESCRIPTION = 'How 0.22 micron and 0.45 micron syringe filters differ, when HPLC and UHPLC methods use each, and what to check before buying nylon syringe filters.';

export const metadata: Metadata = pageMetadata({ title: TITLE, absoluteTitle: true, description: DESCRIPTION, path: PORE_SIZE_GUIDE_PATH, type: 'article', image: DEFAULT_SOCIAL_IMAGE });

const crumbs = [{ name: 'Home', path: '/' }, { name: 'Syringe Filters', path: '/syringe-filters' }, { name: '0.22 vs 0.45 micron guide', path: PORE_SIZE_GUIDE_PATH }];

// General selection guidance only. Product claims are limited to the verified 0.45 µm nylon format.
const FAQS = [
  { question: 'What is the difference between a 0.22 and 0.45 micron syringe filter?', answer: 'The number is the membrane pore-size rating in micrometres (microns). A 0.22 µm filter retains finer particles than a 0.45 µm filter, but it filters more slowly and with more back-pressure, especially for viscous or particle-heavy samples.' },
  { question: 'Which pore size is used for HPLC sample preparation?', answer: 'Many routine HPLC methods use 0.45 µm syringe filters to remove particulates before injection. Methods using UHPLC columns or very small particle sizes often specify 0.22 µm. Always follow the pore size stated in your validated method or column documentation.' },
  { question: 'Is a 0.22 micron filter sterile?', answer: 'A 0.22 µm rating is commonly used for sterilising filtration, but the filter itself is only sterile if it is supplied sterile and handled aseptically. A non-sterile 0.22 µm filter does not sterilise a sample.' },
  { question: 'Which nylon syringe filter does GIMO supply?', answer: 'GIMO Laboratory Supplies supplies a 25mm 0.45 µm nylon syringe filter in non-sterile 100-piece canisters. If your method needs another pore size, include it in your enquiry and the supply team will confirm what can be provided.' }
];

export default function PoreSizeGuidePage() {
  const url = absoluteUrl(PORE_SIZE_GUIDE_PATH);
  return (
    <>
      <SiteAnalytics />
      <JsonLd nodes={[
        { '@type': 'Article', '@id': `${url}#article`, headline: TITLE, description: DESCRIPTION, url, mainEntityOfPage: url, image: [absoluteUrl(DEFAULT_SOCIAL_IMAGE.url)], inLanguage: 'en-PH', about: ['Syringe filter', 'Membrane pore size', 'HPLC sample preparation'], author: { '@id': `${siteOrigin()}/#organization` }, publisher: { '@id': `${siteOrigin()}/#organization` } },
        breadcrumbNode(crumbs),
        faqNode(FAQS)
      ]} />
      <div className="page-hero">
        <div className="shell-narrow">
          <Breadcrumbs items={crumbs} />
          <p className="eyebrow" style={{ marginTop: '1.5rem' }}>Syringe filter selection guide</p>
          <h1>0.22 vs 0.45 Micron Syringe Filters</h1>
          <p className="lede">Pore size is a method decision. Here is how the two most common syringe filter ratings compare, and what to confirm before you buy.</p>
        </div>
      </div>
      <article className="shell-narrow prose section-tight" style={{ paddingTop: 0 }}>
        <div className="compare compare-2" style={{ margin: '0 0 2.5rem' }}>
          <div className="compare-col is-current">
            <span className="compare-badge">Supplied by GIMO in nylon</span>
            <h2 style={{ marginTop: '0.6rem' }}>0.45 µm</h2>
            <dl>
              <div><dt>Retains</dt><dd>Particles above the 0.45 micron rating</dd></div>
              <div><dt>Common use</dt><dd>Routine HPLC sample preparation, sample clarification</dd></div>
              <div><dt>Flow</dt><dd>Faster, lower back-pressure</dd></div>
            </dl>
          </div>
          <div className="compare-col">
            <span className="compare-badge" style={{ background: 'var(--bg-blue)', color: 'var(--heading)' }}>Ask before ordering</span>
            <h2 style={{ marginTop: '0.6rem' }}>0.22 µm</h2>
            <dl>
              <div><dt>Retains</dt><dd>Finer particles above the 0.22 micron rating</dd></div>
              <div><dt>Common use</dt><dd>UHPLC sample preparation; sterilising filtration when supplied sterile</dd></div>
              <div><dt>Flow</dt><dd>Slower, higher back-pressure</dd></div>
            </dl>
          </div>
        </div>

        <h2>When a 0.45 micron syringe filter fits</h2>
        <p>A 0.45 µm syringe filter is a common choice for routine HPLC sample preparation: it removes particulates that could block tubing, frits or columns, while keeping filtration quick. Nylon is catalogued for general aqueous and mixed sample-preparation workflows. If your method specifies a 25 mm, 0.45 µm nylon membrane, see the <a href={NYLON_PATH}>25mm 0.45 micron nylon syringe filter</a>.</p>

        <h2>When a method calls for 0.22 micron</h2>
        <p>Methods using UHPLC systems or columns packed with very small particles often specify 0.22 µm filtration. A 0.22 µm rating is also used for sterilising filtration, but only with a filter supplied sterile and handled aseptically. Use the pore size written in your validated method or column documentation rather than choosing the smallest available.</p>
        <p>GIMO currently lists the 0.45 µm nylon format. If your method specifies a 0.22 micron nylon syringe filter, say so in your enquiry and the supply team will confirm what can be supplied.</p>

        <h2>Checklist before you buy syringe filters</h2>
        <ol>
          <li>Confirm the pore size required by your method (for example 0.45 µm or 0.22 µm).</li>
          <li>Confirm the membrane (nylon, PTFE, PVDF or MCE) against your full sample and solvent composition. See the <a href={MEMBRANE_GUIDE_PATH}>membrane comparison guide</a>.</li>
          <li>Confirm diameter, sterility and pack quantity.</li>
          <li>Check manufacturer documentation for both membrane and housing compatibility.</li>
          <li>Verify performance in your method before routine use.</li>
        </ol>

        <h2>Questions</h2>
        <Faq items={FAQS} />

        <aside className="callout">
          <div>
            <h2>Need nylon syringe filters in the Philippines?</h2>
            <p>Request a quotation for 25mm 0.45 µm nylon syringe filters, or ask {BUSINESS.name} about the pore size your method needs.</p>
          </div>
          <a className="btn btn-primary" href={`${NYLON_PATH}#quote`}>Request a quotation</a>
        </aside>
      </article>
    </>
  );
}
