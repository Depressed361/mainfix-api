import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class CreateCompetencyDto {
  @IsUUID()
  contractVersionId!: string;

  @IsUUID()
  teamId!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @IsIn(['primary', 'backup'])
  level!: 'primary' | 'backup';

  @IsIn(['business_hours', 'after_hours', 'any'])
  window!: 'business_hours' | 'after_hours' | 'any';
}
