const loading = document.querySelector('#loading');
const page = document.querySelector('#page');
const form = document.querySelector('#product-form');
const list = document.querySelector('#product-list');
const catalogStatus = document.querySelector('#catalog-status');
const formStatus = document.querySelector('#form-status');
const formEyebrow = document.querySelector('#form-eyebrow');
const formTitle = document.querySelector('#form-title');
const submitButton = form.querySelector('button[type="submit"]');
const cancelEditButton = document.querySelector('#cancel-edit');
const imagesInput = document.querySelector('#images');
const imagePreview = document.querySelector('#image-preview');
const existingImagesGroup = document.querySelector('#existing-images-group');
const existingImagesContainer = document.querySelector('#existing-images');
let previewUrls = [];
let currencyCode = 'USD';
let priceFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode });
let editingProduct = null;
let removedImageIds = new Set();

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
  if (files.length > 8) return 'Select up to 8 product images.';
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

function renderExistingImages(product) {
  removedImageIds = new Set();
  existingImagesContainer.replaceChildren();
  const images = product.images ?? [];
  if (!images.length) { existingImagesGroup.classList.add('d-none'); return; }
  existingImagesGroup.classList.remove('d-none');
  images.forEach((image) => {
    const figure = document.createElement('figure');
    const img = document.createElement('img'); img.src = image.url; img.alt = '';
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'image-remove-toggle'; toggle.setAttribute('aria-label', `Remove image`);
    toggle.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
    toggle.addEventListener('click', () => {
      if (removedImageIds.has(image.id)) removedImageIds.delete(image.id);
      else removedImageIds.add(image.id);
      const marked = removedImageIds.has(image.id);
      figure.classList.toggle('marked-for-removal', marked);
      toggle.setAttribute('aria-label', marked ? 'Restore image' : 'Remove image');
    });
    figure.append(img, toggle);
    existingImagesContainer.append(figure);
  });
}

function enterEditMode(product) {
  editingProduct = product;
  form.querySelector('#name').value = product.name;
  form.querySelector('#sku').value = product.sku;
  form.querySelector('#category').value = product.category;
  form.querySelector('#description').value = product.description;
  form.querySelector('#price').value = product.price.toFixed(2);
  form.querySelector('#rating').value = String(product.rating ?? 0);
  form.querySelector('#isActive').checked = product.isActive !== false;
  imagesInput.value = '';
  clearImagePreview();
  renderExistingImages(product);
  formEyebrow.textContent = 'Edit product';
  formTitle.textContent = 'Edit product';
  submitButton.textContent = 'Update product';
  cancelEditButton.classList.remove('d-none');
  formStatus.textContent = '';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function exitEditMode() {
  editingProduct = null;
  removedImageIds = new Set();
  form.reset();
  clearImagePreview();
  existingImagesContainer.replaceChildren();
  existingImagesGroup.classList.add('d-none');
  document.querySelector('#rating').value = '0';
  document.querySelector('#isActive').checked = true;
  formEyebrow.textContent = 'New product';
  formTitle.textContent = 'Add to catalog';
  submitButton.textContent = 'Create product';
  cancelEditButton.classList.add('d-none');
  formStatus.textContent = '';
}

cancelEditButton.addEventListener('click', exitEditMode);

function productCard(product) {
  const card = document.createElement('article');
  card.className = 'col-md-6';
  const cardSurface = document.createElement('div'); cardSurface.className = 'card h-100 overflow-hidden';
  const mediaWrap = document.createElement('div'); mediaWrap.className = 'product-media-wrap';
  const media = document.createElement(product.imageUrl ? 'img' : 'div');
  media.className = 'product-media';
  if (product.imageUrl) { media.src = product.imageUrl; media.alt = ''; }
  else { media.style.background = product.accent; media.setAttribute('aria-hidden', 'true'); }
  const actions = document.createElement('div'); actions.className = 'product-card-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button'; editButton.className = 'btn btn-sm btn-light'; editButton.setAttribute('aria-label', `Edit ${product.name}`);
  editButton.innerHTML = '<i class="bi bi-pencil" aria-hidden="true"></i>';
  editButton.addEventListener('click', () => enterEditMode(product));
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button'; deleteButton.className = 'btn btn-sm btn-light text-danger'; deleteButton.setAttribute('aria-label', `Delete ${product.name}`);
  deleteButton.innerHTML = '<i class="bi bi-trash" aria-hidden="true"></i>';
  deleteButton.addEventListener('click', () => deleteProduct(product));
  actions.append(editButton, deleteButton);
  mediaWrap.append(media, actions);
  const body = document.createElement('div'); body.className = 'card-body';
  const sku = document.createElement('p'); sku.className = 'small fw-bold text-aqua text-uppercase mb-1'; sku.textContent = product.sku;
  const name = document.createElement('h3'); name.className = 'h6 fw-bold text-gimo'; name.textContent = product.name;
  const description = document.createElement('p'); description.className = 'product-description small text-secondary mb-3'; description.textContent = product.description;
  const details = document.createElement('div'); details.className = 'd-flex justify-content-between gap-3 small';
  const price = document.createElement('span'); price.className = 'fw-bold text-gimo'; price.textContent = priceFormatter.format(product.price);
  const category = document.createElement('span'); category.className = 'text-secondary text-truncate'; category.textContent = product.category;
  details.append(price, category); body.append(sku, name, description, details);
  if (product.isActive === false) {
    const hidden = document.createElement('span'); hidden.className = 'badge text-bg-secondary mt-2'; hidden.textContent = 'Hidden from storefront';
    body.append(hidden);
  }
  cardSurface.append(mediaWrap, body); card.append(cardSurface);
  return card;
}

async function loadProducts() {
  const response = await fetch('/api/internal/products', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Unable to load products');
  const products = await response.json();
  list.replaceChildren(...products.map(productCard));
  catalogStatus.textContent = products.length ? `${products.length} product${products.length === 1 ? '' : 's'} in catalog` : 'No products yet. Add your first product.';
  if (editingProduct && !products.some((product) => product.id === editingProduct.id)) exitEditMode();
}

async function deleteProduct(product) {
  if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
  catalogStatus.textContent = `Deleting ${product.name}…`;
  try {
    const response = await fetch(`/api/internal/products/${product.id}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!response.ok && response.status !== 204) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.message || 'Unable to delete product');
    }
    if (editingProduct && editingProduct.id === product.id) exitEditMode();
    await loadProducts();
  } catch (error) {
    catalogStatus.textContent = error.message || 'Unable to delete product.';
  }
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
  const files = Array.from(imagesInput.files ?? []);
  const imageError = validateImages(files);
  if (imageError) { formStatus.textContent = imageError; return; }

  const existingCount = editingProduct ? (editingProduct.images?.length ?? 0) - removedImageIds.size : 0;
  if (!editingProduct && files.length < 1) { formStatus.textContent = 'Select between 1 and 8 product images.'; return; }
  if (existingCount + files.length < 1) { formStatus.textContent = 'A product needs at least one image.'; return; }
  if (existingCount + files.length > 8) { formStatus.textContent = 'A product can have at most 8 images.'; return; }

  const data = new FormData(form);
  const priceCents = Math.round(Number(data.get('price')) * 100);
  const ratingTenths = Math.round(Number(data.get('rating')) * 10);
  if (!Number.isSafeInteger(priceCents) || priceCents < 0) { formStatus.textContent = 'Enter a valid price.'; return; }
  data.delete('price'); data.delete('rating'); data.delete('isActive');
  data.set('priceCents', String(priceCents));
  data.set('ratingTenths', String(ratingTenths));
  data.set('isActive', String(document.querySelector('#isActive').checked));
  if (editingProduct && removedImageIds.size) data.set('removeImageIds', Array.from(removedImageIds).join(','));

  const isEdit = Boolean(editingProduct);
  submitButton.disabled = true; submitButton.textContent = isEdit ? 'Updating…' : 'Creating…';
  try {
    const response = await fetch(isEdit ? `/api/internal/products/${editingProduct.id}` : '/api/internal/products', {
      method: isEdit ? 'PATCH' : 'POST',
      credentials: 'same-origin',
      body: data
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Unable to ${isEdit ? 'update' : 'create'} product`);
    exitEditMode();
    formStatus.textContent = isEdit ? 'Product updated.' : 'Product created.';
    await loadProducts();
  } catch (error) {
    formStatus.textContent = error.message || `Unable to ${isEdit ? 'update' : 'create'} product.`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = isEdit ? 'Update product' : 'Create product';
  }
});

document.querySelector('#logout').addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); window.location.replace('/internal/'); });
void boot();
