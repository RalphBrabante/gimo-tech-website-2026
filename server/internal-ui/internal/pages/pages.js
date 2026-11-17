const loading = document.querySelector('#loading');
const page = document.querySelector('#page');
const form = document.querySelector('#page-form');
const list = document.querySelector('#pages-list');
const listStatus = document.querySelector('#pages-status');
const formStatus = document.querySelector('#form-status');
const blocksStatus = document.querySelector('#blocks-status');
const formEyebrow = document.querySelector('#form-eyebrow');
const formTitle = document.querySelector('#form-title');
const submitButton = form.querySelector('button[type="submit"]');
const cancelEditButton = document.querySelector('#cancel-edit');
const blocksContainer = document.querySelector('#blocks');
const titleInput = document.querySelector('#title');
const slugInput = document.querySelector('#slug');

let blocks = [];
let editingPageId = null;
let slugTouched = false;

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

titleInput.addEventListener('input', () => {
  if (!editingPageId && !slugTouched) slugInput.value = slugify(titleInput.value);
});
slugInput.addEventListener('input', () => { slugTouched = true; });

function blockCard(block, index) {
  const card = document.createElement('div');
  card.className = 'block-card';

  const header = document.createElement('div');
  header.className = 'd-flex justify-content-between align-items-center mb-2';
  const label = document.createElement('span');
  label.className = 'small fw-bold text-uppercase text-aqua';
  label.textContent = block.blockType;
  const actions = document.createElement('div');
  actions.className = 'btn-group btn-group-sm';

  const up = document.createElement('button');
  up.type = 'button'; up.className = 'btn btn-outline-secondary'; up.setAttribute('aria-label', 'Move block up'); up.innerHTML = '<i class="bi bi-arrow-up"></i>';
  up.disabled = index === 0;
  up.addEventListener('click', () => { [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]; renderBlocks(); });

  const down = document.createElement('button');
  down.type = 'button'; down.className = 'btn btn-outline-secondary'; down.setAttribute('aria-label', 'Move block down'); down.innerHTML = '<i class="bi bi-arrow-down"></i>';
  down.disabled = index === blocks.length - 1;
  down.addEventListener('click', () => { [blocks[index + 1], blocks[index]] = [blocks[index], blocks[index + 1]]; renderBlocks(); });

  const remove = document.createElement('button');
  remove.type = 'button'; remove.className = 'btn btn-outline-danger'; remove.setAttribute('aria-label', 'Remove block'); remove.innerHTML = '<i class="bi bi-trash"></i>';
  remove.addEventListener('click', () => { blocks.splice(index, 1); renderBlocks(); });

  actions.append(up, down, remove);
  header.append(label, actions);
  card.append(header);

  function textField(labelText, key, multiline) {
    const wrap = document.createElement('div');
    wrap.className = 'mb-2';
    const fieldLabel = document.createElement('label');
    fieldLabel.className = 'form-label small fw-semibold';
    fieldLabel.textContent = labelText;
    const input = document.createElement(multiline ? 'textarea' : 'input');
    input.className = 'form-control form-control-sm';
    if (multiline) input.rows = 3;
    input.value = block[key] || '';
    input.addEventListener('input', () => { block[key] = input.value; });
    wrap.append(fieldLabel, input);
    return wrap;
  }

  if (block.blockType === 'heading') {
    card.append(textField('Heading text', 'headingText', false));
    const levelWrap = document.createElement('div');
    levelWrap.className = 'mb-2';
    const levelLabel = document.createElement('label');
    levelLabel.className = 'form-label small fw-semibold';
    levelLabel.textContent = 'Level';
    const levelSelect = document.createElement('select');
    levelSelect.className = 'form-select form-select-sm';
    [2, 3].forEach((level) => {
      const option = document.createElement('option');
      option.value = String(level); option.textContent = `H${level}`;
      if ((block.headingLevel || 2) === level) option.selected = true;
      levelSelect.append(option);
    });
    levelSelect.addEventListener('change', () => { block.headingLevel = Number(levelSelect.value); });
    levelWrap.append(levelLabel, levelSelect);
    card.append(levelWrap);
  } else if (block.blockType === 'paragraph') {
    card.append(textField('Paragraph text', 'paragraphText', true));
  } else if (block.blockType === 'image') {
    card.append(textField('Image URL', 'imageUrl', false));
    card.append(textField('Alt text', 'imageAlt', false));
  } else if (block.blockType === 'button') {
    card.append(textField('Button label', 'buttonLabel', false));
    card.append(textField('Button link', 'buttonHref', false));
  }

  return card;
}

function renderBlocks() {
  blocksContainer.replaceChildren(...blocks.map((block, index) => blockCard(block, index)));
  blocksStatus.textContent = blocks.length ? '' : 'Add at least one block.';
}

document.querySelectorAll('[data-add-block]').forEach((button) => {
  button.addEventListener('click', () => {
    const blockType = button.dataset.addBlock;
    const base = { blockType };
    if (blockType === 'heading') base.headingLevel = 2;
    blocks.push(base);
    renderBlocks();
  });
});

function resetFormToCreateMode() {
  editingPageId = null;
  slugTouched = false;
  form.reset();
  document.querySelector('#status').value = 'draft';
  blocks = [];
  renderBlocks();
  formEyebrow.textContent = 'New page';
  formTitle.textContent = 'Create a page';
  submitButton.textContent = 'Create page';
  cancelEditButton.classList.add('d-none');
  formStatus.textContent = '';
}

cancelEditButton.addEventListener('click', resetFormToCreateMode);

function enterEditMode(pageData) {
  editingPageId = pageData.id;
  slugTouched = true;
  titleInput.value = pageData.title;
  slugInput.value = pageData.slug;
  document.querySelector('#metaDescription').value = pageData.metaDescription || '';
  document.querySelector('#status').value = pageData.status;
  document.querySelector('#ogImageUrl').value = pageData.ogImageUrl || '';
  blocks = pageData.blocks
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((block) => ({ ...block }));
  renderBlocks();
  formEyebrow.textContent = 'Edit page';
  formTitle.textContent = `Edit ${pageData.title}`;
  submitButton.textContent = 'Update page';
  cancelEditButton.classList.remove('d-none');
  formStatus.textContent = '';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function pageListItem(pageData) {
  const item = document.createElement('div');
  item.className = 'card';
  const body = document.createElement('div');
  body.className = 'card-body p-3 d-flex justify-content-between align-items-start gap-2';

  const info = document.createElement('div');
  const title = document.createElement('p');
  title.className = 'fw-bold text-gimo mb-1';
  title.textContent = pageData.title;
  const slug = document.createElement('p');
  slug.className = 'small text-secondary mb-1';
  slug.textContent = `/${pageData.slug}`;
  const badge = document.createElement('span');
  badge.className = `badge ${pageData.status === 'published' ? 'text-bg-success' : 'text-bg-secondary'}`;
  badge.textContent = pageData.status;
  info.append(title, slug, badge);

  const actions = document.createElement('div');
  actions.className = 'btn-group btn-group-sm';
  const editButton = document.createElement('button');
  editButton.type = 'button'; editButton.className = 'btn btn-outline-secondary'; editButton.setAttribute('aria-label', `Edit ${pageData.title}`);
  editButton.innerHTML = '<i class="bi bi-pencil"></i>';
  editButton.addEventListener('click', () => enterEditMode(pageData));
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button'; deleteButton.className = 'btn btn-outline-danger'; deleteButton.setAttribute('aria-label', `Delete ${pageData.title}`);
  deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
  deleteButton.addEventListener('click', () => deletePage(pageData));
  actions.append(editButton, deleteButton);

  body.append(info, actions);
  item.append(body);
  return item;
}

async function loadPages() {
  const response = await fetch('/api/internal/pages', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Unable to load pages');
  const pages = await response.json();
  list.replaceChildren(...pages.map(pageListItem));
  listStatus.textContent = pages.length ? `${pages.length} page${pages.length === 1 ? '' : 's'}` : 'No pages yet. Create your first page.';
  if (editingPageId && !pages.some((item) => item.id === editingPageId)) resetFormToCreateMode();
}

async function deletePage(pageData) {
  if (!window.confirm(`Delete "${pageData.title}"? This cannot be undone.`)) return;
  listStatus.textContent = `Deleting ${pageData.title}…`;
  try {
    const response = await fetch(`/api/internal/pages/${pageData.id}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!response.ok && response.status !== 204) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.message || 'Unable to delete page');
    }
    if (editingPageId === pageData.id) resetFormToCreateMode();
    await loadPages();
  } catch (error) {
    listStatus.textContent = error.message || 'Unable to delete page.';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.textContent = '';
  if (!form.reportValidity()) return;
  if (!blocks.length) { blocksStatus.textContent = 'Add at least one block.'; return; }

  const payload = {
    title: titleInput.value,
    slug: slugInput.value,
    metaDescription: document.querySelector('#metaDescription').value || undefined,
    status: document.querySelector('#status').value,
    ogImageUrl: document.querySelector('#ogImageUrl').value || undefined,
    blocks: blocks.map((block) => ({
      blockType: block.blockType,
      headingText: block.headingText,
      headingLevel: block.headingLevel,
      paragraphText: block.paragraphText,
      imageUrl: block.imageUrl,
      imageAlt: block.imageAlt,
      buttonLabel: block.buttonLabel,
      buttonHref: block.buttonHref
    }))
  };

  const isEdit = Boolean(editingPageId);
  submitButton.disabled = true;
  submitButton.textContent = isEdit ? 'Updating…' : 'Creating…';
  try {
    const response = await fetch(isEdit ? `/api/internal/pages/${editingPageId}` : '/api/internal/pages', {
      method: isEdit ? 'PATCH' : 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(' ') : result.message || `Unable to ${isEdit ? 'update' : 'create'} page`);
    resetFormToCreateMode();
    formStatus.textContent = isEdit ? 'Page updated.' : 'Page created.';
    await loadPages();
  } catch (error) {
    formStatus.textContent = error.message || `Unable to ${isEdit ? 'update' : 'create'} page.`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = isEdit ? 'Update page' : 'Create page';
  }
});

async function boot() {
  try {
    const session = await fetch('/api/auth/session', { credentials: 'same-origin' });
    if (!session.ok) return window.location.replace('/internal/');
    renderBlocks();
    page.classList.remove('d-none');
    loading.remove();
    await loadPages();
  } catch {
    window.location.replace('/internal/');
  }
}

document.querySelector('#logout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  window.location.replace('/internal/');
});

void boot();
