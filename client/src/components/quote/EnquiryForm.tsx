'use client';

import { useState, type FormEvent } from 'react';

type Errors = Partial<Record<'quantity' | 'name' | 'email', string>>;

/**
 * Lead form for a dedicated product landing page. Submissions are stored as quotation requests
 * (internal Quotations screen) and end on /quotation-request-received, a stable URL that can be
 * used as the Google Ads / GA4 conversion page.
 */
export function EnquiryForm({ product, unitLabel, email }: { product: string; unitLabel: string; email: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? '').trim();
    const quantity = Number(text('quantity'));
    const next: Errors = {};
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) next.quantity = 'Enter a whole number of canisters (1 or more).';
    if (!text('name')) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('email'))) next.email = 'Enter a valid email address, for example name@laboratory.ph.';
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus({ text: 'Please correct the highlighted fields.', error: true });
      form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    setSubmitting(true);
    setStatus({ text: 'Sending your enquiry…', error: false });
    const optional = (name: string) => text(name) || undefined;
    try {
      const response = await fetch('/api/product-enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ product, quantity, name: text('name'), company: optional('company'), email: text('email'), phone: optional('phone'), deliveryLocation: optional('deliveryLocation'), notes: optional('notes'), website: text('website') || undefined })
      });
      if (!response.ok) throw new Error(String(response.status));
      const { requestNumber } = (await response.json()) as { requestNumber: string };
      window.dispatchEvent(new CustomEvent('gimo:quote-success'));
      window.location.assign(`/quotation-request-received?request=${encodeURIComponent(requestNumber)}`);
    } catch (error) {
      setSubmitting(false);
      const tooMany = error instanceof Error && error.message === '429';
      setStatus({ text: tooMany ? `Too many requests in a short time. Please wait a minute, or email ${email}.` : `We could not send your enquiry. Please try again, or email ${email}.`, error: true });
    }
  }

  const fieldProps = (name: keyof Errors) => ({
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined
  });
  const error = (name: keyof Errors) => errors[name] ? <p id={`${name}-error`} className="field-error">{errors[name]}</p> : null;

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="enq-quantity">Quantity ({unitLabel})</label>
          <input id="enq-quantity" type="number" inputMode="numeric" min={1} max={100000} step={1} defaultValue={1} required {...fieldProps('quantity')} />
          {error('quantity')}
        </div>
        <div className="field">
          <label htmlFor="enq-location">Delivery city or province <span className="muted">(optional)</span></label>
          <input id="enq-location" name="deliveryLocation" autoComplete="address-level2" maxLength={160} placeholder="e.g. Quezon City" />
        </div>
        <div className="field">
          <label htmlFor="enq-name">Full name</label>
          <input id="enq-name" autoComplete="name" required maxLength={160} {...fieldProps('name')} />
          {error('name')}
        </div>
        <div className="field">
          <label htmlFor="enq-company">Company or laboratory <span className="muted">(optional)</span></label>
          <input id="enq-company" name="company" autoComplete="organization" maxLength={160} />
        </div>
        <div className="field">
          <label htmlFor="enq-email">Email address</label>
          <input id="enq-email" type="email" autoComplete="email" required maxLength={254} {...fieldProps('email')} />
          {error('email')}
        </div>
        <div className="field">
          <label htmlFor="enq-phone">Mobile or phone <span className="muted">(optional)</span></label>
          <input id="enq-phone" name="phone" type="tel" autoComplete="tel" maxLength={50} />
        </div>
        <div className="field full">
          <label htmlFor="enq-notes">Method, solvent or other requirements <span className="muted">(optional)</span></label>
          <textarea id="enq-notes" name="notes" rows={3} maxLength={4000} />
          <span className="hint">Mention your sample and solvent system if you would like us to confirm the membrane is suitable.</span>
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="enq-website">Website</label>
          <input id="enq-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      <p className={`form-status${status.error ? ' is-error' : ''}`} role="status" aria-live="polite">{status.text}</p>
      <div className="btn-row">
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Sending…' : 'Request a quotation'}</button>
        <span className="small muted">We reply by email with pricing, availability and delivery.</span>
      </div>
    </form>
  );
}
