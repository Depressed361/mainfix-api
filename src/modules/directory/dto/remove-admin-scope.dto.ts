import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import type { AdminScopeType } from '../models/admin-scope.model';

export class RemoveAdminScopeDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(['platform', 'company', 'site', 'building'])
  scope!: AdminScopeType;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsUUID()
  buildingId?: string;
}
