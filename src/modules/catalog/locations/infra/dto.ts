import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsUUID()
  buildingId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class ListLocationsQueryDto {
  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}
