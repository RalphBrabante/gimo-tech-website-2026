import { IsString, Length } from 'class-validator';

export class LocationSectionDto {
  @IsString() @Length(1, 80) tagline: string;
  @IsString() @Length(1, 300) description: string;
  @IsString() @Length(1, 80) ctaLabel: string;
  @IsString() @Length(1, 300) ctaHref: string;
}
