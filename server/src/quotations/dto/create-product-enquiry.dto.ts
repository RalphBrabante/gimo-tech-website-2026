import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';
import { ENQUIRY_PRODUCTS } from '../enquiry-products';

/** Lead form on dedicated product landing pages (e.g. Google Ads destinations). */
export class CreateProductEnquiryDto {
  @IsIn(Object.keys(ENQUIRY_PRODUCTS))
  product: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity: number;

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
  @Length(1, 160)
  deliveryLocation?: string;

  @IsOptional()
  @IsString()
  @Length(1, 4000)
  notes?: string;

  /** Honeypot: hidden from people; automated form fillers complete it. */
  @IsOptional()
  @IsString()
  @MaxLength(0, { message: 'Invalid submission' })
  website?: string;
}
