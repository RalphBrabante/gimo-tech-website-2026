const threadState = { uid: null, folder: 'INBOX', clients: [], thread: null };
const element = (id) => document.querySelector(`#${id}`);
const escapeThreadHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const formatThreadDate = (value) => {
  const date = new Date(value || '');
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};
const formatFileSize = (bytes) => {
  const size = Number(bytes || 0);
  if (!size) return 'Size unavailable';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

async function threadApi(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (typeof options.body === 'string') headers['Content-Type'] = 'application/json';
  const response = await fetch(path, { credentials: 'same-origin', ...options, headers });
  if (response.status === 401) { window.location.replace('/internal/'); throw new Error('Your session has expired.'); }
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message;
    throw new Error(message || `Request failed (HTTP ${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

function attachmentMarkup(message) {
  if (!message.attachments?.length) return '';
  return `<ul class="message-attachments" aria-label="Email attachments">${message.attachments.map((attachment) => {
    const baseUrl = attachment.id ? `/api/internal/desk/messages/${encodeURIComponent(message.uid)}/attachments/${encodeURIComponent(attachment.id)}?folder=${encodeURIComponent(message.folder)}` : '';
    const imagePreview = baseUrl && attachment.previewable && attachment.contentType.startsWith('image/')
      ? `<a class="attachment-image" href="${baseUrl}" target="_blank" rel="noopener"><img src="${baseUrl}" alt="Preview of ${escapeThreadHtml(attachment.filename)}" loading="lazy" decoding="async"></a>` : '';
    const actions = baseUrl ? `<span class="attachment-actions">${attachment.previewable ? `<a href="${baseUrl}" target="_blank" rel="noopener">Preview</a>` : ''}<a href="${baseUrl}&download=1">Download</a></span>` : '<span class="text-secondary">Sent</span>';
    return `<li>${imagePreview}<div class="attachment-details"><i class="bi bi-paperclip" aria-hidden="true"></i><span><strong>${escapeThreadHtml(attachment.filename)}</strong><small>${escapeThreadHtml(formatFileSize(attachment.sizeBytes))}</small></span>${actions}</div></li>`;
  }).join('')}</ul>`;
}

function uidFromPath() {
  const match = window.location.pathname.match(/\/internal\/desk\/messages\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function loadThread() {
  const refreshButton = element('thread-refresh');
  refreshButton.disabled = true;
  element('conversation-status').textContent = 'Loading conversation…';
  element('thread-alert').classList.add('d-none');
  try {
    const [clients, thread] = await Promise.all([
      threadApi('/api/internal/desk/clients'),
      threadApi(`/api/internal/desk/messages/${encodeURIComponent(threadState.uid)}/thread?folder=${encodeURIComponent(threadState.folder)}`)
    ]);
    threadState.clients = clients;
    threadState.thread = thread;
    renderThread();
    element('conversation-status').textContent = 'Up to date';
  } catch (error) {
    element('thread-alert').textContent = error.message;
    element('thread-alert').classList.remove('d-none');
    element('conversation-status').textContent = 'Could not load';
  } finally {
    refreshButton.disabled = false;
    element('thread-page').classList.remove('d-none');
    element('thread-loading')?.remove();
  }
}

function renderThread() {
  const { ticket, messages, mailbox } = threadState.thread;
  const requester = ticket.from?.name || ticket.from?.address || 'Unknown client';
  element('thread-subject').textContent = ticket.subject;
  document.title = `${ticket.subject} | Gimo Tech Helpdesk`;
  element('ticket-id').textContent = `EMAIL-${ticket.uid}`;
  element('ticket-mailbox').textContent = mailbox;
  element('ticket-created').textContent = formatThreadDate(ticket.receivedAt);
  element('ticket-message-count').textContent = String(messages.length);
  element('customer-title').textContent = requester;
  element('customer-avatar').textContent = requester.charAt(0).toUpperCase();
  element('customer-email').textContent = ticket.from.address;
  element('customer-email').href = `mailto:${encodeURIComponent(ticket.from.address)}`;
  element('reply-recipient').textContent = ticket.from.address;

  const clientSelect = element('thread-client');
  clientSelect.innerHTML = `<option value="">Unassigned</option>${threadState.clients.map((client) => `<option value="${client.id}">${escapeThreadHtml(client.name)}</option>`).join('')}`;
  clientSelect.value = ticket.client ? String(ticket.client.id) : '';

  element('conversation-list').innerHTML = messages.length ? messages.map((message) => {
    const outgoing = message.direction === 'outgoing';
    const author = outgoing ? 'GIMO Laboratory Supplies' : (message.from.name || message.from.address || 'Client');
    return `<article class="conversation-message ${outgoing ? 'outgoing' : 'incoming'}"><div class="conversation-avatar" aria-hidden="true">${escapeThreadHtml(author.charAt(0).toUpperCase())}</div><div class="conversation-bubble"><header><div><strong>${escapeThreadHtml(author)}</strong><span>${outgoing ? 'Sales team' : escapeThreadHtml(message.from.address)}</span></div><time>${escapeThreadHtml(formatThreadDate(message.receivedAt))}</time></header><div class="conversation-body">${escapeThreadHtml(message.bodyText).replace(/\n/g, '<br>')}</div>${message.quotedHistoryHidden ? '<p class="quoted-history-note"><i class="bi bi-eye-slash" aria-hidden="true"></i> Previous reply history hidden</p>' : ''}${attachmentMarkup(message)}</div></article>`;
  }).join('') : '<p class="conversation-empty">No matching messages were found for this conversation.</p>';
  requestAnimationFrame(() => { const list = element('conversation-list'); list.scrollTop = list.scrollHeight; });
}

element('thread-client').addEventListener('change', async (event) => {
  event.currentTarget.disabled = true;
  element('client-status').textContent = 'Saving…';
  try {
    const clientId = event.currentTarget.value ? Number(event.currentTarget.value) : null;
    const result = await threadApi(`/api/internal/desk/messages/${encodeURIComponent(threadState.uid)}/client?folder=${encodeURIComponent(threadState.folder)}`, { method: 'PATCH', body: JSON.stringify({ clientId }) });
    threadState.thread.ticket.client = result.client;
    element('client-status').textContent = 'Client category saved.';
  } catch (error) { element('client-status').textContent = error.message; }
  finally { event.currentTarget.disabled = false; }
});

element('reply-files').addEventListener('change', (event) => {
  const files = [...event.currentTarget.files];
  const total = files.reduce((sum, file) => sum + file.size, 0);
  const invalid = files.length > 5 || files.some((file) => file.size > 5 * 1024 * 1024) || total > 15 * 1024 * 1024;
  if (invalid) {
    event.currentTarget.value = '';
    element('reply-file-list').innerHTML = '';
    element('reply-status').textContent = 'Choose up to 5 files, no more than 5 MB each and 15 MB total.';
    return;
  }
  element('reply-status').textContent = '';
  element('reply-file-list').innerHTML = files.map((file) => `<li><i class="bi bi-file-earmark" aria-hidden="true"></i><span>${escapeThreadHtml(file.name)} <small>${escapeThreadHtml(formatFileSize(file.size))}</small></span></li>`).join('');
});

element('reply-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const textarea = element('reply-text');
  const text = textarea.value.trim();
  if (!text) { textarea.focus(); element('reply-status').textContent = 'Write a reply before sending.'; return; }
  const button = element('send-reply');
  const fileInput = element('reply-files');
  const selectedFiles = [...fileInput.files];
  button.disabled = true;
  textarea.disabled = true;
  fileInput.disabled = true;
  element('reply-status').textContent = 'Sending reply…';
  try {
    const form = new FormData();
    form.append('text', text);
    selectedFiles.forEach((file) => form.append('attachments', file, file.name));
    const result = await threadApi(`/api/internal/desk/messages/${encodeURIComponent(threadState.uid)}/replies?folder=${encodeURIComponent(threadState.folder)}`, { method: 'POST', body: form });
    threadState.thread.messages.push({ uid: `sent-${Date.now()}`, subject: threadState.thread.ticket.subject, from: { name: 'GIMO Laboratory Supplies', address: threadState.thread.mailbox }, receivedAt: result.sentAt, preview: text.slice(0, 280), unread: false, hasAttachments: selectedFiles.length > 0, client: threadState.thread.ticket.client, assignmentSource: null, folder: 'INBOX.Sent', direction: 'outgoing', bodyText: text, messageId: null, inReplyTo: null, quotedHistoryHidden: false, attachments: selectedFiles.map((file) => ({ id: '', filename: file.name, contentType: file.type, sizeBytes: file.size, inline: false, previewable: false })) });
    textarea.value = '';
    fileInput.value = '';
    element('reply-file-list').innerHTML = '';
    renderThread();
    element('reply-status').textContent = 'Reply sent successfully.';
  } catch (error) { element('reply-status').textContent = error.message; }
  finally { button.disabled = false; textarea.disabled = false; fileInput.disabled = false; }
});

element('thread-refresh').addEventListener('click', loadThread);
element('thread-logout').addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); window.location.replace('/internal/'); });
threadState.uid = uidFromPath();
if (!threadState.uid) { window.location.replace('/internal/helpdesk/'); } else { void loadThread(); }
