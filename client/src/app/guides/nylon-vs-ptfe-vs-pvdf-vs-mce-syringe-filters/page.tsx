import type { Metadata } from 'next';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { pageMetadata, JsonLd, breadcrumbNode, DEFAULT_SOCIAL_IMAGE } from '@/lib/seo';
import { BUSINESS, MEMBRANE_GUIDE_PATH, NYLON_PATH, PORE_SIZE_GUIDE_PATH, absoluteUrl, mailto, siteOrigin } from '@/lib/site';
import { MEMBRANES } from '@/content/nylon';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const TITLE = 'Nylon vs PTFE vs PVDF vs MCE Syringe Filters';
const DESCRIPTION = 'Compare Nylon, PTFE, PVDF, and MCE syringe filters for general laboratory and HPLC sample-preparation workflows in the Philippines.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: MEMBRANE_GUIDE_PATH, type: 'article', image: DEFAULT_SOCIAL_IMAGE });

const crumbs = [{ name: 'Home', path: '/' }, { name: 'Syringe Filters', path: '/syringe-filters' }, { name: 'Membrane comparison guide', path: MEMBRANE_GUIDE_PATH }];

export default function MembraneGuidePage() {
  const url = absoluteUrl(MEMBRANE_GUIDE_PATH);
  return (
    <>
      <SiteAnalytics />
      <JsonLd nodes={[
        { '@type': 'Article', '@id': `${url}#article`, headline: TITLE, description: DESCRIPTION, url, mainEntityOfPage: url, image: [absoluteUrl(DEFAULT_SOCIAL_IMAGE.url)], inLanguage: 'en-PH', about: ['Syringe filter', 'Membrane filtration', 'HPLC sample preparation'], author: { '@id': `${siteOrigin()}/#organization` }, publisher: { '@id': `${siteOrigin()}/#organization` } },
        breadcrumbNode(crumbs)
      ]} />
      <div className="page-hero">
        <div className="shell-narrow">
          <Breadcrumbs items={crumbs} />
          <p className="eyebrow" style={{ marginTop: '1.5rem' }}>Syringe filter selection guide</p>
          <h1>{TITLE}</h1>
          <p className="lede">Membrane selection should follow the complete sample composition, solvent system, analytes, sterility needs, and validated laboratory method. This guide gives a conservative starting point; it does not replace manufacturer compatibility data.</p>
        </div>
      </div>
      <article className="shell-narrow prose section-tight" style={{ paddingTop: 0 }}>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Membrane comparison table (scrollable)">
          <table>
            <thead><tr><th scope="col">Membrane</th><th scope="col">Typical catalogue positioning</th><th scope="col">Selection check</th></tr></thead>
            <tbody>{MEMBRANES.map((m) => <tr key={m.key} id={m.key}><th scope="row">{m.name}</th><td>{m.fit}</td><td>{m.check}</td></tr>)}</tbody>
          </table>
        </div>

        <h2>How to choose a syringe filter membrane</h2>
        <ol>
          <li>Start with the validated method or instrument requirements.</li>
          <li>List every solvent and sample component, including concentrations.</li>
          <li>Confirm the required diameter, pore size, sterility, and pack format. See <a href={PORE_SIZE_GUIDE_PATH}>0.22 vs 0.45 micron syringe filters</a>.</li>
          <li>Check manufacturer documentation for both membrane and housing compatibility.</li>
          <li>Run method-appropriate verification before routine analytical use.</li>
        </ol>

        <h2>When nylon may fit</h2>
        <p>The current GIMO catalogue positions nylon for general aqueous and mixed sample-preparation workflows. Laboratories needing a 25 mm, 0.45 µm format can review the dedicated <a href={NYLON_PATH}>25mm 0.45 micron nylon syringe filter</a> page.</p>

        <h2>When to compare alternatives</h2>
        <p>Compare PTFE for stronger-solvent workflows, PVDF where a low-binding option is being considered, and MCE for general clarification. These are selection prompts, not universal compatibility claims.</p>

        <aside className="callout">
          <div>
            <h2>Need product matching?</h2>
            <p>Send GIMO your sample system, requested format, quantity, and delivery destination. Availability and suitability details will be confirmed rather than assumed.</p>
          </div>
          <a className="btn btn-primary" href={mailto('Syringe filter selection enquiry')}>Ask {BUSINESS.alternateName}</a>
        </aside>
      </article>
    </>
  );
}
