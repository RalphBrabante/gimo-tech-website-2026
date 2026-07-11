import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsString, Length, ValidateNested } from 'class-validator';
import { FilterTypeItemDto } from './shared-items.dto';

export class FilterTypesSectionDto {
  @IsString() @Length(1, 80) eyebrow: string;
  @IsString() @Length(1, 200) heading: string;
  @ValidateNested({ each: true })
  @Type(() => FilterTypeItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  items: FilterTypeItemDto[];
}
