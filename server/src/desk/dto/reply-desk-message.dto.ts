import { IsString, Length } from 'class-validator';

export class ReplyDeskMessageDto {
  @IsString()
  @Length(1, 20_000)
  text: string;
}
