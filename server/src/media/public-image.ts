import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { productUploadsPath } from '../products/product-upload.config';
import { contentUploadsPath } from './media-upload.config';
import { storefrontPath } from '../storefront-path';

function localImage(url: string): string | null {
  // Only local images within explicitly served directories; never fetch arbitrary URLs.
  if (url.includes('..') || /[%?#\\]/.test(url)) return null;
  if (url.startsWith('/uploads/products/')) return resolve(productUploadsPath, basename(url));
  if (url.startsWith('/uploads/content/')) return resolve(contentUploadsPath, basename(url));
  if (url.startsWith('/assets/')) return resolve(storefrontPath, url.slice(1));
  return null;
}
export async function imageDimensions(url: string): Promise<{ width: number; height: number } | null> {
  const path = localImage(url); if (!path) return null;
  try { const m = await sharp(path).metadata(); return m.width && m.height ? { width: m.width, height: m.height } : null; } catch { return null; }
}
export function thumbnailUrl(url: string): string {
  const path = localImage(url);
  return path && url.startsWith('/uploads/products/') && existsSync(`${path}.thumb.webp`) ? `${url}.thumb.webp` : url;
}
export async function createThumbnail(path: string): Promise<void> {
  await sharp(path).rotate().resize(240, 180, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${path}.thumb.webp`);
}
