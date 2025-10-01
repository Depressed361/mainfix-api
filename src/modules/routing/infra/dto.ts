import { Expose, Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateRoutingRuleDto {
  @IsUUID()
  contractVersionId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number = 100;

  @IsObject()
  condition!: unknown;

  @IsObject()
  action!: unknown;
}

export class UpdateRoutingRuleDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsObject()
  condition?: unknown;

  @IsOptional()
  @IsObject()
  action?: unknown;
}

export class ListRoutingRulesQueryDto {
  @Expose({ name: 'contractVersionId' })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.length > 0
        ? value
        : undefined
      : undefined,
  )
  @IsUUID()
  contractVersionId!: string;
}

export class SimulationDto {
  @IsUUID()
  companyId!: string;
  @IsUUID()
  siteId!: string;
  @IsUUID()
  contractVersionId!: string;
  @IsUUID()
  categoryId!: string;
  @IsOptional()
  @IsUUID()
  buildingId?: string;
  @IsOptional()
  @IsUUID()
  locationId?: string;
  @IsOptional()
  @IsString()
  assetKind?: string;
  @IsIn(['business', 'after_hours'])
  timeWindow!: 'business' | 'after_hours';
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
  @IsOptional()
  @IsInt()
  priority?: number;
}
