import { SetMetadata } from '@nestjs/common';

export type AdminScopeType = 'platform' | 'company' | 'site' | 'building';

export interface AdminScopeRequirement {
  type: AdminScopeType;
  /**
   * Route parameter / query / body field carrying the resource identifier.
   * Optional for scope types that do not target a specific resource (e.g. platform).
   */
  param?: string;
  optional?: boolean;
}

export const ADMIN_SCOPE_KEY = 'admin_scope_requirements';

export function AdminScope(...requirements: AdminScopeRequirement[]) {
  return SetMetadata(ADMIN_SCOPE_KEY, requirements);
}
