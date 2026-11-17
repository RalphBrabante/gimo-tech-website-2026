# Gimo Tech Store

A Next.js public website and NestJS API packaged as one production Node application. NestJS hosts the Next.js renderer in the same process, so Hostinger still runs a single `npm start`.

## Local development

```bash
npm install
npm run install:all
npm run dev
```

Open `http://localhost:3000`. `npm run dev` runs NestJS in watch mode, and NestJS starts Next.js in development mode (hot reload) inside the same process, so the website, API and internal dashboard share one origin.

**Preview without a database:** `npm run build` once, then `npm run preview` and open `http://localhost:3100`. This uses the real API controllers and Next.js pages with in-memory sample products (no MySQL or mail). Quote and enquiry forms are accepted but nothing is stored.

Copy `.env.example` to `.env` and enter the MySQL password before starting the application. The API uses TypeORM migrations and never uses automatic schema synchronization.

## Hostinger GitHub deployment

Do **not** deploy this repository through **Advanced → Git**. That workflow is for PHP, WordPress, and static HTML sites. Because this project contains a NestJS server, deploy it as a Node.js Web App:

1. Push the complete repository to GitHub, including all three `package-lock.json` files.
2. In hPanel, open **Websites → Add Website → Deploy Web App**.
3. Select **Import Git Repository** and authorize/select the repository.
4. Review the detected build settings and deploy.

Use these settings if Hostinger does not fill them automatically:

- Framework: **NestJS** (or **Other** if auto-detection does not select NestJS)
- Node.js: **20.x or 22.x**
- Package manager: **npm**
- Build command: `npm run build`
- Start command: `npm start`
- Entry file: `server.js`
- Output directory, if the **Other** preset requires one: `client/dist/client/browser`

Set `NODE_ENV=production` in hPanel. Do not set `PORT`; Hostinger supplies it. The production NestJS process serves both the API and independently indexable Next.js page documents. Public navigation uses normal full-page requests rather than SPA-style client routing.

Hostinger keeps server-side Node build files outside `public_html` and generates the routing `.htaccess` automatically. Do not manually deploy this application into `public_html`.

Health check: `https://your-domain.example/health`

## VPS deployment

Build with `npm ci && npm run build`, set `NODE_ENV=production` and `PORT=3000`, then run `npm start` under PM2. Put NGINX in front of port 3000 and manage TLS at NGINX.

## Environment

Copy `.env.example` to `.env` for a manual deployment. Keep secrets out of Git; configure production values in Hostinger hPanel.

## Architecture

- `client/` — Next.js (App Router). Every public page is server-rendered per request from the NestJS public content API (`/api/public/*`, loopback in the same process, 30-second in-memory cache with stale-on-error). Navigation uses plain `<a href>` links, so each page is a full document load.
- `server/` — NestJS: API, MySQL/TypeORM, quotations and product enquiries, internal dashboard (`server/internal-ui/`), `sitemap.xml`, and the HTTP pipeline (`src/http-setup.ts`) that hands every non-NestJS path to Next.js.
- Public HTML is sent with `Cache-Control: public, max-age=0, s-maxage=120, stale-while-revalidate=600` so Hostinger's CDN can absorb traffic bursts. The quotation confirmation page, errors, 404s and requests from signed-in administrators are never shared-cached. **Purge the Hostinger CDN cache after each deployment.**
- Rate limiting is per real visitor (`CF-Connecting-IP`), and the site's own server-side renders never consume a visitor's limit.

## Technical SEO and testing

Run `npm run test:seo` for server/data-integrity checks. Browser checks run against the preview fixture (`npm run preview`, port 3100): `npm run test:browser` (console errors, overflow, H1, 3D, enquiry/quote/menu flows at 360–1440px), `npm run test:a11y` (axe WCAG 2.2 AA plus dialog keyboard checks) and `npm run test:analytics` (Google tag scope and CSP). If Playwright's Chromium is missing system libraries, run them in `mcr.microsoft.com/playwright:v1.63.0-noble`.

`npm run seo:keywords -- <origin> <output.json>` scores every sitemap page against the Google Ads keyword list. See [the keyword audit](docs/seo/keyword-audit.md), [earlier audit results](docs/seo/audit-after.md), [rollout and rollback](docs/seo/production-verification.md), and [owner evidence still needed](docs/seo/owner-inputs.md).
