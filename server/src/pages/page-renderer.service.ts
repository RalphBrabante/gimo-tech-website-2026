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
