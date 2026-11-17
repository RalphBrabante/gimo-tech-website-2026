// Plain ESM (not TypeScript) so the config loads without SWC. Hostinger's build servers ship a
// glibc older than 2.29, so Next.js cannot load its native SWC binary there and falls back to the
// WebAssembly build. That fallback does not support Turbopack, so production builds use webpack
// (`next build --webpack`, see package.json); local development may still use Turbopack.
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const NYLON = '/products/nylon-syringe-filter-25mm-045um';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served by the NestJS process (server/src/next/next-handler.ts), which owns
  // /api, /internal, /uploads, /health and /sitemap.xml.
  poweredByHeader: false,
  reactStrictMode: true,
  // Shared business data lives in server/src/common; allow imports from the repository root.
  turbopack: { root: repositoryRoot },
  outputFileTracingRoot: repositoryRoot,
  // Images are pre-optimised AVIF/WebP/JPEG files with explicit srcset; no runtime optimiser.
  images: { unoptimized: true },
  async redirects() {
    // Legacy nylon aliases keep their established one-hop 301s.
    return ['/product/nylon-syringe-filter-25mm-045um', '/products/nylon-syringe-filter-25mm-0-45um', '/products/nylon-syringe-filter-25mm-045-micron']
      .map((source) => ({ source, destination: NYLON, statusCode: 301 }));
  }
};

export default nextConfig;
