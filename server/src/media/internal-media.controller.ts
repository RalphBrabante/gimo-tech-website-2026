import { BadRequestException, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { MAX_CONTENT_IMAGE_BYTES, contentImageFilter, saveContentImages } from './media-upload.config';

@Controller('api/internal/media')
@UseGuards(InternalAuthGuard)
export class InternalMediaController {
  @Post()
  @UseInterceptors(FilesInterceptor('images', 8, {
    storage: memoryStorage(),
    fileFilter: contentImageFilter,
    limits: { files: 8, fileSize: MAX_CONTENT_IMAGE_BYTES }
  }))
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('Upload at least one image.');
    const saved = await saveContentImages(files);
    return { urls: saved.urls };
  }
}
