import { IsIn, IsOptional, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ResolveCompetencyQueryDto {
  @IsOptional()
  @IsUUID()
  contractId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  version!: number;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @IsIn(['business_hours', 'after_hours', 'any'])
  window!: 'business_hours' | 'after_hours' | 'any';
}
