import { IsString, Length } from 'class-validator';

export class ImpactBannerSectionDto {
  @IsString() @Length(1, 80) eyebrow: string;
  @IsString() @Length(1, 200) heading: string;
  @IsString() @Length(1, 500) body: string;
  @IsString() @Length(1, 80) ctaLabel: string;
  @IsString() @Length(1, 300) ctaHref: string;
}
