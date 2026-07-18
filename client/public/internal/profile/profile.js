const profileById = (id) => document.querySelector(`#${id}`);
const profileForm = profileById('profile-form');

async function profileApi(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (response.status === 401 && !options.allowUnauthorized) { window.location.replace('/internal/'); throw new Error('Your session has expired.'); }
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message;
    throw new Error(message || `Request failed (HTTP ${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

async function loadProfile() {
  try {
    const profile = await profileApi('/api/auth/profile');
    profileById('profile-username').value = profile.username;
    profileById('profile-email').value = profile.email || '';
    profileById('password-changed').textContent = profile.passwordChangedAt ? new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(profile.passwordChangedAt)) : 'Not recorded';
    profileById('profile-page').classList.remove('d-none');
    profileById('profile-loading').remove();
  } catch { window.location.replace('/internal/'); }
}

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const newPassword = profileById('new-password').value;
  const confirmPassword = profileById('confirm-password').value;
  const status = profileById('profile-status');
  if (!profileForm.reportValidity()) return;
  if (newPassword !== confirmPassword) { status.textContent = 'The new-password confirmation does not match.'; profileById('confirm-password').focus(); return; }
  const button = profileById('save-profile');
  button.disabled = true;
  status.textContent = 'Saving credentials…';
  try {
    const body = { username: profileById('profile-username').value.trim(), email: profileById('profile-email').value.trim(), currentPassword: profileById('current-password').value };
    if (newPassword) body.newPassword = newPassword;
    const profile = await profileApi('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(body), allowUnauthorized: true });
    profileById('profile-username').value = profile.username;
    profileById('profile-email').value = profile.email || '';
    profileById('current-password').value = '';
    profileById('new-password').value = '';
    profileById('confirm-password').value = '';
    status.textContent = 'Your login credentials were updated.';
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});

profileById('profile-logout').addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); window.location.replace('/internal/'); });
void loadProfile();
