// GA endpoints without Ads features, per Google's CSP guidance:
// https://developers.google.com/tag-platform/security/guides/csp#google_analytics
// Shared with the browser fixture so tests enforce the production policy.
export const contentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https://www.googletagmanager.com', 'https://*.google-analytics.com'],
    scriptSrc: ["'self'", 'https://www.googletagmanager.com'],
    connectSrc: ["'self'", 'https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.google.com'],
    frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com']
  }
};
