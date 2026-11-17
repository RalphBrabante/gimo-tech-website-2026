# Gimo Tech Supplies website

A **fully static** website (Next.js `output: 'export'`) for gimosupplies.com. Every page is plain HTML built ahead of time, with no API, database or server-side code at runtime, so there is nothing that can crash, time out or hit a database limit.

The NestJS backend in `server/` (admin dashboard, Helpdesk, CMS, quotations) is **retired from deployment** but kept in the repository so it can be restored later. The MySQL database was left untouched.

## Local development

```bash
npm install --prefix client
npm run dev --prefix client -- --port 3000   # optional: next dev with hot reload
npm run build                                 # writes the static site to client/out
npm run preview                               # serves client/out at http://localhost:3100
```

## Editing content

- Menus, homepage copy and the biohazard-bags / Lazada / syringe-filters page text: `client/src/content/snapshot/*.json` (exported from the live CMS on 17 Nov 2026).
- Nylon product page facts, FAQ and specs: `client/src/content/nylon.ts`.
- Contact, about and quotation pages: `client/src/content/contact-pages.tsx`.
- Business details (email, address, Lazada and Shopee shops): `server/src/common/public-business.json`.
- New pages: add them under `client/src/app/` and to `client/src/app/sitemap.ts`.

Rebuild and redeploy after any change.

## Quotation requests

There is no server, so the nylon page form validates the details and opens the visitor's email app with a pre-filled message to the sales email, with a copy-and-paste fallback. Other pages link to email, Lazada and Shopee.

## Hostinger deployment

**Recommended: static hosting.** Deploy from GitHub with:

- Build command: `npm run build`
- Output / publish directory: `client/out`

The build output includes `.htaccess` (from `client/public/.htaccess`) for clean URLs, the legacy 301 redirects, the real 404 page, caching and security headers. Without automatic builds, run `npm run build` locally and upload the contents of `client/out` (including `.htaccess`) to `public_html`.

**Also works: the existing Node.js web app.** `npm run build` then `npm start` (entry file `server.js`) serves `client/out` with the same rules through a tiny dependency-free Node server. No environment variables or database are needed.

Hostinger's build servers have glibc 2.28, so Next.js falls back to WebAssembly SWC (the `GLIBC_2.29 not found` warning is expected). That is why `client` builds with `next build --webpack` and `next.config.mjs` is plain ESM. Do not convert it back to `next.config.ts`. After each deployment, purge the Hostinger CDN cache.

## Technical SEO and testing

Browser checks run against `npm run preview` (port 3100): `npm run test:browser` (console errors, overflow, H1, 3D scenes, quotation form and menu at 360–1440px), `npm run test:a11y` (axe WCAG 2.2 AA plus keyboard and 200% zoom) and `npm run test:analytics` (Google tag scope and CSP). The retired backend keeps its own tests: `npm run api:test`. If Playwright's Chromium is missing system libraries, run them in `mcr.microsoft.com/playwright:v1.63.0-noble`.

`npm run seo:keywords -- <origin> <output.json>` scores every sitemap page against the Google Ads keyword list. See [the keyword audit](docs/seo/keyword-audit.md), [earlier audit results](docs/seo/audit-after.md), [rollout and rollback](docs/seo/production-verification.md), and [owner evidence still needed](docs/seo/owner-inputs.md).
