// Post-build: out/_next/static/.htaccess caches Next.js build files for a year. Their names are
// content-hashed, so a new deployment never serves stale code (server.js applies the same rule).
// Written here rather than in public/ because Next.js owns the _next folder.
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const outDir = process.argv[2] || 'out';
await writeFile(join(outDir, '_next/static/.htaccess'), `<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|woff2|png|jpg|jpeg|webp|avif|svg|ico)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
`);
console.log('Wrote _next/static/.htaccess (immutable caching)');
