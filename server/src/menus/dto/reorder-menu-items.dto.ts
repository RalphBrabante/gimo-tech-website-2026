import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

class MenuItemOrderEntryDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderMenuItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MenuItemOrderEntryDto)
  items: MenuItemOrderEntryDto[];
}
