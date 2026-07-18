import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class DeskMailQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[^\u0000-\u001f\\]+$/, { message: 'folder contains unsupported characters.' })
  folder?: string;
}
