import { Transform, Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Length, Matches, Min, ValidateIf } from 'class-validator';

export class UpdateAppSettingsDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @Matches(/^[A-Z]{3}$/)
  currencyCode?: string;

  @IsOptional()
  @IsString()
  @Length(1, 160)
  storeName?: string;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsEmail()
  @Length(1, 254)
  supportEmail?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  freeShippingThresholdCents?: number | null;
}
