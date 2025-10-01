import type { ContractEntity } from '../domain/entities/Contract';
import type { ContractVersionEntity } from '../domain/entities/ContractVersion';
import type { ContractCategoryEntity } from '../domain/entities/ContractCategory';
import { Contract } from '../models/contract.model';
import { ContractVersion } from '../models/contract-version.model';
import { ContractCategory } from '../models/contract-category.model';

export const toDomainContract = (m: Contract): ContractEntity => ({
  id: m.id, siteId: m.siteId, providerCompanyId: (m as any).providerCompanyId ?? null, name: m.name, active: m.active,
});
export const toDomainVersion = (m: ContractVersion): ContractVersionEntity => ({
  id: m.id, contractId: m.contractId, version: m.version, createdAt: m.createdAt, coverage: m.coverage as any, escalation: m.escalation as any, approvals: m.approvals as any,
});
export const toDomainCategory = (m: ContractCategory): ContractCategoryEntity => ({
  id: m.id, contractVersionId: m.contractVersionId, categoryId: m.categoryId, included: m.included, sla: m.sla as any,
});

