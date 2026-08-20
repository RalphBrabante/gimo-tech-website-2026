import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemEntity, MenuLocation } from '../menus/entities/menu-item.entity';
import { Page, PageBlock } from './models/page.model';
import { escapeHtml } from '../common/html.util';
import type { Product } from '../products/models/product.model';

interface NavLink {
  label: string;
  href: string;
  openInNewTab: boolean;
}

interface FooterColumn {
  label: string;
  links: NavLink[];
}

const SITE_ORIGIN = 'https://gimosupplies.com';
const NYLON_PRODUCT_PATH = '/products/nylon-syringe-filter-25mm-045um';

@Injectable()
export class PageRendererService {
  constructor(@InjectRepository(MenuItemEntity) private readonly menuItems: Repository<MenuItemEntity>) {}

  async renderPage(page: Page, origin: string): Promise<string> {
    if (page.slug === 'syringe-filters') return this.renderSyringeFilters(page);

    const nav = await this.loadNav();
    const canonicalUrl = `${SITE_ORIGIN}/${page.slug}`;
    const description = page.metaDescription ?? '';
    const bodyHtml = `<h1>${escapeHtml(page.title)}</h1>\n${page.blocks.map((block) => this.renderBlock(block)).join('\n')}`;

    return this.shell({
      title: page.title,
      description,
      canonicalUrl,
      ogImage: this.absoluteHttpUrl(page.ogImageUrl, SITE_ORIGIN),
      headerLinks: nav.header,
      footerColumns: nav.footerColumns,
      bodyHtml,
      robots: null,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.title,
        description,
        url: canonicalUrl
      }
    });
  }

  private async renderSyringeFilters(page: Page): Promise<string> {
    const nav = await this.loadNav();
    const canonicalUrl = `${SITE_ORIGIN}/syringe-filters`;
    const description =
      page.metaDescription ??
      'Explore Nylon, PTFE, PVDF, and MCE syringe filters for HPLC sample preparation, including 25 mm and 0.45 µm laboratory options.';
    const ogImage = `${SITE_ORIGIN}/assets/products/nylon-syringe-filter-hero-1280.jpg`;
    const intro =
      page.blocks.find((block) => block.blockType === 'paragraph')?.paragraphText ??
      'Gimo Tech Supplies provides syringe filters for routine HPLC sample preparation, sample clarification, and laboratory filtration workflows.';

    const bodyHtml = `<article class="sf-page">
  <section class="sf-hero" aria-labelledby="sf-page-title">
    <div class="sf-shell"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Syringe Filters</span></nav></div>
    <div class="sf-shell sf-hero-grid">
      <div class="sf-hero-copy">
        <p class="sf-eyebrow">Precision sample preparation</p>
        <h1 id="sf-page-title">${escapeHtml(page.title)}</h1>
        <p class="sf-lede">${escapeHtml(intro)}</p>
        <div class="sf-hero-actions">
          <a class="button dark" href="${NYLON_PRODUCT_PATH}">View the Nylon filter</a>
          <a class="button sf-lazada-button" href="https://www.lazada.com.ph/products/i3969520270.html" target="_blank" rel="noopener noreferrer">Shop on Lazada now <span aria-hidden="true">↗</span></a>
          <a class="text-link" href="mailto:gimotechsupplies@gmail.com?subject=Syringe%20filter%20quotation">Request product matching</a>
        </div>
        <div class="sf-proof" aria-label="Available syringe filter options">
          <div><strong>4 membranes</strong><span>Nylon, PTFE, PVDF and MCE</span></div>
          <div><strong>25 mm format</strong><span>Common laboratory diameter</span></div>
          <div><strong>0.45 µm option</strong><span>Confirm against your method</span></div>
        </div>
      </div>
      <div class="sf-visual">
        <div class="sf-stage" id="syringe-filter-stage">
          <canvas id="syringe-filter-canvas" role="img" tabindex="0" aria-label="Interactive 3D model of a yellow 25 millimetre nylon syringe filter" aria-describedby="sf-canvas-help"></canvas>
          <p id="sf-canvas-help" class="sf-sr-only">Drag the model or use the arrow keys to inspect it. The animation is decorative and can be paused.</p>
          <p class="sf-stage-loading" role="status">Loading interactive 3D model</p>
          <button class="sf-motion-toggle" id="sf-motion-toggle" type="button" aria-pressed="false" hidden>Pause 3D motion</button>
        </div>
        <div class="sf-callout membrane"><strong>Nylon membrane</strong><span>General sample preparation</span></div>
        <div class="sf-callout pore"><strong>0.45 µm</strong><span>Verified pictured format</span></div>
        <div class="sf-callout format"><strong>25 mm</strong><span>Filter diameter</span></div>
      </div>
    </div>
  </section>

  <section class="sf-section sf-membranes" aria-labelledby="sf-membranes-title">
    <div class="sf-shell">
      <div class="sf-section-head">
        <div><p class="sf-eyebrow">Membrane selection</p><h2 id="sf-membranes-title">Match the filter to your method.</h2></div>
        <p>Selection depends on the complete sample composition, solvent system, analytes, sterility needs, and validated laboratory method. These categories are a starting point, not a substitute for manufacturer compatibility data.</p>
      </div>
      <div class="sf-membrane-grid">
        <article class="sf-membrane-card featured" style="--membrane-color:#f5b800"><small>NY · GENERAL PREP</small><h3>Nylon</h3><p>Catalogued for general aqueous and mixed sample-preparation workflows. Confirm compatibility with the entire formulation.</p></article>
        <article class="sf-membrane-card" style="--membrane-color:#22c7c4"><small>PTFE · SOLVENT REVIEW</small><h3>PTFE</h3><p>Compare for stronger-solvent workflows, then verify that the supplied membrane and housing fit the sample system.</p></article>
        <article class="sf-membrane-card" style="--membrane-color:#087bdd"><small>PVDF · LOW BINDING</small><h3>PVDF</h3><p>Consider where low-binding performance is important, with method-specific analyte recovery and compatibility checks.</p></article>
        <article class="sf-membrane-card" style="--membrane-color:#8ba5b7"><small>MCE · CLARIFICATION</small><h3>MCE</h3><p>Compare for general clarification workflows after verifying the method, sample, and solvent requirements.</p></article>
      </div>
      <p class="sf-small-note">Product availability, packaging, and suitability are confirmed for each enquiry.</p>
    </div>
  </section>

  <section class="sf-section sf-anatomy" aria-labelledby="sf-anatomy-title">
    <div class="sf-shell sf-anatomy-grid">
      <div>
        <p class="sf-eyebrow">Filtration workflow</p>
        <h2 id="sf-anatomy-title">A compact path from sample to analysis.</h2>
        <div class="sf-flow">
          <article><b>01</b><div><h3>Load the sample</h3><p>Connect the selected filter using the inlet and outlet format specified by the applicable manufacturer documentation.</p></div></article>
          <article><b>02</b><div><h3>Pass through the membrane</h3><p>The membrane choice and pore size must align with your sample, solvent, analyte, and validated procedure.</p></div></article>
          <article><b>03</b><div><h3>Collect for the next step</h3><p>Use the filtrate according to your laboratory method and instrument-preparation requirements.</p></div></article>
        </div>
      </div>
      <article class="sf-feature-card">
        <picture>
          <source srcset="/assets/products/nylon-syringe-filter-hero-640.jpg 640w, /assets/products/nylon-syringe-filter-hero-1280.jpg 1280w" sizes="(max-width: 720px) calc(100vw - 80px), 390px">
          <img src="/assets/products/nylon-syringe-filter-hero-640.jpg" width="640" height="512" alt="Canister of GIMO 25 millimetre 0.45 micrometre nylon syringe filters" loading="lazy" decoding="async">
        </picture>
        <p class="sf-eyebrow">Featured configuration</p>
        <h3>25 mm 0.45 µm Nylon</h3>
        <p>The verified product page documents the pictured non-sterile canister containing 100 pieces.</p>
        <div class="sf-specs" aria-label="Verified filter specifications"><span>Nylon</span><span>25 mm</span><span>0.45 µm</span><span>100 pieces</span></div>
        <a class="text-link" href="${NYLON_PRODUCT_PATH}">Review verified product details →</a>
      </article>
    </div>
  </section>

  <section class="sf-section sf-selection" aria-labelledby="sf-selection-title">
    <div class="sf-shell">
      <div class="sf-selection-panel">
        <div><p class="sf-eyebrow">Before you order</p><h2 id="sf-selection-title">Share the method, sample system, quantity, and destination.</h2><p>GIMO can help compare membrane options and confirm current packaging and delivery details without assuming compatibility or stock.</p></div>
        <a class="button" href="/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters">Compare membranes</a>
      </div>
    </div>
  </section>
</article>`;

    return this.shell({
      title: page.title,
      description,
      canonicalUrl,
      ogImage,
      headerLinks: nav.header,
      footerColumns: nav.footerColumns,
      bodyHtml,
      robots: null,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'WebPage', name: page.title, description, url: canonicalUrl },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Syringe Filters', item: canonicalUrl }
            ]
          }
        ]
      },
      stylesheets: ['/assets/syringe-filters.css'],
      scripts: ['/assets/syringe-filter-3d.js']
    });
  }

  async renderNotFound(origin: string): Promise<string> {
    const nav = await this.loadNav();
    return this.shell({
      title: 'Page not found',
      description: 'The page you requested could not be found.',
      canonicalUrl: null,
      ogImage: null,
      headerLinks: nav.header,
      footerColumns: nav.footerColumns,
      bodyHtml: `<section class="error-page" aria-labelledby="not-found-title">
  <p class="error-code">404 · Page not found</p>
  <h1 id="not-found-title">We couldn’t find that page.</h1>
  <p>The link may be out of date, or the page may have moved. You can return to the Gimo Tech Supplies home page or browse our syringe filters.</p>
  <div class="error-actions"><a class="button dark" href="/">Go to homepage</a><a class="text-link" href="/syringe-filters">Browse syringe filters</a></div>
</section>`,
      robots: 'noindex,follow',
      jsonLd: null
    });
  }

  async renderQuotationThankYou(origin: string, requestNumber: string | null): Promise<string> {
    const nav = await this.loadNav();
    const requestLabel = requestNumber ? `<p class="error-code">Request reference · ${escapeHtml(requestNumber)}</p>` : '';
    return this.shell({
      title: 'Quotation request received',
      description: 'Your Gimo Tech Supplies quotation request has been received.',
      canonicalUrl: `${SITE_ORIGIN}/quotation-request-received`,
      ogImage: null,
      headerLinks: nav.header,
      footerColumns: nav.footerColumns,
      bodyHtml: `<section class="error-page" aria-labelledby="quotation-thank-you-title">${requestLabel}<h1 id="quotation-thank-you-title">Thank you for your quotation request.</h1><p>Our supply team has received your request and will review the quantities, availability, and delivery requirements before sending your formal quotation by email.</p><div class="error-actions"><a class="button dark" href="/">Return to homepage</a><a class="text-link" href="/lazada-shop">Visit our Lazada shop</a></div></section>`,
      robots: 'noindex,follow',
      jsonLd: null
    });
  }

  async renderProduct(product: Product, origin: string): Promise<string> {
    const nav = await this.loadNav();
    const canonicalUrl = `${SITE_ORIGIN}/product/${product.id}`;
    const images = product.images.length > 0 ? product.images : product.imageUrl ? [{ id: 0, url: product.imageUrl }] : [];
    const imageUrl = this.absoluteHttpUrl(images[0]?.url ?? null, SITE_ORIGIN);
    const imageMarkup = this.renderProductMedia(images, product.name, product.category, product.accent);
    const bodyHtml = `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/#shop">Catalog</a><span aria-hidden="true">/</span><span>${escapeHtml(product.name)}</span></nav>
<article class="product-page"><div class="product-page-media">${imageMarkup}</div><div class="product-page-copy"><p class="product-category">${escapeHtml(product.category)}</p><h1>${escapeHtml(product.name)}</h1><p class="product-sku">SKU: ${escapeHtml(product.sku)}</p><p>${escapeHtml(product.description)}</p><div class="product-page-actions"><a class="button dark" href="/?add-to-quote=${product.id}">Add to quotation bag</a><a class="text-link" href="mailto:gimotechsupplies@gmail.com?subject=${encodeURIComponent(`Quotation request: ${product.name}`)}">Ask about this product</a></div><p class="product-note">Pricing, availability, and delivery options are confirmed in your quotation.</p></div></article>`;
    return this.shell({
      title: product.name,
      description: product.description.slice(0, 160),
      canonicalUrl,
      ogImage: imageUrl,
      headerLinks: nav.header,
      footerColumns: nav.footerColumns,
      bodyHtml,
      robots: null,
      jsonLd: null,
      scripts: images.length > 0 ? ['/assets/product-gallery.js'] : []
    });
  }

  async renderNylonSyringeFilter(): Promise<string> {
    const nav = await this.loadNav();
    const canonicalUrl = `${SITE_ORIGIN}${NYLON_PRODUCT_PATH}`;
    const description = 'Buy 25mm 0.45µm nylon syringe filters in the Philippines for HPLC sample preparation and general laboratory filtration. Non-sterile 100-piece packs from GIMO Laboratory Supplies.';
    const image = `${SITE_ORIGIN}/assets/products/nylon-syringe-filter-hero-1280.jpg`;
    const faqs = [
      {
        question: 'What is this 25mm 0.45µm nylon syringe filter used for?',
        answer: 'It is supplied for HPLC sample preparation and general laboratory filtration. Suitability still depends on the sample, solvent system, and validated laboratory method.'
      },
      {
        question: 'Is this nylon syringe filter sterile?',
        answer: 'The pictured 100-piece canister is labeled non-sterile. Ask GIMO Laboratory Supplies to confirm whether a sterile configuration is available for your required quantity.'
      },
      {
        question: 'How many filters are in a pack?',
        answer: 'The verified non-sterile canister shown on this page contains 100 pieces. Other packaging configurations must be confirmed when requesting a quotation.'
      },
      {
        question: 'Can GIMO deliver syringe filters outside Metro Manila?',
        answer: 'GIMO coordinates delivery enquiries throughout the Philippines. The destination, courier options, lead time, and charges are confirmed with the quotation or order.'
      },
      {
        question: 'How do I check chemical compatibility?',
        answer: 'Provide the complete sample and solvent composition before ordering. GIMO can help compare membrane options, but the laboratory remains responsible for confirming compatibility against the manufacturer documentation and its validated method.'
      }
    ];

    // TODO(product-data): Replace the clearly marked confirmation rows below when a
    // manufacturer datasheet verifies housing material, inlet/outlet format, sterility
    // options, operating limits, and a SKU. Do not infer these values from photography.
    const bodyHtml = `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/syringe-filters">Syringe Filters</a><span aria-hidden="true">/</span><span aria-current="page">Nylon Syringe Filter 25mm 0.45µm</span></nav>
<article class="seo-product">
  <section class="product-page" aria-labelledby="nylon-product-title">
    <div class="product-page-media"><picture><source srcset="/assets/products/nylon-syringe-filter-hero-640.jpg 640w, /assets/products/nylon-syringe-filter-hero-1280.jpg 1280w" sizes="(max-width: 700px) calc(100vw - 40px), 520px"><img src="/assets/products/nylon-syringe-filter-hero-640.jpg" width="640" height="512" alt="25mm 0.45µm non-sterile nylon syringe filter canister supplied by GIMO Laboratory Supplies Philippines" fetchpriority="high" decoding="async"></picture></div>
    <div class="product-page-copy"><p class="product-category">Laboratory filtration · Philippines</p><h1 id="nylon-product-title">Nylon Syringe Filter 25mm 0.45µm</h1><p>GIMO Laboratory Supplies provides 25mm 0.45µm nylon syringe filters for HPLC sample preparation and general laboratory filtration in the Philippines. This page documents the verified non-sterile, 100-piece canister shown; procurement teams may enquire about other configurations without assuming they are in stock.</p><div class="product-page-actions"><a class="button dark" href="mailto:gimotechsupplies@gmail.com?subject=Quotation%20request%3A%2025mm%200.45%C2%B5m%20nylon%20syringe%20filters">Request a quotation</a><a class="text-link" href="https://www.lazada.com.ph/products/i3969520270.html" target="_blank" rel="noopener noreferrer">Check the product on Lazada <span aria-hidden="true">↗</span></a></div><p class="product-note">Pricing, current availability, delivery timing, and sterile options are confirmed before purchase.</p></div>
  </section>
  <section aria-labelledby="specifications-title"><h2 id="specifications-title">Product specifications</h2><div class="table-wrap"><table><tbody><tr><th scope="row">Membrane</th><td>Nylon</td></tr><tr><th scope="row">Filter diameter</th><td>25 mm</td></tr><tr><th scope="row">Pore size</th><td>0.45 µm</td></tr><tr><th scope="row">Verified packaging</th><td>Non-sterile canister, 100 pieces</td></tr><tr><th scope="row">Sterile packaging</th><td>Availability must be confirmed with GIMO before ordering</td></tr><tr><th scope="row">Housing, connectors, SKU, and operating limits</th><td>Not verified in the current catalog; request the applicable manufacturer specification</td></tr></tbody></table></div></section>
  <section class="content-grid" aria-label="Applications and selection guidance"><div><h2>Applications and recommended uses</h2><p>This format is offered for HPLC sample preparation, routine sample clarification, and general laboratory filtration. It may suit purchasing departments, researchers, schools, universities, clinics, and industrial laboratories whose methods specify a 25 mm nylon membrane with a 0.45 µm pore size.</p><p>Confirm the membrane, diameter, pore size, sterility requirement, and pack quantity against your laboratory method before use.</p></div><div><h2>Chemical compatibility and limitations</h2><p>Nylon is presented in the existing catalog for general aqueous and mixed sample-preparation workflows. Compatibility cannot be determined from the membrane name alone: it depends on the complete formulation, concentration, temperature, contact time, and housing materials.</p><p>Do not use this product with an unverified solvent or sample system, for sterile processing when supplied non-sterile, or outside manufacturer operating limits. For aggressive solvent workflows, review <a href="/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters#ptfe">PTFE syringe filter considerations</a> and request a compatibility check.</p></div></section>
  <section class="delivery-panel" aria-labelledby="delivery-title"><div><p class="product-category">Nationwide enquiries</p><h2 id="delivery-title">Delivery availability throughout the Philippines</h2><p>GIMO accepts delivery enquiries from laboratories and procurement teams across the Philippines. Share the destination and required quantity so courier availability, lead time, charges, and current product availability can be confirmed accurately.</p></div><a class="button aqua" href="mailto:gimotechsupplies@gmail.com?subject=Philippines%20delivery%20enquiry%3A%20nylon%20syringe%20filters">Ask about delivery</a></section>
  <section aria-labelledby="related-title"><h2 id="related-title">Compare related syringe filter membranes</h2><div class="related-grid"><a href="/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters#ptfe"><strong>PTFE Syringe Filters</strong><span>Review general solvent-workflow considerations.</span></a><a href="/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters#pvdf"><strong>PVDF Syringe Filters</strong><span>Review general low-binding selection considerations.</span></a><a href="/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters#mce"><strong>MCE Syringe Filters</strong><span>Review general clarification considerations.</span></a></div></section>
  <section aria-labelledby="faq-title"><h2 id="faq-title">Frequently asked questions</h2><div class="faq-list">${faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join('')}</div></section>
</article>`;

    return this.shell({
      title: 'Nylon Syringe Filter 25mm 0.45µm Philippines | GIMO Laboratory Supplies',
      fullTitle: true,
      description,
      canonicalUrl,
      ogImage: image,
      ogType: 'product',
      headerLinks: nav.header,
      footerColumns: nav.footerColumns,
      bodyHtml,
      robots: null,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Product',
            '@id': `${canonicalUrl}#product`,
            name: 'Nylon Syringe Filter 25mm 0.45µm',
            description,
            image: [image],
            brand: { '@type': 'Brand', name: 'GIMO Laboratory Supplies' },
            category: 'Laboratory syringe filters',
            url: canonicalUrl
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Syringe Filters', item: `${SITE_ORIGIN}/syringe-filters` },
              { '@type': 'ListItem', position: 3, name: 'Nylon Syringe Filter 25mm 0.45µm', item: canonicalUrl }
            ]
          },
          {
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer }
            }))
          }
        ]
      }
    });
  }

  async renderSyringeFilterGuide(): Promise<string> {
    const nav = await this.loadNav();
    const canonicalUrl = `${SITE_ORIGIN}/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters`;
    const description = 'Compare Nylon, PTFE, PVDF, and MCE syringe filters for general laboratory and HPLC sample-preparation workflows in the Philippines.';
    const bodyHtml = `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/syringe-filters">Syringe Filters</a><span aria-hidden="true">/</span><span aria-current="page">Membrane comparison guide</span></nav>
<article class="guide-page"><p class="product-category">Syringe filter selection guide</p><h1>Nylon vs PTFE vs PVDF vs MCE Syringe Filters</h1><p class="lede">Membrane selection should follow the complete sample composition, solvent system, analytes, sterility needs, and validated laboratory method. This guide gives a conservative starting point; it does not replace manufacturer compatibility data.</p>
<div class="table-wrap"><table><thead><tr><th scope="col">Membrane</th><th scope="col">Typical catalog positioning</th><th scope="col">Selection check</th></tr></thead><tbody><tr id="nylon"><th scope="row">Nylon</th><td>General aqueous and mixed sample preparation</td><td>Confirm compatibility with the entire formulation</td></tr><tr id="ptfe"><th scope="row">PTFE</th><td>Stronger-solvent workflows</td><td>Confirm whether the supplied format is appropriate for the sample system</td></tr><tr id="pvdf"><th scope="row">PVDF</th><td>Methods seeking a low-binding option</td><td>Verify analyte recovery and chemical compatibility</td></tr><tr id="mce"><th scope="row">MCE</th><td>General sample clarification</td><td>Verify method, sample, and solvent suitability</td></tr></tbody></table></div>
<section><h2>How to choose a syringe filter membrane</h2><ol><li>Start with the validated method or instrument requirements.</li><li>List every solvent and sample component, including concentrations.</li><li>Confirm the required diameter, pore size, sterility, and pack format.</li><li>Check manufacturer documentation for both membrane and housing compatibility.</li><li>Run method-appropriate verification before routine analytical use.</li></ol></section>
<section class="content-grid"><div><h2>When nylon may fit</h2><p>The current GIMO catalog positions nylon for general aqueous and mixed sample-preparation workflows. Laboratories needing a 25 mm, 0.45 µm format can review the dedicated <a href="${NYLON_PRODUCT_PATH}">25mm Nylon Syringe Filter</a> page.</p></div><div><h2>When to compare alternatives</h2><p>Compare PTFE for stronger-solvent workflows, PVDF where a low-binding option is being considered, and MCE for general clarification. These are selection prompts, not universal compatibility claims.</p></div></section>
<aside class="delivery-panel"><div><h2>Need product matching?</h2><p>Send GIMO your sample system, requested format, quantity, and delivery destination. Availability and suitability details will be confirmed rather than assumed.</p></div><a class="button dark" href="mailto:gimotechsupplies@gmail.com?subject=Syringe%20filter%20selection%20enquiry">Ask GIMO Laboratory Supplies</a></aside></article>`;
    return this.shell({
      title: 'Nylon vs PTFE vs PVDF vs MCE Syringe Filters',
      description,
      canonicalUrl,
      ogImage: `${SITE_ORIGIN}/assets/products/nylon-syringe-filter-hero-1280.jpg`,
      headerLinks: nav.header,
      footerColumns: nav.footerColumns,
      bodyHtml,
      robots: null,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Article', headline: 'Nylon vs PTFE vs PVDF vs MCE Syringe Filters', description, mainEntityOfPage: canonicalUrl, publisher: { '@type': 'Organization', name: 'GIMO Laboratory Supplies', url: `${SITE_ORIGIN}/` } },
          { '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Syringe Filters', item: `${SITE_ORIGIN}/syringe-filters` },
            { '@type': 'ListItem', position: 3, name: 'Membrane comparison guide', item: canonicalUrl }
          ] }
        ]
      }
    });
  }

  async renderSequentialQrCodeLabels(): Promise<string> {
    const nav = await this.loadNav();
    const canonicalUrl = `${SITE_ORIGIN}/sequential-qr-code-labels`;
    const title = 'Sequential QR Code Labels Philippines | Gimo Tech Supplies';
    const description = 'Order custom 30 × 20 mm sequential QR code labels on durable adhesive paper for tracking, labeling, and inventory workflows in the Philippines.';
    const image = `${SITE_ORIGIN}/assets/products/sequential-qr-labels-hero-1280.jpg`;
    const quoteHref = 'mailto:gimotechsupplies@gmail.com?subject=Bulk%20order%20enquiry%3A%20Sequential%20QR%20code%20labels';
    const faqs = [
      {
        question: 'What size are the sequential QR code labels?',
        answer: 'This offer is for labels printed at 30 × 20 mm. Share your application and required quantity so the final layout and order details can be confirmed before production.'
      },
      {
        question: 'Can every label have a different QR code or number?',
        answer: 'Yes. The offer supports sequential numbering and unique QR code printing. Provide the required sequence or source data when requesting a quotation.'
      },
      {
        question: 'Are the labels suitable for wet or oily environments?',
        answer: 'The offered adhesive paper is described as water, oil, and scratch resistant. Confirm the intended surface, exposure conditions, and handling requirements before ordering so suitability can be reviewed.'
      },
      {
        question: 'Can I place a bulk order?',
        answer: 'Yes. Send the required quantity, numbering range, QR data, delivery destination, and target schedule to Gimo Tech Supplies for a custom quotation.'
      }
    ];

    const icon = (path: string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>`;
    const bodyHtml = `<article class="qr-page">
  <section class="qr-hero" aria-labelledby="qr-page-title">
    <div class="qr-shell"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Sequential QR Code Labels</span></nav></div>
    <div class="qr-shell qr-hero-grid">
      <div class="qr-hero-copy">
        <p class="qr-eyebrow">Custom identification labels</p>
        <h1 id="qr-page-title">Sequential<br> QR Code Labels</h1>
        <p class="qr-format">Printed on <strong>30 × 20 mm</strong> water-, oil-, and scratch-resistant adhesive paper.</p>
        <ul class="qr-benefit-list">
          <li><span class="qr-benefit-icon">${icon('M12 3l8 4v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V7l8-4zm-3 9l2 2 4-5')}</span><span><strong>Durable adhesive labels</strong><small>Designed for clear, dependable identification</small></span></li>
          <li><span class="qr-benefit-icon">${icon('M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h2v2h-2v-2zm4 0h2v6h-6v-2h4v-4z')}</span><span><strong>Clear QR code printing</strong><small>Unique code data can be supplied per label</small></span></li>
          <li><span class="qr-benefit-icon">${icon('M5 6h14M5 12h14M5 18h14')}</span><span><strong>Sequential numbering available</strong><small>Organize series for repeatable tracking workflows</small></span></li>
        </ul>
        <div class="qr-actions"><a class="button dark" href="${quoteHref}">${icon('M4 5h16v11H8l-4 3V5zm4 5h8M8 13h5')}<span>Message us for bulk orders</span></a><a class="text-link" href="#order-details">See order requirements</a></div>
      </div>
      <figure class="qr-hero-visual">
        <picture>
          <source srcset="/assets/products/sequential-qr-labels-hero-640.jpg 640w, /assets/products/sequential-qr-labels-hero-1280.jpg 1280w" sizes="(max-width: 960px) calc(100vw - 32px), 610px">
          <img src="/assets/products/sequential-qr-labels-hero-640.jpg" width="640" height="426" alt="Roll of white sequential QR code adhesive labels on a pale blue backing" fetchpriority="high" decoding="async">
        </picture>
        <figcaption><strong>30 × 20 mm</strong><span>Custom sequential print format</span></figcaption>
      </figure>
    </div>
  </section>

  <section class="qr-section qr-use-cases" aria-labelledby="qr-use-cases-title">
    <div class="qr-shell">
      <div class="qr-section-head"><div><p class="qr-eyebrow">Built for traceability</p><h2 id="qr-use-cases-title">One label. A clear identity for every item.</h2></div><p>Sequential QR labels can support organized tracking across equipment, samples, assets, packages, files, and inventory. The data structure remains yours; Gimo Tech Supplies coordinates the print specification.</p></div>
      <div class="qr-card-grid">
        <article><span class="qr-card-icon">${icon('M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4M4 17l8 4 8-4')}</span><h3>Inventory labeling</h3><p>Assign unique identifiers to stock, supplies, and storage locations.</p></article>
        <article><span class="qr-card-icon">${icon('M4 5h16v14H4V5zm4 4h8M8 13h5')}</span><h3>Asset tracking</h3><p>Connect physical equipment or property to your chosen digital record.</p></article>
        <article><span class="qr-card-icon">${icon('M7 3h10v4h3v14H4V7h3V3zm2 4h6V5H9v2z')}</span><h3>Sample identification</h3><p>Keep a readable label and sequential reference close to each container.</p></article>
        <article><span class="qr-card-icon">${icon('M3 6h18M6 3v6m12-6v6M5 11h14v10H5V11z')}</span><h3>Batch organization</h3><p>Prepare ordered series for production, receiving, or distribution workflows.</p></article>
      </div>
    </div>
  </section>

  <section class="qr-section qr-spec-section" aria-labelledby="qr-spec-title">
    <div class="qr-shell qr-spec-grid">
      <div>
        <p class="qr-eyebrow">Offer details</p>
        <h2 id="qr-spec-title">A compact label with room for a unique code.</h2>
        <p>The 30 × 20 mm format combines a QR code with an optional human-readable sequence. Final code density and readability depend on the supplied data, print layout, and scanner requirements.</p>
        <div class="qr-spec-list" role="list" aria-label="Sequential QR label specifications">
          <div role="listitem"><span>Label size</span><strong>30 × 20 mm</strong></div>
          <div role="listitem"><span>Print</span><strong>QR code + sequence</strong></div>
          <div role="listitem"><span>Paper</span><strong>Water, oil &amp; scratch resistant</strong></div>
          <div role="listitem"><span>Format</span><strong>Adhesive roll labels</strong></div>
        </div>
      </div>
      <aside class="qr-data-card">
        <span class="qr-demo-code" aria-hidden="true"></span>
        <p class="qr-eyebrow">Your data, your sequence</p>
        <h3>Plan the label series before printing.</h3>
        <p>Send the numbering range and QR destination or encoded value. A representative can confirm what file format is needed for your order.</p>
      </aside>
    </div>
  </section>

  <section class="qr-section qr-order" id="order-details" aria-labelledby="qr-order-title">
    <div class="qr-shell">
      <div class="qr-section-head"><div><p class="qr-eyebrow">Bulk order workflow</p><h2 id="qr-order-title">What to include in your enquiry.</h2></div><p>Complete details help the team review your label layout and prepare an accurate quotation without assuming quantity, price, or production timing.</p></div>
      <ol class="qr-steps">
        <li><b>01</b><div><h3>Describe the application</h3><p>Share the surface, environment, scanning device, and how the labels will be used.</p></div></li>
        <li><b>02</b><div><h3>Provide the QR data</h3><p>Include the numbering range, encoded values or destinations, and any human-readable text.</p></div></li>
        <li><b>03</b><div><h3>Confirm order details</h3><p>State the required quantity, delivery destination, and target schedule for quotation review.</p></div></li>
      </ol>
    </div>
  </section>

  <section class="qr-section qr-faq" aria-labelledby="qr-faq-title">
    <div class="qr-shell qr-faq-grid"><div><p class="qr-eyebrow">Frequently asked questions</p><h2 id="qr-faq-title">Before you order</h2><p>Have a different labeling requirement? Send your specifications and intended workflow for review.</p></div><div class="faq-list">${faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join('')}</div></div>
  </section>

  <section class="qr-cta" aria-labelledby="qr-cta-title"><div class="qr-shell"><div><p class="qr-eyebrow">Custom bulk printing</p><h2 id="qr-cta-title">Ready to prepare your label series?</h2><p>Send your quantity, sequence, QR data, and delivery destination to request a quotation.</p></div><a class="button" href="${quoteHref}">Message Gimo Tech Supplies</a></div></section>
</article>`;

    return this.shell({
      title,
      fullTitle: true,
      description,
      canonicalUrl,
      ogImage: image,
      headerLinks: nav.header,
      footerColumns: nav.footerColumns,
      bodyHtml,
      robots: null,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'WebPage', name: 'Sequential QR Code Labels', description, url: canonicalUrl, primaryImageOfPage: image },
          { '@type': 'Service', name: 'Sequential QR Code Label Printing', description, image, provider: { '@type': 'Organization', name: 'Gimo Tech Supplies', url: `${SITE_ORIGIN}/` }, areaServed: { '@type': 'Country', name: 'Philippines' }, url: canonicalUrl },
          { '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Sequential QR Code Labels', item: canonicalUrl }
          ] },
          { '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }
        ]
      },
      stylesheets: ['/assets/sequential-qr-labels.css']
    });
  }

  private renderProductMedia(images: { id: number; url: string }[], productName: string, category: string, accent: string): string {
    if (images.length === 0) {
      return `<div class="product-page-placeholder" style="background:${escapeHtml(accent)}" aria-hidden="true">${escapeHtml(category.slice(0, 1))}</div>`;
    }
    if (images.length === 1) {
      return `<img src="${escapeHtml(images[0].url)}" width="760" height="570" alt="${escapeHtml(productName)}" fetchpriority="high" decoding="async">`;
    }
    const slides = images
      .map(
        (image, index) =>
          `<figure class="product-gallery-slide">${
            index === 0
              ? `<img src="${escapeHtml(image.url)}" width="760" height="570" alt="${escapeHtml(productName)}" fetchpriority="high" decoding="async">`
              : `<img src="${escapeHtml(image.url)}" width="760" height="570" alt="${escapeHtml(productName)} – photo ${index + 1} of ${images.length}" loading="lazy" decoding="async">`
          }</figure>`
      )
      .join('');
    const thumbs = images
      .map(
        (image, index) =>
          `<button type="button" class="product-thumb" aria-current="${index === 0 ? 'true' : 'false'}" aria-label="View photo ${index + 1} of ${images.length}"><img src="${escapeHtml(image.url)}" width="120" height="90" alt="" loading="lazy" decoding="async"></button>`
      )
      .join('');
    return `<div class="product-gallery"><div class="product-gallery-main">${slides}</div><div class="product-thumbs" role="group" aria-label="Product images">${thumbs}</div></div>`;
  }

  private async loadNav(): Promise<{ header: NavLink[]; footerColumns: FooterColumn[] }> {
    const [header, productsLinks, servicesLinks, purchasingLinks] = await Promise.all([
      this.resolveNav('header'),
      this.resolveNav('footer_products'),
      this.resolveNav('footer_services'),
      this.resolveNav('footer_purchasing')
    ]);
    return {
      header,
      footerColumns: [
        { label: 'Products', links: productsLinks },
        { label: 'Services', links: servicesLinks },
        { label: 'Purchasing help', links: purchasingLinks }
      ]
    };
  }

  private async resolveNav(location: MenuLocation): Promise<NavLink[]> {
    const items = await this.menuItems.find({
      where: { location, isActive: true },
      relations: { page: true },
      order: { sortOrder: 'ASC' }
    });
    return items
      .map((item) => ({
        label: item.label,
        href: item.linkType === 'page' ? (item.page?.status === 'published' ? `/${item.page.slug}` : null) : item.href,
        openInNewTab: item.openInNewTab
      }))
      .filter((link): link is NavLink => Boolean(link.href));
  }

  private renderBlock(block: PageBlock): string {
    switch (block.blockType) {
      case 'heading': {
        const level = block.headingLevel === 3 ? 'h3' : 'h2';
        return `<${level}>${escapeHtml(block.headingText ?? '')}</${level}>`;
      }
      case 'paragraph':
        return `<p>${escapeHtml(block.paragraphText ?? '')}</p>`;
      case 'image':
        return block.imageUrl
          ? `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.imageAlt ?? '')}" loading="lazy" decoding="async">`
          : '';
      case 'button':
        return block.buttonHref
          ? `<a class="button aqua" href="${escapeHtml(block.buttonHref)}">${escapeHtml(block.buttonLabel ?? '')}</a>`
          : '';
      default:
        return '';
    }
  }

  private shell(options: {
    title: string;
    fullTitle?: boolean;
    description: string;
    canonicalUrl: string | null;
    ogImage: string | null;
    headerLinks: NavLink[];
    footerColumns: FooterColumn[];
    bodyHtml: string;
    robots: string | null;
    jsonLd: Record<string, unknown> | null;
    ogType?: 'website' | 'product' | 'article';
    stylesheets?: string[];
    scripts?: string[];
  }): string {
    const link = (item: NavLink) =>
      `<a href="${escapeHtml(item.href)}"${item.openInNewTab ? ' target="_blank" rel="noopener"' : ''}>${escapeHtml(item.label)}</a>`;

    const headerNav = options.headerLinks.map(link).join('\n');
    const footerColumns = options.footerColumns
      .map((column) => `<div><h4>${escapeHtml(column.label)}</h4>${column.links.map(link).join('')}</div>`)
      .join('\n');

    const jsonLdScript = options.jsonLd
      ? `<script type="application/ld+json">${JSON.stringify(options.jsonLd)}</script>`
      : '';
    const ogImageTag = options.ogImage ? `<meta property="og:image" content="${escapeHtml(options.ogImage)}">` : '';
    const twitterImageTag = options.ogImage ? `<meta name="twitter:image" content="${escapeHtml(options.ogImage)}">` : '';
    const canonicalTag = options.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(options.canonicalUrl)}">` : '';
    const robotsTag = options.robots ? `<meta name="robots" content="${escapeHtml(options.robots)}">` : '';
    const ogUrlTag = options.canonicalUrl ? `<meta property="og:url" content="${escapeHtml(options.canonicalUrl)}">` : '';
    const title = escapeHtml(options.fullTitle ? options.title : `${options.title} | Gimo Tech Supplies`);
    const stylesheetTags = (options.stylesheets ?? [])
      .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
      .join('\n');
    const scriptTags = (options.scripts ?? []).map((src) => `<script src="${escapeHtml(src)}" defer></script>`).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapeHtml(options.description)}">
${canonicalTag}
${robotsTag}
<meta name="theme-color" content="#153f70">
<meta property="og:type" content="${options.ogType ?? 'website'}">
${ogUrlTag}
<meta property="og:site_name" content="Gimo Tech Supplies">
<meta property="og:title" content="${escapeHtml(options.title)}">
<meta property="og:description" content="${escapeHtml(options.description)}">
${ogImageTag}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(options.title)}">
<meta name="twitter:description" content="${escapeHtml(options.description)}">
${twitterImageTag}
<link rel="icon" type="image/png" sizes="64x64" href="/gimo-flask-favicon-v2.png">
<link rel="shortcut icon" type="image/x-icon" href="/gimo-flask-favicon-v2.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/gimo-apple-touch-icon-v2.png">
<link rel="stylesheet" href="/assets/site-shell.css">
${stylesheetTags}
${jsonLdScript}
</head>
<body>
<header class="site-header">
  <a class="brand" href="/" aria-label="Gimo Tech Supplies home"><img src="/assets/brand/gimo-tech-supplies-logo-600.png" width="600" height="200" alt="Gimo Tech Supplies"></a>
  <nav aria-label="Primary navigation">${headerNav}</nav>
</header>
<main class="site-main">${options.bodyHtml}</main>
<footer class="site-footer"><div class="footer-grid">${footerColumns}</div></footer>
${scriptTags}
</body>
</html>`;
  }

  private absoluteHttpUrl(value: string | null, origin: string): string | null {
    if (!value) return null;
    try {
      const url = new URL(value, `${origin}/`);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
    } catch {
      return null;
    }
  }
}
