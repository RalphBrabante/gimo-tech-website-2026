const loading = document.querySelector('#loading');
const page = document.querySelector('#page');
const list = document.querySelector('#request-list');
const status = document.querySelector('#status');
const form = document.querySelector('#response-form');
const lines = document.querySelector('#quote-lines');
const responseTitle = document.querySelector('#response-title');
const responseHelp = document.querySelector('#response-help');
const responseStatus = document.querySelector('#response-status');
let selected = null;

const peso = (cents) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const jsonValue = (value, fallback) => {
  if (typeof value !== 'string') return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
};
const requestItems = (request) => {
  const items = jsonValue(request.items, []);
  return Array.isArray(items) ? items : [];
};

async function load() {
  try {
    const session = await fetch('/api/auth/session', { credentials: 'same-origin' });
    if (!session.ok) return window.location.replace('/internal/');
    const response = await fetch('/api/internal/quotations', { credentials: 'same-origin' });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || `Could not load quotation requests (HTTP ${response.status}).`);
    }
    render(await response.json()); page.classList.remove('d-none'); loading?.remove();
  } catch (error) { status.textContent = error.message; page.classList.remove('d-none'); loading?.remove(); }
}

function render(requests) {
  status.textContent = requests.length ? `${requests.length} quotation request${requests.length === 1 ? '' : 's'}` : 'No quotation requests yet.';
  list.innerHTML = requests.map(request => `<article class="card"><div class="card-body"><div class="d-flex justify-content-between gap-3"><div><p class="eyebrow mb-1">${escapeHtml(request.requestNumber || 'New request')}</p><h2 class="h5 text-gimo fw-bold mb-1">${escapeHtml(request.customerName)}</h2><p class="small text-secondary mb-2">${escapeHtml(request.customerEmail)}${request.companyName ? ` · ${escapeHtml(request.companyName)}` : ''}</p></div><span class="badge text-bg-${request.status === 'quoted' ? 'success' : 'warning'} align-self-start text-uppercase">${escapeHtml(request.status)}</span></div><ul class="small mb-2 ps-3">${requestItems(request).map(item => `<li>${escapeHtml(item.name)} — ${item.quantity} requested</li>`).join('')}</ul>${request.notes ? `<p class="small text-secondary mb-3">${escapeHtml(request.notes)}</p>` : ''}<button class="btn btn-outline-primary btn-sm" type="button" data-request-id="${request.id}">${request.status === 'quoted' ? 'Revise quotation' : 'Prepare quotation'}</button></div></article>`).join('');
  list.querySelectorAll('[data-request-id]').forEach(button => button.addEventListener('click', () => selectRequest(requests.find(request => request.id === Number(button.dataset.requestId)))));
}

function selectRequest(request) {
  selected = request; form.classList.remove('d-none'); responseTitle.textContent = `Quote ${request.requestNumber}`; responseHelp.textContent = `Preparing a formal response for ${request.customerName}.`;
  const quote = jsonValue(request.response, null);
  const source = quote?.lines ?? requestItems(request).map(item => ({ ...item, unitPriceCents: item.priceCents }));
  document.querySelector('#valid-until').value = quote?.validUntil || '';
  document.querySelector('#quote-notes').value = quote?.notes || '';
  lines.innerHTML = source.map((line, index) => `<div class="border rounded-3 p-2"><label class="form-label small fw-semibold mb-1">${escapeHtml(line.name)} (${escapeHtml(line.sku)})</label><div class="row g-2"><div class="col-4"><input class="form-control form-control-sm quote-quantity" type="number" min="1" value="${line.quantity}" aria-label="Quantity for ${escapeHtml(line.name)}"></div><div class="col-8"><div class="input-group input-group-sm"><span class="input-group-text">₱</span><input class="form-control quote-price" type="number" min="0" step="0.01" value="${(line.unitPriceCents / 100).toFixed(2)}" aria-label="Unit price for ${escapeHtml(line.name)}"></div></div></div><input class="quote-name" type="hidden" value="${escapeHtml(line.name)}"><input class="quote-sku" type="hidden" value="${escapeHtml(line.sku)}"></div>`).join('');
  responseStatus.textContent = '';
}

form.addEventListener('submit', async event => {
  event.preventDefault(); if (!selected) return;
  const cards = [...lines.children];
  const payload = { lines: cards.map(card => ({ name: card.querySelector('.quote-name').value, sku: card.querySelector('.quote-sku').value, quantity: Number(card.querySelector('.quote-quantity').value), unitPriceCents: Math.round(Number(card.querySelector('.quote-price').value) * 100) })), validUntil: document.querySelector('#valid-until').value || undefined, notes: document.querySelector('#quote-notes').value || undefined };
  responseStatus.textContent = 'Saving formal quotation…';
  try { const response = await fetch(`/api/internal/quotations/${selected.id}/respond`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error((await response.json()).message || 'Unable to save quotation.'); const result = await response.json(); responseStatus.textContent = 'Formal quotation saved. Opening your email application…'; window.location.href = result.mailtoUrl; await load(); } catch (error) { responseStatus.textContent = error.message; }
});
document.querySelector('#logout').addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); window.location.replace('/internal/'); });
void load();
