const loading = document.querySelector('#loading');
const page = document.querySelector('#page');
const sectionsContainer = document.querySelector('#sections');

const SECTIONS = [
  { key: 'hero', label: 'Hero', fields: [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'body', label: 'Body', type: 'textarea' },
    { name: 'ticks', label: 'Ticks (one per line)', type: 'lines' },
    { name: 'ctaLabel', label: 'CTA label', type: 'text' },
    { name: 'ctaHref', label: 'CTA link', type: 'text' }
  ] },
  { key: 'filter_types', label: 'Syringe filter types', fields: [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'items', label: 'Items (JSON array of { name, tag, description, format, pack, color })', type: 'json' }
  ] },
  { key: 'benefits', label: 'Benefits', fields: [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'body', label: 'Body', type: 'textarea' },
    { name: 'bullets', label: 'Bullets (one per line)', type: 'lines' },
    { name: 'ctaLabel', label: 'CTA label', type: 'text' },
    { name: 'ctaHref', label: 'CTA link', type: 'text' },
    { name: 'cards', label: 'Cards (JSON array of { icon, title, body, linkLabel, linkHref })', type: 'json' }
  ] },
  { key: 'impact_banner', label: 'Impact banner', fields: [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'body', label: 'Body', type: 'textarea' },
    { name: 'ctaLabel', label: 'CTA label', type: 'text' },
    { name: 'ctaHref', label: 'CTA link', type: 'text' }
  ] },
  { key: 'split_1', label: 'Split section 1 (checklist)', fields: [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'body', label: 'Body', type: 'textarea' },
    { name: 'checklist', label: 'Checklist (one per line)', type: 'lines' },
    { name: 'ctaLabel', label: 'CTA label', type: 'text' },
    { name: 'ctaHref', label: 'CTA link', type: 'text' }
  ] },
  { key: 'split_2', label: 'Split section 2 (stats)', fields: [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'body', label: 'Body', type: 'textarea' },
    { name: 'stats', label: 'Stats (JSON array of { value, label })', type: 'json' },
    { name: 'ctaLabel', label: 'CTA label', type: 'text' },
    { name: 'ctaHref', label: 'CTA link', type: 'text' }
  ] },
  { key: 'consult_intro', label: 'Consult intro', fields: [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'body', label: 'Body', type: 'textarea' }
  ] },
  { key: 'plans', label: 'Plans', fields: [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'cards', label: 'Cards (JSON array of { eyebrow, title, subtitle, bullets, ctaLabel, ctaHref, featured })', type: 'json' }
  ] },
  { key: 'location', label: 'Location', fields: [
    { name: 'tagline', label: 'Tagline', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'ctaLabel', label: 'CTA label', type: 'text' },
    { name: 'ctaHref', label: 'CTA link', type: 'text' }
  ] },
  { key: 'cta_banner', label: 'CTA banner', fields: [
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'ctaLabel', label: 'CTA label', type: 'text' },
    { name: 'ctaHref', label: 'CTA link', type: 'text' }
  ] },
  { key: 'footer_brand', label: 'Footer brand', fields: [
    { name: 'blurb', label: 'Blurb', type: 'textarea' },
    { name: 'copyrightLine', label: 'Copyright line', type: 'text' }
  ] }
];

function fieldControl(sectionKey, field, value) {
  const id = `${sectionKey}-${field.name}`;
  const wrap = document.createElement('div');
  wrap.className = 'mb-3';
  const label = document.createElement('label');
  label.className = 'form-label fw-semibold';
  label.htmlFor = id;
  label.textContent = field.label;
  wrap.append(label);

  if (field.type === 'text') {
    const input = document.createElement('input');
    input.className = 'form-control'; input.id = id; input.value = value ?? '';
    wrap.append(input);
  } else if (field.type === 'textarea') {
    const textarea = document.createElement('textarea');
    textarea.className = 'form-control'; textarea.id = id; textarea.rows = 3; textarea.value = value ?? '';
    wrap.append(textarea);
  } else if (field.type === 'lines') {
    const textarea = document.createElement('textarea');
    textarea.className = 'form-control'; textarea.id = id; textarea.rows = 4;
    textarea.value = Array.isArray(value) ? value.join('\n') : '';
    wrap.append(textarea);
  } else if (field.type === 'json') {
    const textarea = document.createElement('textarea');
    textarea.className = 'form-control font-monospace'; textarea.id = id; textarea.rows = 8; textarea.style.fontSize = '.8rem';
    textarea.value = JSON.stringify(value ?? [], null, 2);
    wrap.append(textarea);
  }
  return wrap;
}

function readField(sectionKey, field) {
  const el = document.querySelector(`#${CSS.escape(`${sectionKey}-${field.name}`)}`);
  if (field.type === 'lines') {
    return el.value.split('\n').map((line) => line.trim()).filter(Boolean);
  }
  if (field.type === 'json') {
    return JSON.parse(el.value);
  }
  return el.value;
}

function renderSection(section, content, index) {
  const item = document.createElement('div');
  item.className = 'accordion-item';

  const header = document.createElement('h2');
  header.className = 'accordion-header';
  const button = document.createElement('button');
  button.className = `accordion-button${index === 0 ? '' : ' collapsed'}`;
  button.type = 'button';
  button.dataset.bsToggle = 'collapse';
  button.dataset.bsTarget = `#collapse-${section.key}`;
  button.textContent = section.label;
  header.append(button);

  const collapse = document.createElement('div');
  collapse.id = `collapse-${section.key}`;
  collapse.className = `accordion-collapse collapse${index === 0 ? ' show' : ''}`;

  const body = document.createElement('div');
  body.className = 'accordion-body';

  const form = document.createElement('form');
  form.noValidate = true;
  section.fields.forEach((field) => form.append(fieldControl(section.key, field, content[field.name])));

  const status = document.createElement('p');
  status.className = 'small mb-0 mt-2';
  status.setAttribute('role', 'status');

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btn btn-gimo';
  submit.textContent = 'Save section';

  form.append(submit, status);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    let payload;
    try {
      payload = {};
      section.fields.forEach((field) => { payload[field.name] = readField(section.key, field); });
    } catch (error) {
      status.textContent = 'One of the JSON array fields is not valid JSON.';
      return;
    }
    submit.disabled = true;
    status.textContent = 'Saving…';
    try {
      const response = await fetch(`/api/internal/homepage/${section.key}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(' ') : result.message || 'Unable to save section');
      status.textContent = 'Section saved.';
    } catch (error) {
      status.textContent = error.message || 'Unable to save section.';
    } finally {
      submit.disabled = false;
    }
  });

  body.append(form);
  collapse.append(body);
  item.append(header, collapse);
  return item;
}

async function boot() {
  try {
    const session = await fetch('/api/auth/session', { credentials: 'same-origin' });
    if (!session.ok) return window.location.replace('/internal/');
    const response = await fetch('/api/internal/homepage', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Unable to load homepage content');
    const content = await response.json();
    sectionsContainer.replaceChildren(...SECTIONS.map((section, index) => renderSection(section, content[section.key] || {}, index)));
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
