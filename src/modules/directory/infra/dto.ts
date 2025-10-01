import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type UserRole = 'occupant' | 'maintainer' | 'manager' | 'approver' | 'admin';
export type TeamType = 'internal' | 'vendor';
export type AdminScopeType = 'platform' | 'company' | 'site' | 'building';

export class CreateUserDto {
  @IsUUID() companyId!: string;
  @IsEmail() email!: string;
  @IsString() displayName!: string;
  @IsIn(['occupant', 'maintainer', 'manager', 'approver', 'admin']) role!: UserRole;
  @IsOptional() @IsUUID() siteId?: string;
}
export class UpdateUserDto {
  @IsOptional() @IsString() displayName?: string;
  @IsOptional() @IsIn(['occupant', 'maintainer', 'manager', 'approver', 'admin']) role?: UserRole;
  @IsOptional() @IsUUID() siteId?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class CreateTeamDto { @IsUUID() companyId!: string; @IsString() name!: string; @IsIn(['internal','vendor']) type!: TeamType }
export class UpdateTeamDto { @IsOptional() @IsString() name?: string; @IsOptional() @IsIn(['internal','vendor']) type?: TeamType; @IsOptional() @IsBoolean() active?: boolean }

export class AddTeamMemberDto { @IsUUID() teamId!: string; @IsUUID() userId!: string }

export class GrantAdminScopeDto {
  @IsUUID() userId!: string;
  @IsIn(['platform','company','site','building']) scope!: AdminScopeType;
  @IsOptional() @IsUUID() companyId?: string;
  @IsOptional() @IsUUID() siteId?: string;
  @IsOptional() @IsUUID() buildingId?: string;
}

