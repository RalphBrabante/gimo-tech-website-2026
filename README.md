# Gimo Tech Store

An Angular storefront and NestJS API packaged as one production Node application.

## Local development

```bash
npm install
npm run install:all
npm run dev
```

Open `http://localhost:4200`. Angular proxies `/api` to NestJS on port 3000.

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

Set `NODE_ENV=production` in hPanel. Do not set `PORT`; Hostinger supplies it. The production NestJS process serves both the API and independently indexable Angular page documents. Public navigation uses normal full-page requests rather than SPA-style client routing.

Hostinger keeps server-side Node build files outside `public_html` and generates the routing `.htaccess` automatically. Do not manually deploy this application into `public_html`.

Health check: `https://your-domain.example/health`

## VPS deployment

Build with `npm ci && npm run build`, set `NODE_ENV=production` and `PORT=3000`, then run `npm start` under PM2. Put NGINX in front of port 3000 and manage TLS at NGINX.

## Environment

Copy `.env.example` to `.env` for a manual deployment. Keep secrets out of Git; configure production values in Hostinger hPanel.
