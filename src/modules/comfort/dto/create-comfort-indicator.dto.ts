import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateComfortIndicatorDto {
  @IsUUID()
  @IsNotEmpty()
  locationId!: string;

  @IsEnum(['temperature', 'noise', 'illuminance', 'air_quality'] as const)
  type!: 'temperature' | 'noise' | 'illuminance' | 'air_quality';

  @Type(() => Number)
  @IsNumber()
  value!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsDateString()
  measuredAt!: string;

  @IsEnum(['iot', 'manual'] as const)
  source!: 'iot' | 'manual';

  @IsOptional()
  @IsString()
  sensorId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
