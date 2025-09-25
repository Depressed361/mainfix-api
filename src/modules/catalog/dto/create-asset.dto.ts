import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAssetDto {
  @IsUUID()
  @IsNotEmpty()
  companyId!: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  kind?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
