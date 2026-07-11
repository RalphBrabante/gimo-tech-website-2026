import { IsString, Length } from 'class-validator';

export class ConsultIntroSectionDto {
  @IsString() @Length(1, 80) eyebrow: string;
  @IsString() @Length(1, 200) heading: string;
  @IsString() @Length(1, 500) body: string;
}
