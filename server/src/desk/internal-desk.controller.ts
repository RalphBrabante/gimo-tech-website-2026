import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { deskAttachmentFilter, MAX_DESK_ATTACHMENT_BYTES, MAX_DESK_ATTACHMENTS, MAX_DESK_ATTACHMENTS_TOTAL_BYTES } from './desk-attachment.config';
import { AssignDeskMessageDto } from './dto/assign-desk-message.dto';
import { CreateDeskClientDto } from './dto/create-desk-client.dto';
import { DeskAttachmentQueryDto } from './dto/desk-attachment-query.dto';
import { DeskMailQueryDto } from './dto/desk-mail-query.dto';
import { DeskService } from './desk.service';
import { ReplyDeskMessageDto } from './dto/reply-desk-message.dto';

@Controller('api/internal/desk')
@UseGuards(InternalAuthGuard)
export class InternalDeskController {
  constructor(private readonly desk: DeskService) {}

  @Get('clients')
  listClients() {
    return this.desk.listClients();
  }

  @Post('clients')
  createClient(@Body() input: CreateDeskClientDto) {
    return this.desk.createClient(input);
  }

  @Get('messages')
  listMessages(@Query() query: DeskMailQueryDto) {
    return this.desk.listInbox(query.folder);
  }

  @Get('messages/:uid')
  getMessage(@Param('uid') uid: string, @Query() query: DeskMailQueryDto) {
    return this.desk.getMessage(uid, query.folder);
  }

  @Get('messages/:uid/thread')
  getThread(@Param('uid') uid: string, @Query() query: DeskMailQueryDto) {
    return this.desk.getThread(uid, query.folder);
  }

  @Post('messages/:uid/replies')
  @UseInterceptors(FilesInterceptor('attachments', MAX_DESK_ATTACHMENTS, {
    storage: memoryStorage(),
    fileFilter: deskAttachmentFilter,
    limits: { files: MAX_DESK_ATTACHMENTS, fileSize: MAX_DESK_ATTACHMENT_BYTES }
  }))
  reply(
    @Param('uid') uid: string,
    @Query() query: DeskMailQueryDto,
    @Body() input: ReplyDeskMessageDto,
    @UploadedFiles() files: Express.Multer.File[] = []
  ) {
    const totalBytes = files.reduce((total, file) => total + file.size, 0);
    if (totalBytes > MAX_DESK_ATTACHMENTS_TOTAL_BYTES) throw new BadRequestException('Attachments may total no more than 15 MB.');
    return this.desk.replyToMessage(uid, input.text, query.folder, files);
  }

  @Get('messages/:uid/attachments/:attachmentId')
  async attachment(
    @Param('uid') uid: string,
    @Param('attachmentId') attachmentId: string,
    @Query() query: DeskAttachmentQueryDto,
    @Res() response: Response
  ) {
    const attachment = await this.desk.getAttachment(uid, attachmentId, query.folder);
    const disposition = query.download === '1' || !attachment.previewable ? 'attachment' : 'inline';
    const asciiFilename = attachment.filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
    response.set({
      'Content-Type': attachment.contentType,
      'Content-Length': String(attachment.buffer.length),
      'Content-Disposition': `${disposition}; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(attachment.filename)}`,
      'Cache-Control': 'private, no-store',
      'Content-Security-Policy': "sandbox; default-src 'none'",
      'X-Content-Type-Options': 'nosniff'
    });
    response.send(attachment.buffer);
  }

  @Patch('messages/:uid/client')
  assignClient(@Param('uid') uid: string, @Query() query: DeskMailQueryDto, @Body() input: AssignDeskMessageDto) {
    return this.desk.assignClient(uid, input.clientId, query.folder);
  }
}
