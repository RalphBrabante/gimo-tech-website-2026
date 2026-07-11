import { IsString, Length, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(1, 80)
  username: string;

  @IsString()
  @Length(1, 128)
  password: string;
}
