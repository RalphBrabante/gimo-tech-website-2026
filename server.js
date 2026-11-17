// Static file server for the exported website (client/out). No framework, API or database.
//
// Preferred hosting is plain static hosting (Hostinger web hosting serving client/out with
// client/public/.htaccess). This server exists so `npm start` still works when the site is
// deployed as a Node.js web app, and for local previews. Keep its rules in sync with .htaccess.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), 'client/out');
const port = Number(process.env.PORT) || 3000;
const canonicalHost = 'gimosupplies.com';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};
const REDIRECTS = new Map([
  ['/product/nylon-syringe-filter-25mm-045um', '/products/nylon-syringe-filter-25mm-045um'],
  ['/products/nylon-syringe-filter-25mm-0-45um', '/products/nylon-syringe-filter-25mm-045um'],
  ['/products/nylon-syringe-filter-25mm-045-micron', '/products/nylon-syringe-filter-25mm-045um']
]);
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com https://googleads.g.doubleclick.net https://www.google.com https://www.google.com.ph; font-src 'self'; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com; frame-src 'self' https://www.google.com https://maps.google.com https://td.doubleclick.net; worker-src 'self' blob:; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'self'; object-src 'none'"
};

function cacheControl(path, file) {
  if (path.startsWith('/_next/static/')) return 'public, max-age=31536000, immutable';
  if (file.endsWith('.md')) return 'private, max-age=300'; // may be served under an HTML URL
  if (/\.(html|xml|txt)$/.test(file)) return 'public, max-age=300, stale-while-revalidate=86400';
  return 'public, max-age=604800, stale-while-revalidate=86400';
}

async function fileAt(relative) {
  const full = normalize(join(root, relative));
  if (full !== root && !full.startsWith(root + sep)) return null;
  try { const info = await stat(full); return info.isFile() ? full : null; } catch { return null; }
}

function send(response, status, file, path, method) {
  const page = /\.(html|md)$/.test(file);
  response.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': status === 200 ? cacheControl(path, file) : 'no-store',
    ...(page ? { Vary: 'Accept', Link: '</llms.txt>; rel="describedby"; type="text/plain"' } : {})
  });
  if (method === 'HEAD') { response.end(); return; }
  createReadStream(file).on('error', () => response.destroy()).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const method = request.method ?? 'GET';
    if (method !== 'GET' && method !== 'HEAD') { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    const url = new URL(request.url ?? '/', 'http://local');
    let path;
    try { path = decodeURIComponent(url.pathname); } catch { path = '/__invalid__'; }
    const host = (request.headers.host ?? '').split(':')[0].toLowerCase();
    if (host === `www.${canonicalHost}`) { response.writeHead(301, { Location: `https://${canonicalHost}${url.pathname}${url.search}` }).end(); return; }

    const blocked = /^\/(?:api|internal|uploads|dashboard)(?:\/|$)|^\/(?:index|404)\.html$/.test(path);
    const redirect = REDIRECTS.get(path.replace(/\/+$/, ''));
    if (redirect) { response.writeHead(301, { Location: redirect }).end(); return; }
    if (!blocked && path.length > 1 && path.endsWith('/')) { response.writeHead(301, { Location: `${path.replace(/\/+$/, '')}${url.search}` }).end(); return; }
    if (path === '/health') { response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end('{"status":"ok","service":"gimo-static"}'); return; }

    // AI agents asking for Markdown get the page's .md copy; browsers get HTML.
    const wantsMarkdown = /text\/markdown/i.test(request.headers.accept ?? '');
    const page = async (base) => (wantsMarkdown && await fileAt(`${base}.md`)) || await fileAt(`${base}.html`);
    const file = blocked ? null : path === '/' ? await page('index') : (await fileAt(path)) ?? (extname(path) ? null : await page(path));
    if (file) { send(response, 200, file, path, method); return; }
    const notFound = await fileAt('404.html');
    if (notFound) send(response, 404, notFound, path, method);
    else response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  } catch {
    if (!response.headersSent) response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end('Server error');
  }
});

server.listen(port, '0.0.0.0', () => console.log(`Gimo Tech Supplies static site on port ${port} (serving ${root})`));
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close(() => process.exit(0)));
