/* Consent-gated, vendor-neutral adapter. No tag or tracking ID is installed. */
(function () {
  'use strict';
  function emit(name, details) {
    // The owner-approved adapter must expose both consent and send. Never queue pre-consent actions.
    var adapter = window.gimoAnalytics;
    if (!adapter || adapter.consent !== true || typeof adapter.send !== 'function') return;
    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical || document.querySelector('meta[name="robots"][content*="noindex"]')) return;
    var path = new URL(canonical.href).pathname; // Approved public path only; never arbitrary error URLs, queries or customer identifiers.
    var data = { page_path: path };
    if (details && details.product_id) data.product_id = details.product_id;
    if (details && details.destination) data.destination = details.destination;
    try { adapter.send(name, data); } catch (_) { /* Tracking never blocks purchasing. */ }
  }
  var viewed = false;
  function productView() {
    if (viewed) return;
    var match = location.pathname.match(/^\/product\/([1-9]\d*)$/);
    var nylon = location.pathname === '/products/nylon-syringe-filter-25mm-045um';
    if ((!match && !nylon) || !document.querySelector('h1') || document.querySelector('meta[name="robots"][content*="noindex"]')) return;
    if (!window.gimoAnalytics || window.gimoAnalytics.consent !== true) return;
    viewed = true; emit('product_view', { product_id: match ? match[1] : 'nylon-25mm-045um-100' });
  }
  document.addEventListener('click', function (event) {
    var a = event.target.closest && event.target.closest('a[href]');
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.hostname === 'www.lazada.com.ph' || url.hostname === 'lazada.com.ph') emit('lazada_outbound_click', { destination: 'lazada' });
    else if (url.protocol === 'mailto:' || url.protocol === 'tel:') emit('contact_click', { destination: url.protocol === 'mailto:' ? 'email' : 'phone' });
  });
  window.addEventListener('gimo:quote-start', function () { emit('quote_start'); });
  window.addEventListener('gimo:quote-success', function () { emit('quote_submit_success'); });
  window.addEventListener('gimo:analytics-ready', productView);
  productView();
})();
