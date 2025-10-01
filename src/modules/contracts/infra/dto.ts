import { IsBoolean, IsInt, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import type { ApprovalsJson, CoverageJson, EscalationJson, SlaByPriority } from '../domain/types';

export class CreateContractDto {
  @IsUUID() siteId!: string;
  @IsOptional() @IsUUID() providerCompanyId?: string | null;
  @IsString() name!: string;
}

export class UpdateContractDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsUUID() providerCompanyId?: string | null;
}

export class CreateContractVersionDto {
  @IsUUID() contractId!: string;
  @IsInt() @Min(1) version!: number;
  @IsObject() coverage!: CoverageJson;
  @IsOptional() @IsObject() escalation?: EscalationJson;
  @IsOptional() @IsObject() approvals?: ApprovalsJson;
}

export class UpdateContractVersionDto {
  @IsOptional() @IsObject() coverage?: CoverageJson;
  @IsOptional() @IsObject() escalation?: EscalationJson;
  @IsOptional() @IsObject() approvals?: ApprovalsJson;
}

export class UpsertContractCategoryDto {
  @IsUUID() contractVersionId!: string;
  @IsUUID() categoryId!: string;
  @IsBoolean() included!: boolean;
  @IsObject() sla!: SlaByPriority;
}

