const resetToken = new URLSearchParams(window.location.search).get('token');
const requestForm = document.querySelector('#request-reset-form');
const completeForm = document.querySelector('#complete-reset-form');

if (resetToken) {
  requestForm.hidden = true;
  completeForm.hidden = false;
  document.querySelector('#reset-intro').textContent = 'Choose a strong new password for your internal account.';
}

async function resetApi(path, body) {
  const response = await fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message;
    throw new Error(response.status === 429 ? 'Too many requests. Please wait before trying again.' : message || 'The request could not be completed.');
  }
  return response.status === 204 ? null : response.json();
}

requestForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!requestForm.reportValidity()) return;
  const button = requestForm.querySelector('button');
  const status = document.querySelector('#request-status');
  button.disabled = true;
  status.textContent = 'Requesting a reset link…';
  try {
    const result = await resetApi('/api/auth/password-reset/request', { identifier: document.querySelector('#reset-identifier').value.trim() });
    status.textContent = result.message;
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});

completeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!completeForm.reportValidity()) return;
  const password = document.querySelector('#reset-password').value;
  const confirmation = document.querySelector('#reset-confirm').value;
  const status = document.querySelector('#complete-status');
  if (password !== confirmation) { status.textContent = 'The password confirmation does not match.'; document.querySelector('#reset-confirm').focus(); return; }
  const button = completeForm.querySelector('button');
  button.disabled = true;
  status.textContent = 'Updating your password…';
  try {
    await resetApi('/api/auth/password-reset', { token: resetToken, password });
    status.textContent = 'Password updated. Redirecting to sign in…';
    window.setTimeout(() => window.location.replace('/internal/'), 900);
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});
