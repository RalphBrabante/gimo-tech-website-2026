import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsString, Length, ValidateNested } from 'class-validator';
import { BenefitCardDto } from './shared-items.dto';

export class BenefitsSectionDto {
  @IsString() @Length(1, 80) eyebrow: string;
  @IsString() @Length(1, 200) heading: string;
  @IsString() @Length(1, 500) body: string;
  @IsString({ each: true }) @Length(1, 160, { each: true }) bullets: string[];
  @IsString() @Length(1, 80) ctaLabel: string;
  @IsString() @Length(1, 300) ctaHref: string;
  @ValidateNested({ each: true })
  @Type(() => BenefitCardDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  cards: BenefitCardDto[];
}
