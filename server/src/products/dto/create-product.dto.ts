import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(1, 160)
  name: string;

  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @Matches(/^[A-Z0-9][A-Z0-9._-]{0,63}$/)
  sku: string;

  @IsString()
  @Length(1, 80)
  category: string;

  @IsString()
  @Length(1, 4000)
  description: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  ratingTenths?: number;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  accent?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isActive?: boolean;
}
