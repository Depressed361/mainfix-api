import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsUUID()
  siteId!: string;

  @IsString()
  @MaxLength(50)
  code!: string;
}

export class UpdateBuildingDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;
}

export class ListBuildingsQueryDto {
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
