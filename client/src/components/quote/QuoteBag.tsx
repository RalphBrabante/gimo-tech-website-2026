'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';

export interface BagProduct { id: number; name: string; sku: string; category: string; imageUrl: string | null; accent: string }
interface BagItem { product: BagProduct; quantity: number }

interface QuoteBagContext {
  items: BagItem[];
  count: number;
  add(product: BagProduct): void;
  open(): void;
}

const Context = createContext<QuoteBagContext | null>(null);
const STORAGE_KEY = 'gimo-quote-cart'; // Same key as the previous storefront, so saved bags survive.

function load(): BagItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as BagItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => Number.isInteger(item?.product?.id) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch { return []; }
}

export function QuoteBagProvider({ children, email }: { children: ReactNode; email: string }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [view, setView] = useState<'bag' | 'form'>('bag');
  const [status, setStatus] = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const [submitting, setSubmitting] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);

  const persist = useCallback((next: BagItem[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Bag still works for this visit. */ }
  }, []);

  const open = useCallback(() => { opener.current = document.activeElement; setView('bag'); setStatus({ text: '', error: false }); setOpen(true); }, []);
  const add = useCallback((product: BagProduct) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      const next = existing ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { product, quantity: 1 }];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    open();
  }, [open]);

  // Restore the saved bag, and honour legacy "/?add-to-quote=ID" links from emails and old pages.
  useEffect(() => {
    setItems(load());
    const url = new URL(window.location.href);
    const id = Number(url.searchParams.get('add-to-quote'));
    if (!Number.isInteger(id) || id < 1) return;
    url.searchParams.delete('add-to-quote');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    fetch(`/api/products/${id}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((p: BagProduct) => add({ id: p.id, name: p.name, sku: p.sku, category: p.category, imageUrl: p.imageUrl, accent: p.accent }))
      .catch(() => { open(); setStatus({ text: 'That product is no longer available. Please contact our supply team.', error: true }); });
  }, [add, open]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (isOpen && !el.open) {
      el.showModal();
      // Land keyboard and screen-reader users on a predictable control inside the dialog.
      el.querySelector<HTMLButtonElement>('.drawer-close')?.focus();
    }
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  const close = () => { setOpen(false); (opener.current as HTMLElement | null)?.focus?.(); };
  const change = (id: number, delta: number) => persist(items.flatMap((item) => item.product.id !== id ? [item] : item.quantity + delta < 1 ? [] : [{ ...item, quantity: item.quantity + delta }]));
  const count = items.reduce((total, item) => total + item.quantity, 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !items.length) return;
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? '').trim() || undefined;
    setSubmitting(true);
    setStatus({ text: 'Sending your quotation request…', error: false });
    try {
      const response = await fetch('/api/quotation-requests', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: value('name'), company: value('company'), email: value('email'), phone: value('phone'), notes: value('notes'), items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })) })
      });
      if (!response.ok) throw new Error(String(response.status));
      const { requestNumber } = (await response.json()) as { requestNumber: string };
      window.dispatchEvent(new CustomEvent('gimo:quote-success'));
      persist([]);
      window.location.assign(`/quotation-request-received?request=${encodeURIComponent(requestNumber)}`);
    } catch (error) {
      setSubmitting(false);
      setStatus({ text: error instanceof Error && error.message === '429' ? `Too many requests in a short time. Please wait a minute, or email ${email}.` : `We could not send your request. Please try again or email ${email}.`, error: true });
    }
  }

  const value = useMemo(() => ({ items, count, add, open }), [items, count, add, open]);

  return (
    <Context.Provider value={value}>
      {children}
      <dialog ref={dialog} className="drawer" aria-labelledby="bag-title" onClose={() => setOpen(false)} onClick={(event) => { if (event.target === dialog.current) close(); }}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Quotation request</p>
            <h2 id="bag-title">{view === 'bag' ? 'Your quote bag' : 'Your details'}</h2>
          </div>
          <button type="button" className="drawer-close" aria-label="Close quotation bag" onClick={close}>×</button>
        </div>
        {view === 'bag' ? (
          <>
            <div className="drawer-body">
              {status.text && <p className={`form-status${status.error ? ' is-error' : ''}`} role="status">{status.text}</p>}
              {!items.length ? (
                <div>
                  <h3>Your quote bag is empty.</h3>
                  <p>Add catalogue products to request pricing and availability, or <a href="/request-for-a-quote">see other ways to request a quote</a>.</p>
                  <a className="btn btn-primary" href="/products">Browse the catalogue</a>
                </div>
              ) : items.map((item) => (
                <article key={item.product.id} className="bag-item">
                  <div className="bag-item-media" style={item.product.imageUrl ? undefined : { background: item.product.accent }}>
                    {item.product.imageUrl && <img src={item.product.imageUrl} alt="" width={64} height={64} />}
                  </div>
                  <div>
                    <h3>{item.product.name}</h3>
                    <p className="muted">{item.product.sku || item.product.category}</p>
                    <div className="qty" role="group" aria-label={`Quantity for ${item.product.name}`}>
                      <button type="button" aria-label={`Decrease quantity for ${item.product.name}`} onClick={() => change(item.product.id, -1)}>−</button>
                      <output aria-live="polite">{item.quantity}</output>
                      <button type="button" aria-label={`Increase quantity for ${item.product.name}`} onClick={() => change(item.product.id, 1)}>+</button>
                    </div>
                    <button type="button" className="text-button" aria-label={`Remove ${item.product.name} from quotation bag`} onClick={() => change(item.product.id, -item.quantity)}>Remove</button>
                  </div>
                </article>
              ))}
            </div>
            {items.length > 0 && (
              <div className="drawer-footer">
                <p className="small"><strong>{count} item{count === 1 ? '' : 's'} selected.</strong> Pricing, availability and delivery are confirmed in your quotation.</p>
                <button type="button" className="btn btn-primary" onClick={() => { window.dispatchEvent(new CustomEvent('gimo:quote-start')); setView('form'); setStatus({ text: '', error: false }); }}>Request quotation</button>
              </div>
            )}
          </>
        ) : (
          <form className="drawer-body" onSubmit={submit} noValidate={false}>
            <p className="small">Your request includes {count} item{count === 1 ? '' : 's'}. We confirm pricing and availability by email.</p>
            <div className="form-grid">
              <div className="field"><label htmlFor="bag-name">Full name</label><input id="bag-name" name="name" autoComplete="name" required maxLength={160} /></div>
              <div className="field"><label htmlFor="bag-company">Company or laboratory <span className="muted">(optional)</span></label><input id="bag-company" name="company" autoComplete="organization" maxLength={160} /></div>
              <div className="field"><label htmlFor="bag-email">Email address</label><input id="bag-email" name="email" type="email" autoComplete="email" required maxLength={254} /></div>
              <div className="field"><label htmlFor="bag-phone">Phone number <span className="muted">(optional)</span></label><input id="bag-phone" name="phone" type="tel" autoComplete="tel" maxLength={50} /></div>
              <div className="field"><label htmlFor="bag-notes">Notes or delivery requirements <span className="muted">(optional)</span></label><textarea id="bag-notes" name="notes" rows={4} maxLength={4000} /></div>
            </div>
            <p className={`form-status${status.error ? ' is-error' : ''}`} role="status" aria-live="polite">{status.text}</p>
            <div className="btn-row">
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Sending…' : 'Send quotation request'}</button>
              <button type="button" className="text-button" onClick={() => setView('bag')} disabled={submitting}>Back to bag</button>
            </div>
          </form>
        )}
      </dialog>
    </Context.Provider>
  );
}

function useBag(): QuoteBagContext {
  const context = useContext(Context);
  if (!context) throw new Error('QuoteBagProvider missing');
  return context;
}

export function BagButton() {
  const { count, open } = useBag();
  return (
    <button type="button" className="bag-button" onClick={open} aria-label={`Open quotation bag, ${count} item${count === 1 ? '' : 's'}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
      <span>Quote</span>
      <span className="bag-count">{count}</span>
    </button>
  );
}

export function AddToQuoteButton({ product, className = 'btn btn-primary', children }: { product: BagProduct; className?: string; children?: ReactNode }) {
  const { add } = useBag();
  return (
    <button type="button" className={className} onClick={() => add(product)} aria-label={`Add ${product.name} to quotation bag`}>
      {children ?? 'Add to quote'}
    </button>
  );
}
