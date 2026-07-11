import { BadRequestException } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export const contentUploadsPath = resolve(__dirname, '../../../uploads/content');
export const MAX_CONTENT_IMAGE_BYTES = 5 * 1024 * 1024;

const extensions: Record<string, string> = {
  'image/avif': '.avif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

export function contentImageFilter(
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

export async function saveContentImages(files: Express.Multer.File[]): Promise<{ urls: string[]; paths: string[] }> {
  await mkdir(contentUploadsPath, { recursive: true });
  const paths: string[] = [];
  const urls: string[] = [];

  try {
    for (const file of files) {
      const filename = `${randomUUID()}${extensions[file.mimetype]}`;
      const path = resolve(contentUploadsPath, filename);
      await writeFile(path, file.buffer, { flag: 'wx' });
      paths.push(path);
      urls.push(`/uploads/content/${filename}`);
    }
    return { paths, urls };
  } catch (error) {
    await removeContentImages(paths);
    throw error;
  }
}

export async function removeContentImages(paths: string[]): Promise<void> {
  await Promise.all(paths.map((path) => unlink(path).catch(() => undefined)));
}
