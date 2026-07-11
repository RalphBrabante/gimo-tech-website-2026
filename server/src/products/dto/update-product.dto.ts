import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(1, 160)
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @Matches(/^[A-Z0-9][A-Z0-9._-]{0,63}$/)
  sku?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  category?: string;

  @IsOptional()
  @IsString()
  @Length(1, 4000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents?: number;

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

  @IsOptional()
  @Transform(({ value }) => {
    const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
    return raw
      .map((entry: string) => Number(String(entry).trim()))
      .filter((id: number) => Number.isInteger(id) && id > 0);
  })
  @IsArray()
  @IsInt({ each: true })
  removeImageIds?: number[];
}
