import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsString, Length, ValidateNested } from 'class-validator';
import { StatItemDto } from './shared-items.dto';

export class SplitStatsSectionDto {
  @IsString() @Length(1, 80) eyebrow: string;
  @IsString() @Length(1, 200) heading: string;
  @IsString() @Length(1, 500) body: string;
  @ValidateNested({ each: true })
  @Type(() => StatItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  stats: StatItemDto[];
  @IsString() @Length(1, 80) ctaLabel: string;
  @IsString() @Length(1, 300) ctaHref: string;
}
