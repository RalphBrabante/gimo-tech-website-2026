import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsString, Length, ValidateNested } from 'class-validator';
import { PlanCardDto } from './shared-items.dto';

export class PlansSectionDto {
  @IsString() @Length(1, 80) eyebrow: string;
  @IsString() @Length(1, 200) heading: string;
  @ValidateNested({ each: true })
  @Type(() => PlanCardDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  cards: PlanCardDto[];
}
