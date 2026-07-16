import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsDateString, IsInt, IsOptional, IsString, Length, Max, Min, ValidateNested } from 'class-validator';

class FormalQuotationLineDto {
  @IsString()
  @Length(1, 160)
  name: string;

  @IsString()
  @Length(1, 64)
  sku: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  quantity: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  unitPriceCents: number;
}

export class CreateFormalQuotationDto {
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FormalQuotationLineDto)
  lines: FormalQuotationLineDto[];

  @IsOptional()
  @IsString()
  @Length(1, 4000)
  notes?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
