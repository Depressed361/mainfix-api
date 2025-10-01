import type { UserEntity, TeamEntity, TeamMemberEntity, AdminScopeEntity } from '../domain/ports';
import { User } from '../models/user.model';
import { Team } from '../models/team.model';
import { TeamMember } from '../models/team-member.model';
import { AdminScope } from '../models/admin-scope.model';

export const toDomainUser = (u: User): UserEntity => ({
  id: u.id, companyId: u.companyId, siteId: (u as any).siteId ?? null, email: u.email, displayName: u.displayName, role: u.role as any, active: u.active, createdAt: u.createdAt,
});
export const toDomainTeam = (t: Team): TeamEntity => ({ id: t.id, companyId: t.companyId, name: t.name, type: t.type as any, active: t.active });
export const toDomainTeamMember = (m: TeamMember): TeamMemberEntity => ({ teamId: m.teamId, userId: m.userId });
export const toDomainAdminScope = (s: AdminScope): AdminScopeEntity => ({ userId: s.userId, scope: s.scope as any, companyId: (s as any).companyId ?? null, siteId: (s as any).siteId ?? null, buildingId: (s as any).buildingId ?? null, createdAt: s.createdAt });

