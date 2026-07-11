import { IsBoolean, IsString, Length, Matches } from 'class-validator';

export class FilterTypeItemDto {
  @IsString() @Length(1, 120) name: string;
  @IsString() @Length(1, 80) tag: string;
  @IsString() @Length(1, 400) description: string;
  @IsString() @Length(1, 120) format: string;
  @IsString() @Length(1, 120) pack: string;
  @IsString() @Matches(/^#[0-9A-Fa-f]{6}$/) color: string;
}

export class BenefitCardDto {
  @IsString() @Length(1, 10) icon: string;
  @IsString() @Length(1, 80) title: string;
  @IsString() @Length(1, 300) body: string;
  @IsString() @Length(1, 80) linkLabel: string;
  @IsString() @Length(1, 300) linkHref: string;
}

export class StatItemDto {
  @IsString() @Length(1, 10) value: string;
  @IsString() @Length(1, 80) label: string;
}

export class PlanCardDto {
  @IsString() @Length(1, 40) eyebrow: string;
  @IsString() @Length(1, 40) title: string;
  @IsString() @Length(1, 80) subtitle: string;
  @IsString({ each: true }) @Length(1, 160, { each: true }) bullets: string[];
  @IsString() @Length(1, 80) ctaLabel: string;
  @IsString() @Length(1, 300) ctaHref: string;
  @IsBoolean() featured: boolean;
}
