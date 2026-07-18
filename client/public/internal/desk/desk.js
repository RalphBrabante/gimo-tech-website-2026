const state = { messages: [], clients: [], selectedUid: null, folder: 'INBOX' };
const byId = (id) => document.querySelector(`#${id}`);
const page = byId('page');
const loading = byId('loading');
const messageList = byId('message-list');
const listStatus = byId('list-status');
const deskAlert = byId('desk-alert');
const clientDialog = byId('client-dialog');
const messageClient = byId('message-client');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};
const senderLabel = (message) => message.from?.name || message.from?.address || 'Unknown sender';

async function api(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (response.status === 401) {
    window.location.replace('/internal/');
    throw new Error('Your session has expired.');
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message;
    throw new Error(message || `Request failed (HTTP ${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

async function loadDesk() {
  setRefreshing(true);
  deskAlert.classList.add('d-none');
  try {
    const [clients, inbox] = await Promise.all([api('/api/internal/desk/clients'), api(`/api/internal/desk/messages?folder=${encodeURIComponent(state.folder)}`)]);
    state.clients = clients;
    state.messages = inbox.messages;
    byId('mailbox-label').textContent = `Manage messages received by ${inbox.mailbox}.`;
    populateClientSelects();
    renderMessages();
  } catch (error) {
    state.messages = [];
    renderMessages();
    deskAlert.innerHTML = `<strong>Desk could not load the mailbox.</strong><br>${escapeHtml(error.message)} <span class="d-block mt-2 small">Configure a selected-mailbox Agentic Mail token on the server, then refresh.</span>`;
    deskAlert.classList.remove('d-none');
  } finally {
    setRefreshing(false);
    page.classList.remove('d-none');
    loading?.remove();
  }
}

function setRefreshing(refreshing) {
  const button = byId('refresh');
  button.disabled = refreshing;
  button.innerHTML = refreshing ? '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Refreshing' : '<i class="bi bi-arrow-clockwise" aria-hidden="true"></i> Refresh inbox';
}

function populateClientSelects() {
  const options = state.clients.map((client) => `<option value="${client.id}">${escapeHtml(client.name)}</option>`).join('');
  const filter = byId('client-filter');
  const currentFilter = filter.value;
  filter.innerHTML = `<option value="all">All clients</option><option value="unassigned">Unassigned</option>${options}`;
  filter.value = [...filter.options].some((option) => option.value === currentFilter) ? currentFilter : 'all';
  const currentMessageClient = messageClient.value;
  messageClient.innerHTML = `<option value="">Unassigned</option>${options}`;
  messageClient.value = currentMessageClient;
  byId('client-count').textContent = state.clients.length;
}

function filteredMessages() {
  const query = byId('search').value.trim().toLowerCase();
  const status = document.querySelector('input[name="status-filter"]:checked').value;
  const client = byId('client-filter').value;
  return state.messages.filter((message) => {
    const haystack = `${message.subject} ${senderLabel(message)} ${message.from?.address || ''} ${message.preview || ''}`.toLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (status === 'unread' && !message.unread) return false;
    if (client === 'unassigned' && message.client) return false;
    if (!['all', 'unassigned'].includes(client) && String(message.client?.id) !== client) return false;
    return true;
  });
}

function renderMessages() {
  const messages = filteredMessages();
  byId('total-count').textContent = state.messages.length;
  byId('unread-count').textContent = state.messages.filter((message) => message.unread).length;
  byId('filtered-count').textContent = `${messages.length} message${messages.length === 1 ? '' : 's'}`;
  listStatus.textContent = messages.length ? '' : state.messages.length ? 'No messages match these filters.' : 'No messages are available.';
  messageList.innerHTML = messages.map((message) => `<button class="desk-message${message.unread ? ' unread' : ''}${message.uid === state.selectedUid ? ' selected' : ''}" type="button" data-uid="${escapeHtml(message.uid)}"><span class="desk-avatar" aria-hidden="true">${escapeHtml(senderLabel(message).charAt(0).toUpperCase())}</span><span class="desk-message-copy"><span class="desk-message-top"><strong>${escapeHtml(senderLabel(message))}</strong><time>${escapeHtml(formatDate(message.receivedAt))}</time></span><span class="desk-message-subject">${escapeHtml(message.subject)}</span><span class="desk-message-preview">${escapeHtml(message.preview || 'Open this email to read its message.')}</span><span class="desk-message-meta">${message.client ? `<span class="desk-client-badge"><i class="bi bi-buildings" aria-hidden="true"></i>${escapeHtml(message.client.name)}${message.assignmentSource === 'rule' ? ' · matched' : ''}</span>` : '<span class="desk-unassigned">Unassigned</span>'}${message.hasAttachments ? '<span><i class="bi bi-paperclip" aria-hidden="true"></i> Attachment</span>' : ''}</span></span></button>`).join('');
  messageList.querySelectorAll('[data-uid]').forEach((button) => button.addEventListener('click', () => {
    window.location.assign(`/internal/helpdesk/messages/${encodeURIComponent(button.dataset.uid)}/`);
  }));
}

async function openMessage(uid) {
  state.selectedUid = uid;
  renderMessages();
  byId('reader-empty').classList.add('d-none');
  byId('reader-content').classList.remove('d-none');
  byId('reader-subject').textContent = 'Loading message…';
  byId('reader-body').textContent = '';
  byId('reader-status').textContent = '';
  try {
    const message = await api(`/api/internal/desk/messages/${encodeURIComponent(uid)}?folder=${encodeURIComponent(state.folder)}`);
    byId('reader-client').textContent = message.client?.name || 'Unassigned';
    byId('reader-subject').textContent = message.subject;
    byId('reader-sender').textContent = senderLabel(message);
    byId('reader-address').textContent = message.from?.address || 'Sender address unavailable';
    byId('reader-date').textContent = formatDate(message.receivedAt);
    byId('reader-avatar').textContent = senderLabel(message).charAt(0).toUpperCase();
    byId('reader-body').textContent = message.bodyText;
    messageClient.value = message.client ? String(message.client.id) : '';
    byId('reply-link').href = `mailto:${encodeURIComponent(message.from?.address || '')}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;
  } catch (error) {
    byId('reader-subject').textContent = 'Unable to open this email';
    byId('reader-status').textContent = error.message;
  }
}

messageClient.addEventListener('change', async () => {
  if (!state.selectedUid) return;
  messageClient.disabled = true;
  byId('reader-status').textContent = 'Saving client category…';
  try {
    const clientId = messageClient.value ? Number(messageClient.value) : null;
    const result = await api(`/api/internal/desk/messages/${encodeURIComponent(state.selectedUid)}/client?folder=${encodeURIComponent(state.folder)}`, { method: 'PATCH', body: JSON.stringify({ clientId }) });
    const message = state.messages.find((candidate) => candidate.uid === state.selectedUid);
    if (message) { message.client = result.client; message.assignmentSource = result.client ? 'manual' : null; }
    byId('reader-client').textContent = result.client?.name || 'Unassigned';
    byId('reader-status').textContent = 'Client category saved.';
    renderMessages();
  } catch (error) {
    byId('reader-status').textContent = error.message;
  } finally { messageClient.disabled = false; }
});

byId('client-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  byId('client-form-status').textContent = 'Adding client…';
  try {
    const client = await api('/api/internal/desk/clients', { method: 'POST', body: JSON.stringify({ name: byId('client-name').value.trim(), emailAddress: byId('client-email').value.trim() || undefined, emailDomain: byId('client-domain').value.trim() || undefined }) });
    state.clients.push(client);
    state.clients.sort((a, b) => a.name.localeCompare(b.name));
    populateClientSelects();
    event.currentTarget.reset();
    clientDialog.close();
    byId('client-form-status').textContent = '';
    await loadDesk();
  } catch (error) { byId('client-form-status').textContent = error.message; }
  finally { button.disabled = false; }
});

byId('open-client-dialog').addEventListener('click', () => { clientDialog.showModal(); byId('client-name').focus(); });
[byId('close-client-dialog'), byId('cancel-client')].forEach((button) => button.addEventListener('click', () => clientDialog.close()));
clientDialog.addEventListener('click', (event) => { if (event.target === clientDialog) clientDialog.close(); });
byId('refresh').addEventListener('click', loadDesk);
byId('search').addEventListener('input', renderMessages);
byId('client-filter').addEventListener('change', renderMessages);
document.querySelectorAll('input[name="status-filter"]').forEach((input) => input.addEventListener('change', renderMessages));
byId('clear-filters').addEventListener('click', () => { byId('search').value = ''; byId('client-filter').value = 'all'; document.querySelector('input[name="status-filter"][value="all"]').checked = true; renderMessages(); });
byId('logout').addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); window.location.replace('/internal/'); });
void loadDesk();
