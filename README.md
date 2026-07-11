# Gimo Tech Store

An Angular storefront and Express API packaged as one production Node application.

## Local development

```bash
npm install
npm run install:all
npm run dev
```

Open `http://localhost:4200`. Angular proxies `/api` to Express on port 3000.

## Hostinger GitHub deployment

Do **not** deploy this repository through **Advanced → Git**. That workflow is for PHP, WordPress, and static HTML sites. Because this project contains an Express server, deploy it as a Node.js Web App:

1. Push the complete repository to GitHub, including all three `package-lock.json` files.
2. In hPanel, open **Websites → Add Website → Deploy Web App**.
3. Select **Import Git Repository** and authorize/select the repository.
4. Review the detected build settings and deploy.

Use these settings if Hostinger does not fill them automatically:

- Framework: **Express.js** (or **Other** if auto-detection does not select Express)
- Node.js: **20.x or 22.x**
- Package manager: **npm**
- Build command: `npm run build`
- Start command: `npm start`
- Entry file: `server.js`
- Output directory, if the **Other** preset requires one: `client/dist/client/browser`

Set `NODE_ENV=production` in hPanel. Do not set `PORT`; Hostinger supplies it. The production Express process serves both the API and the compiled Angular single-page app, including client-side route fallback.

Hostinger keeps server-side Node build files outside `public_html` and generates the routing `.htaccess` automatically. Do not manually deploy this application into `public_html`.

Health check: `https://your-domain.example/health`

## VPS deployment

Build with `npm ci && npm run build`, set `NODE_ENV=production` and `PORT=3000`, then run `npm start` under PM2. Put NGINX in front of port 3000 and manage TLS at NGINX.

## Environment

Copy `.env.example` to `.env` for a manual deployment. Keep secrets out of Git; configure production values in Hostinger hPanel.
