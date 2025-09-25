import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLocationDto {
  @IsUUID()
  @IsNotEmpty()
  buildingId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
