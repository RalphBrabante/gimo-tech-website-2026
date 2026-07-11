const loading = document.querySelector('#loading');
const page = document.querySelector('#page');
const form = document.querySelector('#product-form');
const list = document.querySelector('#product-list');
const catalogStatus = document.querySelector('#catalog-status');
const formStatus = document.querySelector('#form-status');
const imagesInput = document.querySelector('#images');
const imagePreview = document.querySelector('#image-preview');
let previewUrls = [];
let currencyCode = 'USD';
let priceFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode });

async function loadCurrency() {
  const response = await fetch('/api/settings', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Unable to load currency settings');
  const settings = await response.json();
  currencyCode = settings.currencyCode;
  priceFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode });
  document.querySelector('#price-currency').textContent = currencyCode;
}

function clearImagePreview() {
  previewUrls.forEach((url) => URL.revokeObjectURL(url));
  previewUrls = [];
  imagePreview.replaceChildren();
}

function validateImages(files) {
  const acceptedTypes = new Set(['image/avif', 'image/jpeg', 'image/png', 'image/webp']);
  if (!files.length || files.length > 8) return 'Select between 1 and 8 product images.';
  if (files.some((file) => !acceptedTypes.has(file.type))) return 'Images must be AVIF, JPEG, PNG, or WebP.';
  if (files.some((file) => file.size > 5 * 1024 * 1024)) return 'Each image must be 5 MB or smaller.';
  return null;
}

imagesInput.addEventListener('change', () => {
  clearImagePreview();
  const files = Array.from(imagesInput.files ?? []);
  const error = validateImages(files);
  formStatus.textContent = error ?? '';
  if (error) return;
  files.forEach((file) => {
    const url = URL.createObjectURL(file); previewUrls.push(url);
    const image = document.createElement('img'); image.src = url; image.alt = `Preview of ${file.name}`;
    imagePreview.append(image);
  });
});

function productCard(product) {
  const card = document.createElement('article');
  card.className = 'col-md-6';
  const cardSurface = document.createElement('div'); cardSurface.className = 'card h-100 overflow-hidden';
  const media = document.createElement(product.imageUrl ? 'img' : 'div');
  media.className = 'product-media';
  if (product.imageUrl) { media.src = product.imageUrl; media.alt = ''; }
  else { media.style.background = product.accent; media.setAttribute('aria-hidden', 'true'); }
  const body = document.createElement('div'); body.className = 'card-body';
  const sku = document.createElement('p'); sku.className = 'small fw-bold text-aqua text-uppercase mb-1'; sku.textContent = product.sku;
  const name = document.createElement('h3'); name.className = 'h6 fw-bold text-gimo'; name.textContent = product.name;
  const description = document.createElement('p'); description.className = 'product-description small text-secondary mb-3'; description.textContent = product.description;
  const details = document.createElement('div'); details.className = 'd-flex justify-content-between gap-3 small';
  const price = document.createElement('span'); price.className = 'fw-bold text-gimo'; price.textContent = priceFormatter.format(product.price);
  const category = document.createElement('span'); category.className = 'text-secondary text-truncate'; category.textContent = product.category;
  details.append(price, category); body.append(sku, name, description, details); cardSurface.append(media, body); card.append(cardSurface);
  return card;
}

async function loadProducts() {
  const response = await fetch('/api/internal/products', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Unable to load products');
  const products = await response.json();
  list.replaceChildren(...products.map(productCard));
  catalogStatus.textContent = products.length ? `${products.length} product${products.length === 1 ? '' : 's'} in catalog` : 'No products yet. Add your first product.';
}

async function boot() {
  try {
    const session = await fetch('/api/auth/session', { credentials: 'same-origin' });
    if (!session.ok) return window.location.replace('/internal/');
    await loadCurrency(); page.classList.remove('d-none'); loading.remove(); await loadProducts();
  } catch { window.location.replace('/internal/'); }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); formStatus.textContent = '';
  if (!form.reportValidity()) return;
  const files = Array.from(imagesInput.files ?? []); const imageError = validateImages(files);
  if (imageError) { formStatus.textContent = imageError; return; }
  const data = new FormData(form); const priceCents = Math.round(Number(data.get('price')) * 100); const ratingTenths = Math.round(Number(data.get('rating')) * 10);
  if (!Number.isSafeInteger(priceCents) || priceCents < 0) { formStatus.textContent = 'Enter a valid price.'; return; }
  data.delete('price'); data.delete('rating'); data.delete('isActive');
  data.set('priceCents', String(priceCents)); data.set('ratingTenths', String(ratingTenths)); data.set('isActive', String(document.querySelector('#isActive').checked));
  const button = form.querySelector('button'); button.disabled = true; button.textContent = 'Creating…';
  try { const response = await fetch('/api/internal/products', { method: 'POST', credentials: 'same-origin', body: data }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to create product'); form.reset(); clearImagePreview(); document.querySelector('#rating').value = '0'; document.querySelector('#isActive').checked = true; formStatus.textContent = 'Product created.'; await loadProducts(); }
  catch (error) { formStatus.textContent = error.message || 'Unable to create product.'; }
  finally { button.disabled = false; button.textContent = 'Create product'; }
});

document.querySelector('#logout').addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); window.location.replace('/internal/'); });
void boot();
