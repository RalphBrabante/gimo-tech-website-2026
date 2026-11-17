import type { ReactNode } from 'react';
import { ADDRESS_LINE, BUSINESS, NYLON_PATH } from '@/lib/site';

/**
 * Built-in documents for the legacy contact destinations. A published CMS page with the same slug
 * takes precedence. Each answers a different search intent rather than repeating one template.
 */
const offers = (
  <ul>
    <li><a href={NYLON_PATH}>25mm 0.45µm nylon syringe filters</a> and other <a href="/syringe-filters">syringe filters for HPLC sample preparation</a></li>
    <li><a href="/sequential-qr-code-labels">Sequential QR code labels</a> printed at 30 × 20 mm</li>
    <li><a href="/biohazard-bags">Customized biohazard bags</a> with printed identifiers and QR code attachments</li>
  </ul>
);
const email = <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>;

export const CONTACT_PAGES: Record<string, { title: string; heading: string; description: string; type: string; lede: string; body: ReactNode }> = {
  'about-gimo': {
    title: 'About Gimo Tech Supplies | Laboratory Supplies Philippines',
    heading: 'About Gimo Tech Supplies',
    description: 'Gimo Tech Supplies (GIMO Laboratory Supplies) is a San Pedro, Laguna supplier of syringe filters, sequential QR code labels and custom biohazard bags.',
    type: 'AboutPage',
    lede: 'Gimo Tech Supplies, also known as GIMO Laboratory Supplies, supplies laboratory consumables and coordinates custom printing enquiries for laboratories and procurement teams in the Philippines.',
    body: (
      <>
        <h2>What we supply</h2>{offers}
        <h2>How we work</h2>
        <p>Every order starts from your method and quantity. Share the configuration you need and the supply team confirms pricing, packaging, availability and delivery for your destination instead of assuming stock. Ready-to-ship items can also be ordered through the <a href="/lazada-shop">GIMO Laboratory Supplies Lazada shop</a> or the <a href={BUSINESS.shopeeShop} target="_blank" rel="noopener noreferrer">official GIMO Shopee shop</a>.</p>
        <h2>Where we are</h2>
        <p>{ADDRESS_LINE}. Contact us before arranging a visit.</p>
        <p><a className="btn btn-primary" href="/contact-us">Contact Gimo Tech Supplies</a> <a className="btn btn-outline" href="/request-for-a-quote">Request a quotation</a></p>
      </>
    )
  },
  'contact-us': {
    title: 'Contact Gimo Tech Supplies | San Pedro, Laguna',
    heading: 'Contact Gimo Tech Supplies',
    description: 'Email Gimo Tech Supplies about syringe filters, sequential QR code labels and custom biohazard bags. Based in San Pedro, Laguna, Philippines.',
    type: 'ContactPage',
    lede: 'Email the supply team about products, quotations, custom printing and delivery within the Philippines.',
    body: (
      <>
        <h2>Email</h2>
        <p>{email}</p>
        <p>Include the product or SKU, required configuration, pack quantity and delivery destination. For custom bags or labels, include your artwork, identifier series and QR data requirements.</p>
        <h2>Business address</h2>
        <p>{ADDRESS_LINE}. Contact us before arranging a visit.</p>
        <h2>Other ways to order</h2>
        <p><a href="/request-for-a-quote">Request a formal quotation</a> · <a href="/lazada-shop">Order online through Lazada</a> · <a href={BUSINESS.shopeeShop} target="_blank" rel="noopener noreferrer">Order online through Shopee</a> · <a href="/products">Browse the catalogue</a> · <a href={`${NYLON_PATH}#quote`}>Request nylon syringe filter pricing</a></p>
      </>
    )
  },
  'request-for-a-quote': {
    title: 'Request a Laboratory Supplies Quotation | Gimo Tech Supplies',
    heading: 'Request a Laboratory Supplies Quotation',
    description: 'Request a quotation for syringe filters, sequential QR code labels or custom biohazard bags. Pricing, availability and delivery are confirmed by email.',
    type: 'ContactPage',
    lede: 'Get a configuration-specific quotation for laboratory supplies delivered within the Philippines.',
    body: (
      <>
        <h2>What we can quote</h2>{offers}
        <h2>How to request a quotation</h2>
        <ol>
          <li>For nylon syringe filters, use the <a href={`${NYLON_PATH}#quote`}>quotation form on the nylon syringe filter page</a>.</li>
          <li>For other items, browse the <a href="/products">catalogue</a> and add products to your quote bag, or email {email} directly.</li>
          <li>Include the configuration, pack quantity and delivery destination. For printed bags or labels, add your artwork, identifier series and QR data.</li>
          <li>The supply team confirms pricing, availability and delivery timing by email before you order.</li>
        </ol>
        <p>Prefer to buy online now? Visit the <a href="/lazada-shop">GIMO Laboratory Supplies Lazada shop</a> or the <a href={BUSINESS.shopeeShop} target="_blank" rel="noopener noreferrer">GIMO Shopee shop</a>.</p>
      </>
    )
  }
};

/** Extra guidance appended to the CMS biohazard-bags page (not editable in the CMS). */
export const BIOHAZARD_EXTRA = (
  <>
    <h2>Prepare your printing brief</h2>
    <p>Include the desired dimensions, quantity, artwork, printed wording, identifier sequence, and QR destination or data. Ask the team to confirm the layout and proof approval process before production. Printed QR identifiers do not by themselves provide a complete waste-tracking system.</p>
    <h2>Related laboratory supplies</h2>
    <p>Pair printed bags with <a href="/sequential-qr-code-labels">sequential QR code labels</a> for containers and samples, or browse <a href="/syringe-filters">syringe filters for HPLC sample preparation</a>. <a href="/request-for-a-quote">Request a quotation</a> to combine items in one enquiry.</p>
  </>
);
