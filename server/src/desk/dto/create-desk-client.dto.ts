import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class CreateDeskClientDto {
  @IsString()
  @Length(2, 160)
  name: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  emailAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(253)
  @Matches(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i, { message: 'emailDomain must be a valid domain.' })
  emailDomain?: string;
}
