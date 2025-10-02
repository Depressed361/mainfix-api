import type { ContractEntity } from '../domain/entities/Contract';
import type { ContractVersionEntity } from '../domain/entities/ContractVersion';
import type { ContractCategoryEntity } from '../domain/entities/ContractCategory';
import { Contract } from '../models/contract.model';
import { ContractVersion } from '../models/contract-version.model';
import { ContractCategory } from '../models/contract-category.model';

export const toDomainContract = (m: Contract): ContractEntity => ({
  id: m.getDataValue('id'),
  siteId: m.getDataValue('siteId'),
  providerCompanyId: m.getDataValue('providerCompanyId') ?? null,
  name: m.getDataValue('name'),
  active: m.getDataValue('active'),
});
export const toDomainVersion = (m: ContractVersion): ContractVersionEntity => ({
  id: m.getDataValue('id'),
  contractId: m.getDataValue('contractId'),
  version: m.getDataValue('version'),
  createdAt: m.getDataValue('createdAt'),
  coverage: m.getDataValue('coverage') as any,
  escalation: m.getDataValue('escalation') as any,
  approvals: m.getDataValue('approvals') as any,
});
export const toDomainCategory = (m: ContractCategory): ContractCategoryEntity => ({
  id: m.getDataValue('id'),
  contractVersionId: m.getDataValue('contractVersionId'),
  categoryId: m.getDataValue('categoryId'),
  included: m.getDataValue('included'),
  sla: m.getDataValue('sla') as any,
});
