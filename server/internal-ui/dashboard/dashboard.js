const loading = document.querySelector('#session-loading');
const dashboard = document.querySelector('#dashboard');
const currentUser = document.querySelector('#current-user');
const logoutButton = document.querySelector('#logout-button');
const byId = (id) => document.querySelector(`#${id}`);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function dashboardApi(path) {
  const response = await fetch(path, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
  if (response.status === 401) {
    window.location.replace('/internal/');
    throw new Error('Your session has expired.');
  }
  if (!response.ok) throw new Error(`Request failed (HTTP ${response.status}).`);
  return response.json();
}

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
    void loadMetrics();
  } catch {
    window.location.replace('/internal/');
  }
}

async function loadMetrics() {
  const [productsResult, inboxResult] = await Promise.allSettled([
    dashboardApi('/api/internal/products'),
    dashboardApi('/api/internal/desk/messages?folder=INBOX')
  ]);

  if (productsResult.status === 'fulfilled') renderProductMetrics(productsResult.value);
  else renderMetricError('product-chart-status', 'products-empty', 'Product analytics are unavailable.');

  if (inboxResult.status === 'fulfilled') renderEmailMetrics(inboxResult.value.messages || []);
  else renderMetricError('email-chart-status', 'emails-empty', 'Helpdesk analytics are unavailable.');
}

function renderProductMetrics(products) {
  const activeProducts = products.filter((product) => product.isActive);
  byId('metric-products').textContent = String(products.length);
  byId('metric-active-products').textContent = String(activeProducts.length);
  byId('product-chart-status').textContent = `${products.length} product${products.length === 1 ? '' : 's'}`;

  const categories = products.reduce((counts, product) => {
    const category = String(product.category || 'Uncategorized').trim() || 'Uncategorized';
    counts.set(category, (counts.get(category) || 0) + 1);
    return counts;
  }, new Map());
  const rows = [...categories.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  if (!rows.length || !window.Chart) {
    showEmptyChart('products-chart', 'products-empty', rows.length ? 'The chart library could not load.' : 'No product data is available.');
    return;
  }

  new window.Chart(byId('products-chart'), {
    type: 'bar',
    data: {
      labels: rows.map(([category]) => category),
      datasets: [{ label: 'Products', data: rows.map(([, count]) => count), backgroundColor: '#22c7c4', borderColor: '#168c8a', borderWidth: 1, borderRadius: 5 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduceMotion ? false : { duration: 350 },
      indexAxis: rows.length > 6 ? 'y' : 'x',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0, color: '#60778d' }, grid: { color: 'rgba(130,149,166,.15)' } },
        y: { beginAtZero: true, ticks: { precision: 0, color: '#60778d' }, grid: { display: rows.length <= 6, color: 'rgba(130,149,166,.12)' } }
      }
    }
  });
}

function renderEmailMetrics(messages) {
  const unread = messages.filter((message) => message.unread).length;
  const assigned = messages.filter((message) => message.client).length;
  const read = messages.length - unread;
  byId('metric-emails').textContent = String(messages.length);
  byId('metric-unread').textContent = String(unread);
  byId('metric-assigned').textContent = String(assigned);
  byId('email-chart-status').textContent = `${messages.length} loaded email${messages.length === 1 ? '' : 's'}`;

  if (!messages.length || !window.Chart) {
    showEmptyChart('emails-chart', 'emails-empty', messages.length ? 'The chart library could not load.' : 'No email data is available.');
    return;
  }

  new window.Chart(byId('emails-chart'), {
    type: 'doughnut',
    data: {
      labels: ['Read', 'Unread'],
      datasets: [{ data: [read, unread], backgroundColor: ['#153f70', '#22c7c4'], borderColor: '#ffffff', borderWidth: 3, hoverOffset: 4 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduceMotion ? false : { duration: 350 },
      cutout: '66%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#60778d', boxWidth: 12, usePointStyle: true, padding: 18 } },
        tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw}` } }
      }
    }
  });
}

function renderMetricError(statusId, emptyId, message) {
  byId(statusId).textContent = 'Unavailable';
  const empty = byId(emptyId);
  empty.textContent = message;
  empty.classList.remove('d-none');
  empty.previousElementSibling.classList.add('d-none');
}

function showEmptyChart(canvasId, emptyId, message) {
  byId(canvasId).classList.add('d-none');
  const empty = byId(emptyId);
  empty.textContent = message;
  empty.classList.remove('d-none');
}

logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  window.location.replace('/internal/');
});

void loadDashboard();
