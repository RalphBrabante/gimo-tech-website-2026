import { BadRequestException } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export const productUploadsPath = resolve(__dirname, '../../../uploads/products');
export const MAX_PRODUCT_IMAGES = 8;
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

const extensions: Record<string, string> = {
  'image/avif': '.avif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

export function productImageFilter(
  _request: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void
): void {
  if (!extensions[file.mimetype]) {
    callback(new BadRequestException('Images must be AVIF, JPEG, PNG, or WebP.'), false);
    return;
  }
  callback(null, true);
}

export async function saveProductImages(files: Express.Multer.File[]): Promise<{ urls: string[]; paths: string[] }> {
  await mkdir(productUploadsPath, { recursive: true });
  const paths: string[] = [];
  const urls: string[] = [];

  try {
    for (const file of files) {
      const filename = `${randomUUID()}${extensions[file.mimetype]}`;
      const path = resolve(productUploadsPath, filename);
      await writeFile(path, file.buffer, { flag: 'wx' });
      paths.push(path);
      urls.push(`/uploads/products/${filename}`);
    }
    return { paths, urls };
  } catch (error) {
    await removeProductImages(paths);
    throw error;
  }
}

export async function removeProductImages(paths: string[]): Promise<void> {
  await Promise.all(paths.map((path) => unlink(path).catch(() => undefined)));
}

export function productImagePathFromUrl(url: string): string {
  const filename = url.split('/').pop() ?? '';
  return resolve(productUploadsPath, filename);
}
