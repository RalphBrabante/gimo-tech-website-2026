const loading = document.querySelector('#session-loading');
const dashboard = document.querySelector('#dashboard');
const currentUser = document.querySelector('#current-user');
const logoutButton = document.querySelector('#logout-button');

async function loadDashboard() {
  try {
    const sessionResponse = await fetch('/api/auth/session', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    });

    if (!sessionResponse.ok) {
      window.location.replace('/internal/');
      return;
    }

    const session = await sessionResponse.json();
    currentUser.textContent = session.user.username;
    dashboard.classList.remove('d-none');
    loading.remove();
    await loadProductSummary();
  } catch {
    window.location.replace('/internal/');
  }
}

async function loadProductSummary() {
  const status = document.querySelector('#summary-status');
  try {
    const response = await fetch('/api/products', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Catalog unavailable');
    const products = await response.json();
    document.querySelector('#product-count').textContent = String(products.length);
    status.textContent = 'Catalog is online';
  } catch {
    status.textContent = 'Catalog unavailable';
  }
}

logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  window.location.replace('/internal/');
});

void loadDashboard();
