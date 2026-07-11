import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, Length, Matches, ValidateNested } from 'class-validator';
import { PageBlockDto } from './page-block.dto';
import { IsNotReservedSlug } from './not-reserved-slug.decorator';

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  @Length(1, 160)
  @IsNotReservedSlug()
  slug?: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  metaDescription?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional()
  @IsString()
  @Length(1, 2048)
  ogImageUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => PageBlockDto)
  blocks?: PageBlockDto[];
}
