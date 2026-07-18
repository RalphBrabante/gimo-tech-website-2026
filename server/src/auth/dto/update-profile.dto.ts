import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @Length(1, 128)
  currentPassword: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'username may contain letters, numbers, dots, underscores, and hyphens.' })
  username?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(12, 128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: 'newPassword must include uppercase, lowercase, and a number.' })
  newPassword?: string;
}
