import { IsString, Length } from 'class-validator';

export class SplitChecklistSectionDto {
  @IsString() @Length(1, 80) eyebrow: string;
  @IsString() @Length(1, 200) heading: string;
  @IsString() @Length(1, 500) body: string;
  @IsString({ each: true }) @Length(1, 120, { each: true }) checklist: string[];
  @IsString() @Length(1, 80) ctaLabel: string;
  @IsString() @Length(1, 300) ctaHref: string;
}
