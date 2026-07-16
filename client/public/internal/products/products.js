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
const imageDropzone = document.querySelector('#image-dropzone');
const existingImagesGroup = document.querySelector('#existing-images-group');
const existingImagesContainer = document.querySelector('#existing-images');
let previewUrls = [];
const selectedImageItems = new Map();
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
  selectedImageItems.clear();
  imagePreview.replaceChildren();
}

function validateImages(files) {
  const acceptedTypes = new Set(['image/avif', 'image/jpeg', 'image/png', 'image/webp']);
  if (files.length > 8) return 'Select up to 8 product images.';
  if (files.some((file) => !acceptedTypes.has(file.type))) return 'Images must be AVIF, JPEG, PNG, or WebP.';
  if (files.some((file) => file.size > 5 * 1024 * 1024)) return 'Each image must be 5 MB or smaller.';
  return null;
}

function renderSelectedImages(files) {
  clearImagePreview();
  files.forEach((file) => {
    const url = URL.createObjectURL(file); previewUrls.push(url);
    const item = document.createElement('article'); item.className = 'image-upload-item';
    const image = document.createElement('img'); image.src = url; image.alt = `Preview of ${file.name}`;
    const details = document.createElement('div'); details.className = 'image-upload-details';
    const name = document.createElement('p'); name.className = 'image-upload-name'; name.textContent = file.name;
    const progress = document.createElement('div'); progress.className = 'image-upload-progress'; progress.setAttribute('role', 'progressbar'); progress.setAttribute('aria-label', `Upload progress for ${file.name}`); progress.setAttribute('aria-valuemin', '0'); progress.setAttribute('aria-valuemax', '100'); progress.setAttribute('aria-valuenow', '0');
    const indicator = document.createElement('span'); indicator.className = 'image-upload-progress-value'; indicator.style.width = '0%';
    progress.append(indicator);
    const status = document.createElement('p'); status.className = 'image-upload-status'; status.textContent = 'Ready to upload';
    details.append(name, progress, status); item.append(image, details); imagePreview.append(item); selectedImageItems.set(file, item);
  });
}

function setSelectedImages(files) {
  const selected = Array.from(files ?? []);
  const error = validateImages(selected);
  if (error) { formStatus.textContent = error; return; }
  const transfer = new DataTransfer();
  selected.forEach((file) => transfer.items.add(file));
  imagesInput.files = transfer.files;
  formStatus.textContent = '';
  renderSelectedImages(selected);
}

function updateUploadProgress(file, percent, statusText, failed = false) {
  const item = selectedImageItems.get(file);
  if (!item) return;
  const progress = item.querySelector('.image-upload-progress');
  const indicator = item.querySelector('.image-upload-progress-value');
  const status = item.querySelector('.image-upload-status');
  const roundedPercent = Math.min(100, Math.max(0, Math.round(percent)));
  progress.setAttribute('aria-valuenow', String(roundedPercent));
  indicator.style.width = `${roundedPercent}%`;
  status.textContent = statusText;
  item.classList.toggle('upload-failed', failed);
  item.classList.toggle('upload-complete', roundedPercent === 100 && !failed);
}

imagesInput.addEventListener('change', () => setSelectedImages(imagesInput.files));
imageDropzone.addEventListener('click', () => imagesInput.click());
imageDropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); imagesInput.click(); }
});
['dragenter', 'dragover'].forEach((eventName) => imageDropzone.addEventListener(eventName, (event) => {
  event.preventDefault(); imageDropzone.classList.add('is-dragging');
}));
['dragleave', 'drop'].forEach((eventName) => imageDropzone.addEventListener(eventName, (event) => {
  event.preventDefault(); imageDropzone.classList.remove('is-dragging');
}));
imageDropzone.addEventListener('drop', (event) => setSelectedImages(event.dataTransfer?.files));

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

function productData(file, includeRemovedImages) {
  const data = new FormData(form);
  const priceCents = Math.round(Number(data.get('price')) * 100);
  const ratingTenths = Math.round(Number(data.get('rating')) * 10);
  if (!Number.isSafeInteger(priceCents) || priceCents < 0) throw new Error('Enter a valid price.');
  data.delete('images'); data.delete('price'); data.delete('rating'); data.delete('isActive');
  data.set('priceCents', String(priceCents));
  data.set('ratingTenths', String(ratingTenths));
  data.set('isActive', String(document.querySelector('#isActive').checked));
  if (includeRemovedImages && editingProduct && removedImageIds.size) data.set('removeImageIds', Array.from(removedImageIds).join(','));
  if (file) data.append('images', file);
  return data;
}

function sendProductRequest(url, method, data, file) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(method, url);
    request.withCredentials = true;
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && file) updateUploadProgress(file, event.loaded / event.total * 100, `Uploading ${Math.round(event.loaded / event.total * 100)}%`);
    });
    request.addEventListener('error', () => reject(new Error('Network error while uploading image.')));
    request.addEventListener('load', () => {
      let result = {};
      try { result = request.responseText ? JSON.parse(request.responseText) : {}; } catch { result = {}; }
      if (request.status < 200 || request.status >= 300) { reject(new Error(result.message || 'Unable to save product image.')); return; }
      if (file) updateUploadProgress(file, 100, 'Uploaded');
      resolve(result);
    });
    request.send(data);
  });
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

  const isEdit = Boolean(editingProduct);
  submitButton.disabled = true; submitButton.textContent = isEdit ? 'Updating…' : 'Creating…';
  try {
    let savedProduct = editingProduct;
    let firstUpload = true;
    if (!isEdit) {
      const firstFile = files.shift();
      savedProduct = await sendProductRequest('/api/internal/products', 'POST', productData(firstFile, false), firstFile);
      firstUpload = false;
    }
    if (isEdit && !files.length) {
      savedProduct = await sendProductRequest(`/api/internal/products/${savedProduct.id}`, 'PATCH', productData(null, true));
      firstUpload = false;
    }
    for (const file of files) {
      try {
        savedProduct = await sendProductRequest(`/api/internal/products/${savedProduct.id}`, 'PATCH', productData(file, firstUpload), file);
        firstUpload = false;
      } catch (error) {
        updateUploadProgress(file, 0, error.message || 'Upload failed', true);
        throw error;
      }
    }
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
