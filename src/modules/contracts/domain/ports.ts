import type { UUID, CoverageJson, EscalationJson, ApprovalsJson, SlaByPriority } from './types';
import type { ContractEntity } from './entities/Contract';
import type { ContractVersionEntity } from './entities/ContractVersion';
import type { ContractCategoryEntity } from './entities/ContractCategory';

export interface Pagination { page?: number; pageSize?: number }

export interface ContractRepository {
  create(p: Omit<ContractEntity, 'id' | 'active'> & { active?: boolean }): Promise<ContractEntity>;
  update(id: UUID, patch: Partial<Omit<ContractEntity, 'id'>>): Promise<ContractEntity>;
  archive(id: UUID): Promise<void>;
  findById(id: UUID): Promise<ContractEntity | null>;
  listBySite(siteId: UUID, p?: Pagination): Promise<ContractEntity[]>;
}

export interface ContractVersionRepository {
  create(p: Omit<ContractVersionEntity, 'id' | 'createdAt'>): Promise<ContractVersionEntity>;
  update(id: UUID, patch: Partial<Omit<ContractVersionEntity, 'id' | 'contractId' | 'version'>>): Promise<ContractVersionEntity>;
  deleteById(id: UUID): Promise<void>;
  findById(id: UUID): Promise<ContractVersionEntity | null>;
  listByContract(contractId: UUID, p?: Pagination): Promise<ContractVersionEntity[]>;
  findByContractAndVersion(contractId: UUID, version: number): Promise<ContractVersionEntity | null>;
  getMaxVersion(contractId: UUID): Promise<number | null>;
}

export interface ContractCategoryRepository {
  upsert(p: Omit<ContractCategoryEntity, 'id'>): Promise<ContractCategoryEntity>;
  remove(contractVersionId: UUID, categoryId: UUID): Promise<void>;
  listByContractVersion(contractVersionId: UUID): Promise<ContractCategoryEntity[]>;
  find(contractVersionId: UUID, categoryId: UUID): Promise<ContractCategoryEntity | null>;
}

export interface ContractQuery {
  getContractVersionMeta(id: UUID): Promise<{ contractId: UUID; siteId: UUID; companyId?: UUID }>;
  isCategoryIncluded(contractVersionId: UUID, categoryId: UUID): Promise<boolean>;
  getCategorySla(contractVersionId: UUID, categoryId: UUID): Promise<SlaByPriority | null>;
  listIncludedCategories(contractVersionId: UUID): Promise<UUID[]>;
}

export const TOKENS = {
  ContractRepository: 'Contracts.ContractRepository',
  ContractVersionRepository: 'Contracts.ContractVersionRepository',
  ContractCategoryRepository: 'Contracts.ContractCategoryRepository',
  ContractQuery: 'ContractQuery',
} as const;
