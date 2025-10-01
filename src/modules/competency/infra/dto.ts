import { IsArray, IsIn, IsOptional, IsUUID } from 'class-validator';

export class UpsertTeamZoneDto {
  @IsUUID() teamId!: string;
  @IsUUID() buildingId!: string;
  @IsUUID() contractVersionId!: string;
}

export class UpsertTeamSkillDto {
  @IsUUID() teamId!: string;
  @IsUUID() skillId!: string;
  @IsUUID() contractVersionId!: string;
}

export class UpsertCompetencyDto {
  @IsUUID() contractVersionId!: string;
  @IsUUID() teamId!: string;
  @IsUUID() categoryId!: string;
  @IsOptional() @IsUUID() buildingId?: string;
  @IsIn(['primary', 'backup']) level!: 'primary' | 'backup';
  @IsIn(['business_hours', 'after_hours', 'any']) window!: 'business_hours' | 'after_hours' | 'any';
}

export class DeleteCompetencyDto {
  @IsUUID() contractVersionId!: string;
  @IsUUID() teamId!: string;
  @IsUUID() categoryId!: string;
  @IsOptional() @IsUUID() buildingId?: string;
  @IsIn(['business_hours', 'after_hours', 'any']) window!: 'business_hours' | 'after_hours' | 'any';
}

export class EligibilityQueryDto {
  @IsUUID() contractVersionId!: string;
  @IsUUID() categoryId!: string;
  @IsOptional() @IsUUID() buildingId?: string;
  @IsIn(['business_hours', 'after_hours']) timeWindow!: 'business_hours' | 'after_hours';
  @IsOptional() @IsIn(['primary', 'backup', 'any']) preferLevel?: 'primary' | 'backup' | 'any' = 'primary';
}

