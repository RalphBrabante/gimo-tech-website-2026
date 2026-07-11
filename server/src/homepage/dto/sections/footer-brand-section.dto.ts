import { IsString, Length } from 'class-validator';

export class FooterBrandSectionDto {
  @IsString() @Length(1, 400) blurb: string;
  @IsString() @Length(1, 200) copyrightLine: string;
}
