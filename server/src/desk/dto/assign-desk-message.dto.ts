import { IsInt, IsOptional, Min } from 'class-validator';

export class AssignDeskMessageDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  clientId?: number | null;
}
