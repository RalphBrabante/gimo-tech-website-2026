/* Owner-approved Google Analytics tag for gimosupplies.com. */
(function () {
  'use strict';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-TQKFJZL6YS');

  // Keep initialization local so the CSP does not need unsafe inline scripts.
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-TQKFJZL6YS';
  document.head.appendChild(script);
})();
