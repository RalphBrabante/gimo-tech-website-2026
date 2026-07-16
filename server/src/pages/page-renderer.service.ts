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

@Injectable()
export class PageRendererService {
  constructor(@InjectRepository(MenuItemEntity) private readonly menuItems: Repository<MenuItemEntity>) {}

  async renderPage(page: Page, origin: string): Promise<string> {
    const nav = await this.loadNav();
    const canonicalUrl = `${origin}/${page.slug}`;
    const description = page.metaDescription ?? '';
    const bodyHtml = `<h1>${escapeHtml(page.title)}</h1>\n${page.blocks.map((block) => this.renderBlock(block)).join('\n')}`;

    return this.shell({
      title: page.title,
      description,
      canonicalUrl,
      ogImage: this.absoluteHttpUrl(page.ogImageUrl, origin),
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
      canonicalUrl: `${origin}/quotation-request-received`,
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
    const canonicalUrl = `${origin}/product/${product.id}`;
    const images = product.images.length > 0 ? product.images : product.imageUrl ? [{ id: 0, url: product.imageUrl }] : [];
    const imageUrl = this.absoluteHttpUrl(images[0]?.url ?? null, origin);
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
    description: string;
    canonicalUrl: string | null;
    ogImage: string | null;
    headerLinks: NavLink[];
    footerColumns: FooterColumn[];
    bodyHtml: string;
    robots: string | null;
    jsonLd: Record<string, unknown> | null;
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
    const title = escapeHtml(`${options.title} | Gimo Tech Supplies`);
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
<meta property="og:type" content="website">
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
