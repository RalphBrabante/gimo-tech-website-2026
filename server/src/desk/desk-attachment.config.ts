import { BadRequestException } from '@nestjs/common';

export const MAX_DESK_ATTACHMENTS = 5;
export const MAX_DESK_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_DESK_ATTACHMENTS_TOTAL_BYTES = 15 * 1024 * 1024;

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/csv',
  'text/plain'
]);

export function deskAttachmentFilter(
  _request: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void
): void {
  if (!allowedMimeTypes.has(file.mimetype.toLowerCase())) {
    callback(new BadRequestException(`The attachment type for ${file.originalname} is not supported.`), false);
    return;
  }
  callback(null, true);
}
