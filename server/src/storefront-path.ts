import { resolve } from 'node:path';

/** The Next.js project. Its `public/` directory holds the long-cached public assets. */
export const clientPath = resolve(__dirname, '../../client');
export const storefrontPath = resolve(clientPath, 'public');
/** NestJS-owned internal dashboard documents and assets (never handled by Next.js). */
export const internalUiPath = resolve(__dirname, '../internal-ui');
