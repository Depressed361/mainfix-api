export type UUID = string;

export interface TeamZoneRecord {
  teamId: UUID;
  buildingId: UUID;
}

export interface TeamSkillRecord {
  teamId: UUID;
  skillId: UUID;
}

export type CompetencyLevel = 'primary' | 'backup';
export type TimeWindow = 'business_hours' | 'after_hours' | 'any';

export interface CompetencyRecord {
  id: UUID;
  contractVersionId: UUID;
  teamId: UUID;
  categoryId: UUID;
  buildingId: UUID | null;
  level: CompetencyLevel;
  window: TimeWindow;
}

export interface Pagination { page?: number; pageSize?: number }

export interface TeamZoneRepository {
  upsert(rec: TeamZoneRecord): Promise<void>;
  delete(teamId: UUID, buildingId: UUID): Promise<void>;
  listByTeam(teamId: UUID, p?: Pagination): Promise<TeamZoneRecord[]>;
  listByBuilding(buildingId: UUID, p?: Pagination): Promise<TeamZoneRecord[]>;
  exists(teamId: UUID, buildingId: UUID): Promise<boolean>;
}

export interface TeamSkillRepository {
  upsert(rec: TeamSkillRecord): Promise<void>;
  delete(teamId: UUID, skillId: UUID): Promise<void>;
  listByTeam(teamId: UUID, p?: Pagination): Promise<TeamSkillRecord[]>;
  listTeamsBySkill(skillId: UUID, p?: Pagination): Promise<UUID[]>;
  hasSkill(teamId: UUID, skillId: UUID): Promise<boolean>;
}

export interface CompetencyMatrixRepository {
  upsert(rec: Omit<CompetencyRecord, 'id'>): Promise<CompetencyRecord>;
  deleteByUniqueKey(k: {
    contractVersionId: UUID; teamId: UUID; categoryId: UUID;
    buildingId: UUID | null; window: TimeWindow;
  }): Promise<void>;
  listByContractVersion(contractVersionId: UUID, p?: Pagination): Promise<CompetencyRecord[]>;
  listByTeam(contractVersionId: UUID, teamId: UUID): Promise<CompetencyRecord[]>;
  listByCategory(contractVersionId: UUID, categoryId: UUID): Promise<CompetencyRecord[]>;
  find(k: {
    contractVersionId: UUID; teamId: UUID; categoryId: UUID;
    buildingId: UUID | null; window: TimeWindow;
  }): Promise<CompetencyRecord | null>;
}

export interface TaxonomyQuery {
  requiredSkillsForCategory(categoryId: UUID): Promise<UUID[]>;
}

export interface ContractQuery {
  getContractVersionMeta(id: UUID): Promise<{ contractId: UUID; siteId: UUID; companyId: UUID }>;
}

export interface CatalogQuery {
  getBuildingMeta(id: UUID): Promise<{ siteId: UUID; companyId: UUID }>;
}

export interface TeamQuery {
  getTeamMeta(id: UUID): Promise<{ companyId: UUID; active: boolean }>;
}

export interface CompetencyQueryPort {
  eligibleTeams(ctx: {
    contractVersionId: UUID;
    categoryId: UUID;
    buildingId?: UUID | null;
    timeWindow: Exclude<TimeWindow, 'any'>;
    preferLevel?: CompetencyLevel | 'any';
  }): Promise<UUID[]>;
}

export const TOKENS = {
  TeamZoneRepository: 'Competency.TeamZoneRepository',
  TeamSkillRepository: 'Competency.TeamSkillRepository',
  CompetencyMatrixRepository: 'Competency.CompetencyMatrixRepository',
  TaxonomyQuery: 'Competency.TaxonomyQuery',
  ContractQuery: 'Competency.ContractQuery',
  CatalogQuery: 'Competency.CatalogQuery',
  TeamQuery: 'Competency.TeamQuery',
  CompetencyQueryPort: 'Competency.CompetencyQueryPort',
} as const;

