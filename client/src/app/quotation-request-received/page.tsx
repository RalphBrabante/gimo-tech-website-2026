import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Conversion destination for quotation and product-enquiry forms. Not indexed, never cached.
export const metadata: Metadata = pageMetadata({ title: 'Quotation request received', description: 'Your Gimo Tech Supplies quotation request has been received.', path: '/quotation-request-received', noindex: true });

export default async function QuotationReceivedPage({ searchParams }: Props) {
  const raw = (await searchParams).request;
  const requestNumber = typeof raw === 'string' && /^GQ-\d{6,}$/.test(raw) ? raw : null;
  return (
    <section className="status-page" aria-labelledby="thanks-title">
      <div className="shell-narrow">
        {requestNumber && <p className="status-code">Request reference · {requestNumber}</p>}
        <h1 id="thanks-title">Thank you for your quotation request.</h1>
        <p className="lede">Our supply team will review the quantities, availability and delivery requirements, then email your formal quotation.</p>
        <div className="btn-row center">
          <a className="btn btn-primary" href="/">Return to homepage</a>
          <a className="link-arrow" href="/lazada-shop">Visit our Lazada shop</a>
        </div>
      </div>
    </section>
  );
}
