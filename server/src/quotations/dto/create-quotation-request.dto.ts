import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsEmail, IsInt, IsOptional, IsString, Length, Max, Min, ValidateNested } from 'class-validator';

class RequestedProductDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  quantity: number;
}

export class CreateQuotationRequestDto {
  @IsString()
  @Length(1, 160)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 160)
  company?: string;

  @IsEmail()
  @Length(3, 254)
  email: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 4000)
  notes?: string;

  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => RequestedProductDto)
  items: RequestedProductDto[];
}
