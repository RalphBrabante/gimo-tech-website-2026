import { IsString, Length } from 'class-validator';

export class RequestPasswordResetDto {
  @IsString()
  @Length(1, 254)
  identifier: string;
}
