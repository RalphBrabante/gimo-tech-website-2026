import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { MenuLinkType, MenuLocation } from '../entities/menu-item.entity';

export class CreateMenuItemDto {
  @IsIn(['header', 'footer_products', 'footer_services', 'footer_purchasing'])
  location: MenuLocation;

  @IsString()
  @Length(1, 120)
  label: string;

  @IsIn(['page', 'url', 'anchor'])
  linkType: MenuLinkType;

  @ValidateIf((item: CreateMenuItemDto) => item.linkType === 'page')
  @Type(() => Number)
  @IsInt()
  pageId?: number;

  @ValidateIf((item: CreateMenuItemDto) => item.linkType !== 'page')
  @IsString()
  @Length(1, 2048)
  href?: string;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
