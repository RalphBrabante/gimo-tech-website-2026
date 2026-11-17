// Google tag endpoints for GA4 and Google Ads conversion measurement:
// https://developers.google.com/tag-platform/security/guides/csp
const googleScript = ['https://www.googletagmanager.com', 'https://www.googleadservices.com', 'https://googleads.g.doubleclick.net'];
const googleImage = ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://googleads.g.doubleclick.net', 'https://www.google.com', 'https://www.google.com.ph'];
const googleConnect = ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.google.com', 'https://googleads.g.doubleclick.net', 'https://www.googleadservices.com'];

/** NestJS-owned documents (internal dashboard, error pages): no inline scripts. */
export const contentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', ...googleImage],
    scriptSrc: ["'self'", ...googleScript],
    connectSrc: ["'self'", ...googleConnect],
    frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com', 'https://td.doubleclick.net']
  }
};

/**
 * Public website documents rendered by Next.js. React Server Components stream their payload in
 * inline <script> tags, and the pages are cached at the CDN (so per-request nonces cannot be
 * used). Public pages render no user-supplied HTML (React escapes all text), so inline scripts are
 * allowed only here. Development additionally needs eval and the hot-reload WebSocket.
 */
export function publicSiteContentSecurityPolicy(dev: boolean) {
  return {
    directives: {
      ...contentSecurityPolicy.directives,
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', ...googleImage],
      scriptSrc: ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : []), ...googleScript],
      connectSrc: ["'self'", ...(dev ? ['ws:', 'wss:'] : []), ...googleConnect],
      workerSrc: ["'self'", 'blob:'],
      ...(dev ? { upgradeInsecureRequests: null } : {})
    }
  };
}
