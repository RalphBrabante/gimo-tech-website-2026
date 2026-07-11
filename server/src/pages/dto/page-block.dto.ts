import { IsIn, IsInt, IsString, Length, Max, Min, ValidateIf } from 'class-validator';

export class PageBlockDto {
  @IsIn(['heading', 'paragraph', 'image', 'button'])
  blockType: 'heading' | 'paragraph' | 'image' | 'button';

  @ValidateIf((block: PageBlockDto) => block.blockType === 'heading')
  @IsString()
  @Length(1, 200)
  headingText?: string;

  @ValidateIf((block: PageBlockDto) => block.blockType === 'heading')
  @IsInt()
  @Min(2)
  @Max(3)
  headingLevel?: number;

  @ValidateIf((block: PageBlockDto) => block.blockType === 'paragraph')
  @IsString()
  @Length(1, 4000)
  paragraphText?: string;

  @ValidateIf((block: PageBlockDto) => block.blockType === 'image')
  @IsString()
  @Length(1, 2048)
  imageUrl?: string;

  @ValidateIf((block: PageBlockDto) => block.blockType === 'image')
  @IsString()
  @Length(1, 300)
  imageAlt?: string;

  @ValidateIf((block: PageBlockDto) => block.blockType === 'button')
  @IsString()
  @Length(1, 100)
  buttonLabel?: string;

  @ValidateIf((block: PageBlockDto) => block.blockType === 'button')
  @IsString()
  @Length(1, 2048)
  buttonHref?: string;
}
