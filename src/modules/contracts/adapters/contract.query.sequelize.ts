import type { ContractQuery } from '../domain/ports';
import type { UUID, SlaByPriority } from '../domain/types';
import { InjectModel } from '@nestjs/sequelize';
import { ContractVersion } from '../models/contract-version.model';
import { Contract } from '../models/contract.model';
import { ContractCategory } from '../models/contract-category.model';
import { Site } from '../../catalog/models/site.model';
import { NotFoundError } from '../domain/errors';

export class SequelizeContractQuery implements ContractQuery {
  constructor(
    @InjectModel(ContractVersion)
    private readonly versions: typeof ContractVersion,
    @InjectModel(Contract) private readonly contracts: typeof Contract,
    @InjectModel(ContractCategory)
    private readonly categories: typeof ContractCategory,
    @InjectModel(Site) private readonly sites: typeof Site,
  ) {}

  async getContractVersionMeta(id: UUID) {
    const v = await this.versions.findByPk(id);
    if (!v) throw new NotFoundError('contracts.version.not_found');
    const contractId = v.getDataValue('contractId');
    const c = await this.contracts.findByPk(contractId);
    if (!c) throw new NotFoundError('contracts.contract.not_found');
    const siteId = c.getDataValue('siteId');
    const s = await this.sites.findByPk(siteId);
    const companyId = s ? s.getDataValue('companyId') : undefined;
    const categories = await this.categories.findAll({
      where: { contractVersionId: id } as any,
    });
    return {
      contractId,
      siteId,
      companyId: companyId ?? null,
      version: v.getDataValue('version'),
      coverage: (v.getDataValue('coverage') ?? {}) as any,
      escalation: (v.getDataValue('escalation') ?? null) as any,
      approvals: (v.getDataValue('approvals') ?? null) as any,
      categories: categories.map((row) => ({
        categoryId: row.getDataValue('categoryId'),
        included: row.getDataValue('included') === true,
        sla: (row.getDataValue('sla') ?? {}) as any,
      })),
    } as any;
  }

  async isCategoryIncluded(
    contractVersionId: UUID,
    categoryId: UUID,
  ): Promise<boolean> {
    const row = await this.categories.findOne({
      where: { contractVersionId, categoryId } as any,
    });
    if (!row) return false;
    return row.getDataValue('included') === true;
  }
  async getCategorySla(
    contractVersionId: UUID,
    categoryId: UUID,
  ): Promise<SlaByPriority | null> {
    const row = await this.categories.findOne({
      where: { contractVersionId, categoryId } as any,
    });
    return (row?.getDataValue('sla') as any) ?? null;
  }
  async listIncludedCategories(contractVersionId: UUID): Promise<UUID[]> {
    const rows = await this.categories.findAll({
      where: { contractVersionId, included: true } as any,
    });
    return rows.map((r) => r.getDataValue('categoryId'));
  }
}
