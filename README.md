# Gimo Tech Store

An Angular storefront and Express API packaged as one production Node application.

## Local development

```bash
npm install
npm run install:all
npm run dev
```

Open `http://localhost:4200`. Angular proxies `/api` to Express on port 3000.

## Hostinger managed Node.js deployment

Connect this repository in **Websites → Add website → Node.js Web App**, then use:

- Framework: **Express.js** (or **Other** if auto-detection does not select Express)
- Node.js: **20.x or 22.x**
- Package manager: **npm**
- Build command: `npm run build`
- Start command: `npm start`
- Entry file, if requested: `server/src/server.js`

Set `NODE_ENV=production` in hPanel. Do not set `PORT`; Hostinger supplies it. The production Express process serves both the API and the compiled Angular single-page app, including client-side route fallback.

Health check: `https://your-domain.example/health`

## VPS deployment

Build with `npm ci && npm run build`, set `NODE_ENV=production` and `PORT=3000`, then run `npm start` under PM2. Put NGINX in front of port 3000 and manage TLS at NGINX.

## Environment

Copy `.env.example` to `.env` for a manual deployment. Keep secrets out of Git; configure production values in Hostinger hPanel.
