export type UUID = string;

export type UserRole = 'occupant' | 'maintainer' | 'manager' | 'approver' | 'admin';
export interface UserEntity {
  id: UUID;
  companyId: UUID;
  siteId?: UUID | null;
  email: string;
  displayName: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
}

export type TeamType = 'internal' | 'vendor';
export interface TeamEntity {
  id: UUID;
  companyId: UUID;
  name: string;
  type: TeamType;
  active: boolean;
}

export interface TeamMemberEntity { teamId: UUID; userId: UUID }

export type AdminScopeType = 'platform' | 'company' | 'site' | 'building';
export interface AdminScopeEntity {
  userId: UUID;
  scope: AdminScopeType;
  companyId?: UUID | null;
  siteId?: UUID | null;
  buildingId?: UUID | null;
  createdAt: Date;
}

export interface Pagination { page?: number; pageSize?: number }

export interface UserRepository {
  create(p: Omit<UserEntity, 'id' | 'createdAt' | 'active'> & { active?: boolean }): Promise<UserEntity>;
  update(id: UUID, patch: Partial<Pick<UserEntity, 'displayName' | 'role' | 'siteId' | 'active'>>): Promise<UserEntity>;
  findById(id: UUID): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  listByCompany(companyId: UUID, q?: { role?: UserRole; active?: boolean; search?: string } & Pagination): Promise<UserEntity[]>;
  deleteById(id: UUID): Promise<void>;
}

export interface TeamRepository {
  create(p: Omit<TeamEntity, 'id' | 'active'> & { active?: boolean }): Promise<TeamEntity>;
  update(id: UUID, patch: Partial<Pick<TeamEntity, 'name' | 'type' | 'active'>>): Promise<TeamEntity>;
  findById(id: UUID): Promise<TeamEntity | null>;
  listByCompany(companyId: UUID, q?: { type?: TeamType; active?: boolean; search?: string } & Pagination): Promise<TeamEntity[]>;
  deleteById(id: UUID): Promise<void>;
}

export interface TeamMemberRepository {
  upsert(m: TeamMemberEntity): Promise<void>;
  delete(teamId: UUID, userId: UUID): Promise<void>;
  listMembers(teamId: UUID, p?: Pagination): Promise<UserEntity[]>;
  listTeamsOfUser(userId: UUID, p?: Pagination): Promise<TeamEntity[]>;
  exists(teamId: UUID, userId: UUID): Promise<boolean>;
}

export interface AdminScopeRepository {
  grant(s: Omit<AdminScopeEntity, 'createdAt'>): Promise<AdminScopeEntity>;
  revoke(s: Omit<AdminScopeEntity, 'createdAt'>): Promise<void>;
  listByUser(userId: UUID): Promise<AdminScopeEntity[]>;
  has(userId: UUID, scope: AdminScopeType, target?: { companyId?: UUID | null; siteId?: UUID | null; buildingId?: UUID | null }): Promise<boolean>;
}

export interface DirectoryQuery {
  getUserMeta(userId: UUID): Promise<{ companyId: UUID; role: UserRole; active: boolean; siteId?: UUID | null }>;
  getTeamMeta(teamId: UUID): Promise<{ companyId: UUID; type: TeamType; active: boolean }>;
  isUserInTeam(userId: UUID, teamId: UUID): Promise<boolean>;
}

export interface AuthCommand { setPasswordHash(userId: UUID, passwordHash: string): Promise<void> }

export interface CompanyBoundaryQuery { ownsSite(companyId: UUID, siteId: UUID): Promise<boolean> }

export const TOKENS = {
  UserRepository: 'Directory.UserRepository',
  TeamRepository: 'Directory.TeamRepository',
  TeamMemberRepository: 'Directory.TeamMemberRepository',
  AdminScopeRepository: 'Directory.AdminScopeRepository',
  DirectoryQuery: 'Directory.DirectoryQuery',
  CompanyBoundaryQuery: 'Directory.CompanyBoundaryQuery',
  AuthCommand: 'Directory.AuthCommand',
} as const;

