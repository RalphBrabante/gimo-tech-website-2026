const form = document.querySelector('#login-form');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const status = document.querySelector('#form-status');

function validateField(field, message) {
  const error = document.querySelector(`#${field.id}-error`);
  const isValid = field.value.trim().length > 0;
  field.setAttribute('aria-invalid', String(!isValid));
  error.textContent = isValid ? '' : message;
  return isValid;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = '';

  const usernameValid = validateField(username, 'Enter your username.');
  const passwordValid = validateField(password, 'Enter your password.');

  if (!usernameValid || !passwordValid) {
    (usernameValid ? password : username).focus();
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Signing in…';
  status.textContent = 'Checking your credentials…';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value.trim(), password: password.value })
    });

    if (!response.ok) {
      status.textContent = response.status === 429
        ? 'Too many sign-in attempts. Wait a minute and try again.'
        : 'The username or password is incorrect.';
      password.value = '';
      password.focus();
      return;
    }

    status.textContent = 'You are signed in. Opening your dashboard…';
    window.location.assign('/internal/dashboard');
  } catch {
    status.textContent = 'Unable to reach the authentication service. Try again.';
  } finally {
    button.disabled = false;
    button.textContent = 'Sign in';
  }
});

fetch('/api/auth/session', { credentials: 'same-origin' })
  .then((response) => {
    if (response.ok) window.location.replace('/internal/dashboard');
  })
  .catch(() => undefined);

[username, password].forEach((field) => {
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') {
      validateField(field, field === username ? 'Enter your username.' : 'Enter your password.');
    }
  });
});
