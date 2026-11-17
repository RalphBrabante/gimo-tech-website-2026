'use client';

import { useState, type FormEvent } from 'react';

type Errors = Partial<Record<'quantity' | 'name' | 'email', string>>;

/**
 * Quotation request for a static website: no server stores the request. The form validates the
 * details, then opens the visitor's email app with a pre-filled message to the supply team. If no
 * email app opens, the same message is shown ready to copy.
 */
export function EnquiryForm({ productName, unitLabel, email }: { productName: string; unitLabel: string; email: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const [message, setMessage] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    const subject = `Quotation request: ${productName}`;
    const body = [
      'Hello Gimo Tech Supplies,',
      '',
      `Please send a quotation for: ${productName}`,
      `Quantity: ${quantity} × ${unitLabel}`,
      text('deliveryLocation') && `Delivery city/province: ${text('deliveryLocation')}`,
      text('notes') && `Requirements: ${text('notes')}`,
      '',
      `Name: ${text('name')}`,
      text('company') && `Company/laboratory: ${text('company')}`,
      `Email: ${text('email')}`,
      text('phone') && `Phone: ${text('phone')}`
    ].filter((line) => line !== '').join('\n').replace(/\n{3,}/g, '\n\n');
    setMessage({ subject, body });
    setCopied(false);
    setStatus({ text: 'Your email app should open with the request ready to send. Press Send to complete it.', error: false });
    window.dispatchEvent(new CustomEvent('gimo:quote-start'));
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function copy() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(`To: ${email}\nSubject: ${message.subject}\n\n${message.body}`);
      setCopied(true);
    } catch { /* The text stays selectable below. */ }
  }

  const fieldProps = (name: keyof Errors) => ({
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined
  });
  const error = (name: keyof Errors) => errors[name] ? <p id={`${name}-error`} className="field-error">{errors[name]}</p> : null;

  return (
    // WebMCP declarative tool annotation for in-browser agents (the form only prepares an email).
    <form className="form-card" onSubmit={submit} noValidate
      {...{ toolname: 'request_nylon_syringe_filter_quotation', tooldescription: 'Prepare an email requesting a quotation for 25mm 0.45 micron nylon syringe filters (canisters of 100) from Gimo Tech Supplies. Requires quantity, name and email; opens the user\'s email app and sends nothing automatically.' }}>
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
          <textarea id="enq-notes" name="notes" rows={3} maxLength={2000} />
          <span className="hint">Mention your sample and solvent system if you would like us to confirm the membrane is suitable.</span>
        </div>
      </div>
      <p className={`form-status${status.error ? ' is-error' : ''}`} role="status" aria-live="polite">{status.text}</p>
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">Email my quotation request</button>
        <span className="small muted">Opens your email app, addressed to {email}.</span>
      </div>
      {message && (
        <div className="field full" style={{ marginTop: '1.25rem' }}>
          <label htmlFor="enq-copy">Email app didn’t open? Send this to {email}:</label>
          <textarea id="enq-copy" readOnly rows={8} value={`Subject: ${message.subject}\n\n${message.body}`} />
          <div className="btn-row">
            <button type="button" className="btn btn-outline btn-small" onClick={copy}>{copied ? 'Copied' : 'Copy message'}</button>
            <a className="link-arrow" href={`mailto:${email}`}>{email}</a>
          </div>
        </div>
      )}
    </form>
  );
}
