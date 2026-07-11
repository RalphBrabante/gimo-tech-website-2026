import { IsString, Length } from 'class-validator';

export class CtaBannerSectionDto {
  @IsString() @Length(1, 200) heading: string;
  @IsString() @Length(1, 80) ctaLabel: string;
  @IsString() @Length(1, 300) ctaHref: string;
}
