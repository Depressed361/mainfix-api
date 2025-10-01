export type UUID = string;

export interface CompanyEntity {
  id: UUID;
  name: string;
  createdAt: Date;
  active: boolean;
}

export interface Pagination { page?: number; pageSize?: number }

export interface CompanyRepository {
  create(p: { name: string }): Promise<CompanyEntity>;
  update(id: UUID, patch: { name?: string }): Promise<CompanyEntity>;
  archive(id: UUID): Promise<void>;
  deleteById(id: UUID): Promise<void>;
  findById(id: UUID): Promise<CompanyEntity | null>;
  list(q?: { search?: string } & Pagination): Promise<CompanyEntity[]>;
  hasSites(id: UUID): Promise<boolean>;
  hasUsers(id: UUID): Promise<boolean>;
  hasTeams(id: UUID): Promise<boolean>;
  hasContracts(id: UUID): Promise<boolean>;
  hasTickets(id: UUID): Promise<boolean>;
}

export interface CompanyQuery {
  getBoundary(id: UUID): Promise<{ companyId: UUID; sites: UUID[]; teams: UUID[]; users: UUID[] }>;
  ownsSite(companyId: UUID, siteId: UUID): Promise<boolean>;
  ownsTeam(companyId: UUID, teamId: UUID): Promise<boolean>;
  ownsUser(companyId: UUID, userId: UUID): Promise<boolean>;
}

export interface DirectoryCommand {
  createVendorTeam(p: { companyId: UUID; name: string; active?: boolean }): Promise<{ teamId: UUID }>;
  addTeamMembers(p: { teamId: UUID; userIds: UUID[] }): Promise<void>;
  setTeamTypeVendor(teamId: UUID): Promise<void>;
}

export interface CatalogQuery {
  getSiteMeta(siteId: UUID): Promise<{ siteId: UUID; companyId: UUID }>;
}

export interface CompetencyCommand {
  grantTeamZone(p: { teamId: UUID; buildingId: UUID }): Promise<void>;
  grantTeamSkill(p: { teamId: UUID; skillId: UUID }): Promise<void>;
}

export const TOKENS = {
  CompanyRepository: 'Companies.CompanyRepository',
  CompanyQuery: 'Companies.CompanyQuery',
  DirectoryCommand: 'Companies.DirectoryCommand',
  CatalogQuery: 'Companies.CatalogQuery',
  CompetencyCommand: 'Companies.CompetencyCommand',
} as const;

