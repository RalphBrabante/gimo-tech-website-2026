const loading = document.querySelector('#loading');
const page = document.querySelector('#page');
const groupsContainer = document.querySelector('#groups');

const GROUPS = [
  { location: 'header', label: 'Header navigation' },
  { location: 'footer_products', label: 'Footer — Products' },
  { location: 'footer_services', label: 'Footer — Services' },
  { location: 'footer_purchasing', label: 'Footer — Purchasing help' }
];

let allPages = [];
let allItems = [];

function pageOptions(selectedPageId) {
  const options = [];
  const placeholder = document.createElement('option');
  placeholder.value = ''; placeholder.textContent = 'Select a page…';
  options.push(placeholder);
  allPages.forEach((p) => {
    const option = document.createElement('option');
    option.value = String(p.id);
    option.textContent = `${p.title} (/${p.slug})${p.status === 'draft' ? ' — draft' : ''}`;
    if (p.id === selectedPageId) option.selected = true;
    options.push(option);
  });
  return options;
}

function targetControl(linkType, pageId, href) {
  if (linkType === 'page') {
    const select = document.createElement('select');
    select.className = 'form-select form-select-sm target-input';
    select.append(...pageOptions(pageId));
    return select;
  }
  const input = document.createElement('input');
  input.className = 'form-control form-control-sm target-input';
  input.placeholder = linkType === 'anchor' ? '#contact' : 'https://example.com';
  input.value = href || '';
  return input;
}

function readTarget(targetCol, linkType) {
  const control = targetCol.querySelector('.target-input');
  if (linkType === 'page') return { pageId: control.value ? Number(control.value) : undefined, href: undefined };
  return { pageId: undefined, href: control.value };
}

async function saveExistingItem(item, row) {
  const label = row.querySelector('.label-input').value;
  const linkType = row.querySelector('.type-select').value;
  const openInNewTab = row.querySelector('.tab-check').checked;
  const targetCol = row.querySelector('.target-col');
  const { pageId, href } = readTarget(targetCol, linkType);
  const status = row.querySelector('.row-status');
  status.textContent = 'Saving…';
  try {
    const response = await fetch(`/api/internal/menus/${item.id}`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, linkType, pageId, href, openInNewTab })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(' ') : result.message || 'Unable to save link');
    status.textContent = 'Saved.';
    await loadAll();
  } catch (error) {
    status.textContent = error.message || 'Unable to save link.';
  }
}

async function deleteItem(item) {
  if (!window.confirm(`Remove "${item.label}" from this menu?`)) return;
  await fetch(`/api/internal/menus/${item.id}`, { method: 'DELETE', credentials: 'same-origin' });
  await loadAll();
}

async function moveItem(groupItems, item, direction) {
  const index = groupItems.findIndex((entry) => entry.id === item.id);
  const swapIndex = index + direction;
  if (swapIndex < 0 || swapIndex >= groupItems.length) return;
  const reordered = groupItems.slice();
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
  const items = reordered.map((entry, sortOrder) => ({ id: entry.id, sortOrder }));
  await fetch('/api/internal/menus/reorder', {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  await loadAll();
}

function itemRow(item, groupItems, index) {
  const row = document.createElement('div');
  row.className = 'row g-2 align-items-center mb-2 pb-2 border-bottom';

  const labelCol = document.createElement('div'); labelCol.className = 'col-md-3';
  const labelInput = document.createElement('input');
  labelInput.className = 'form-control form-control-sm label-input'; labelInput.value = item.label;
  labelCol.append(labelInput);

  const typeCol = document.createElement('div'); typeCol.className = 'col-md-2';
  const typeSelect = document.createElement('select');
  typeSelect.className = 'form-select form-select-sm type-select';
  ['page', 'url', 'anchor'].forEach((type) => {
    const option = document.createElement('option'); option.value = type; option.textContent = type;
    if (item.linkType === type) option.selected = true;
    typeSelect.append(option);
  });
  typeCol.append(typeSelect);

  const targetCol = document.createElement('div'); targetCol.className = 'col-md-4 target-col';
  targetCol.append(targetControl(item.linkType, item.pageId, item.href));
  typeSelect.addEventListener('change', () => {
    targetCol.replaceChildren(targetControl(typeSelect.value, null, ''));
  });

  const tabCol = document.createElement('div'); tabCol.className = 'col-md-1 form-check ps-4';
  const tabCheck = document.createElement('input');
  tabCheck.type = 'checkbox'; tabCheck.className = 'form-check-input tab-check'; tabCheck.checked = item.openInNewTab;
  tabCheck.setAttribute('aria-label', 'Open in new tab');
  tabCol.append(tabCheck);

  const actionsCol = document.createElement('div'); actionsCol.className = 'col-md-2 btn-group btn-group-sm';
  const up = document.createElement('button');
  up.type = 'button'; up.className = 'btn btn-outline-secondary'; up.innerHTML = '<i class="bi bi-arrow-up"></i>';
  up.disabled = index === 0; up.setAttribute('aria-label', 'Move up');
  up.addEventListener('click', () => moveItem(groupItems, item, -1));

  const down = document.createElement('button');
  down.type = 'button'; down.className = 'btn btn-outline-secondary'; down.innerHTML = '<i class="bi bi-arrow-down"></i>';
  down.disabled = index === groupItems.length - 1; down.setAttribute('aria-label', 'Move down');
  down.addEventListener('click', () => moveItem(groupItems, item, 1));

  const save = document.createElement('button');
  save.type = 'button'; save.className = 'btn btn-outline-primary'; save.innerHTML = '<i class="bi bi-check-lg"></i>';
  save.setAttribute('aria-label', 'Save link');
  save.addEventListener('click', () => saveExistingItem(item, row));

  const remove = document.createElement('button');
  remove.type = 'button'; remove.className = 'btn btn-outline-danger'; remove.innerHTML = '<i class="bi bi-trash"></i>';
  remove.setAttribute('aria-label', 'Delete link');
  remove.addEventListener('click', () => deleteItem(item));

  actionsCol.append(up, down, save, remove);
  row.append(labelCol, typeCol, targetCol, tabCol, actionsCol);

  const status = document.createElement('div');
  status.className = 'col-12 small text-secondary row-status';
  row.append(status);

  return row;
}

function addRow(location) {
  const row = document.createElement('div');
  row.className = 'row g-2 align-items-center mb-2';

  const labelCol = document.createElement('div'); labelCol.className = 'col-md-3';
  const labelInput = document.createElement('input');
  labelInput.className = 'form-control form-control-sm label-input'; labelInput.placeholder = 'Label';
  labelCol.append(labelInput);

  const typeCol = document.createElement('div'); typeCol.className = 'col-md-2';
  const typeSelect = document.createElement('select');
  typeSelect.className = 'form-select form-select-sm type-select';
  ['page', 'url', 'anchor'].forEach((type) => {
    const option = document.createElement('option'); option.value = type; option.textContent = type;
    typeSelect.append(option);
  });
  typeCol.append(typeSelect);

  const targetCol = document.createElement('div'); targetCol.className = 'col-md-4 target-col';
  targetCol.append(targetControl('page', null, ''));
  typeSelect.addEventListener('change', () => {
    targetCol.replaceChildren(targetControl(typeSelect.value, null, ''));
  });

  const tabCol = document.createElement('div'); tabCol.className = 'col-md-1 form-check ps-4';
  const tabCheck = document.createElement('input');
  tabCheck.type = 'checkbox'; tabCheck.className = 'form-check-input tab-check';
  tabCheck.setAttribute('aria-label', 'Open in new tab');
  tabCol.append(tabCheck);

  const actionsCol = document.createElement('div'); actionsCol.className = 'col-md-2';
  const addButton = document.createElement('button');
  addButton.type = 'button'; addButton.className = 'btn btn-sm btn-gimo w-100'; addButton.textContent = 'Add link';
  actionsCol.append(addButton);

  const status = document.createElement('div');
  status.className = 'col-12 small text-secondary';

  row.append(labelCol, typeCol, targetCol, tabCol, actionsCol, status);

  addButton.addEventListener('click', async () => {
    const linkType = typeSelect.value;
    const { pageId, href } = readTarget(targetCol, linkType);
    if (!labelInput.value.trim()) { status.textContent = 'Enter a label.'; return; }
    status.textContent = 'Adding…';
    try {
      const response = await fetch('/api/internal/menus', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, label: labelInput.value, linkType, pageId, href, openInNewTab: tabCheck.checked })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(' ') : result.message || 'Unable to add link');
      await loadAll();
    } catch (error) {
      status.textContent = error.message || 'Unable to add link.';
    }
  });

  return row;
}

function renderGroups() {
  groupsContainer.replaceChildren(...GROUPS.map((group) => {
    const groupItems = allItems.filter((item) => item.location === group.location).sort((a, b) => a.sortOrder - b.sortOrder);
    const card = document.createElement('section');
    card.className = 'card mb-4';
    const body = document.createElement('div');
    body.className = 'card-body p-4';
    const heading = document.createElement('h2');
    heading.className = 'h5 fw-bold text-gimo mb-3';
    heading.textContent = group.label;
    body.append(heading);
    groupItems.forEach((item, index) => body.append(itemRow(item, groupItems, index)));
    if (!groupItems.length) {
      const empty = document.createElement('p');
      empty.className = 'text-secondary small';
      empty.textContent = 'No links yet.';
      body.append(empty);
    }
    const divider = document.createElement('hr');
    body.append(divider, addRow(group.location));
    card.append(body);
    return card;
  }));
}

async function loadAll() {
  const [pagesResponse, itemsResponse] = await Promise.all([
    fetch('/api/internal/pages', { credentials: 'same-origin' }),
    fetch('/api/internal/menus', { credentials: 'same-origin' })
  ]);
  if (!pagesResponse.ok || !itemsResponse.ok) throw new Error('Unable to load menus');
  allPages = await pagesResponse.json();
  allItems = await itemsResponse.json();
  renderGroups();
}

async function boot() {
  try {
    const session = await fetch('/api/auth/session', { credentials: 'same-origin' });
    if (!session.ok) return window.location.replace('/internal/');
    await loadAll();
    page.classList.remove('d-none');
    loading.remove();
  } catch {
    window.location.replace('/internal/');
  }
}

document.querySelector('#logout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  window.location.replace('/internal/');
});

void boot();
