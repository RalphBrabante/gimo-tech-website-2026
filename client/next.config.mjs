// Plain ESM (not TypeScript) so the config loads without SWC. Hostinger's build servers ship a
// glibc older than 2.29, so Next.js falls back to WebAssembly SWC, which cannot run Turbopack;
// production builds therefore use webpack (`next build --webpack`, see package.json).
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static website: `next build` writes plain HTML/CSS/JS to client/out. No Node server,
  // API or database is needed at runtime. Redirects, 404 handling, caching and security headers
  // live in public/.htaccess (Hostinger/LiteSpeed) and in /server.js (Node fallback).
  output: 'export',
  poweredByHeader: false,
  reactStrictMode: true,
  // Shared business data lives in server/src/common; allow imports from the repository root.
  turbopack: { root: repositoryRoot },
  outputFileTracingRoot: repositoryRoot,
  // Images are pre-optimised AVIF/WebP/JPEG files with explicit srcset; no runtime optimiser.
  images: { unoptimized: true },
  // The stylesheet is small (~6 KB compressed) and most visitors arrive fresh from search or ads,
  // so inlining it removes a render-blocking request at little cost to repeat visits.
  experimental: { inlineCss: true }
};

export default nextConfig;
