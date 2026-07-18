import { IsIn, IsOptional } from 'class-validator';
import { DeskMailQueryDto } from './desk-mail-query.dto';

export class DeskAttachmentQueryDto extends DeskMailQueryDto {
  @IsOptional()
  @IsIn(['0', '1'])
  download?: string;
}
