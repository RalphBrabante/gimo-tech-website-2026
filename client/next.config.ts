import type { NextConfig } from 'next';
import { resolve } from 'node:path';

const NYLON = '/products/nylon-syringe-filter-25mm-045um';

const nextConfig: NextConfig = {
  // Served by the NestJS process (server/src/next/next-handler.ts), which owns
  // /api, /internal, /uploads, /health and /sitemap.xml.
  poweredByHeader: false,
  reactStrictMode: true,
  // Shared business data lives in server/src/common; allow imports from the repository root.
  turbopack: { root: resolve(__dirname, '..') },
  outputFileTracingRoot: resolve(__dirname, '..'),
  // Images are pre-optimised AVIF/WebP/JPEG files with explicit srcset; no runtime optimiser.
  images: { unoptimized: true },
  async redirects() {
    // Legacy nylon aliases keep their established one-hop 301s.
    return ['/product/nylon-syringe-filter-25mm-045um', '/products/nylon-syringe-filter-25mm-0-45um', '/products/nylon-syringe-filter-25mm-045-micron']
      .map((source) => ({ source, destination: NYLON, statusCode: 301 as const }));
  }
};

export default nextConfig;
