import type { AdminScopeType } from '../directory/models/admin-scope.model';
import type { User } from '../directory/models/user.model';

export type UserRole = User['role'];

export interface AdminScopePayload {
  scope: AdminScopeType;
  companyId?: string;
  siteId?: string;
  buildingId?: string;
}

export interface AuthenticatedActor {
  id: string;
  email: string;
  role: UserRole;
  companyId: string;
  siteId?: string | null;
  scopes: AdminScopePayload[];
  scopeStrings: string[];
  companyScopeIds: string[];
  siteScopeIds: string[];
  buildingScopeIds: string[];
}
