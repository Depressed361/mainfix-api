import { InjectModel } from '@nestjs/sequelize';
import type { ContractCategoryRepository } from '../domain/ports';
import type { ContractCategoryEntity } from '../domain/entities/ContractCategory';
import { ContractCategory } from '../models/contract-category.model';
import { toDomainCategory } from './mappers';

export class SequelizeContractCategoryRepository
  implements ContractCategoryRepository
{
  constructor(
    @InjectModel(ContractCategory)
    private readonly model: typeof ContractCategory,
  ) {}

  async upsert(
    p: Omit<ContractCategoryEntity, 'id'>,
  ): Promise<ContractCategoryEntity> {
    const existing = await this.model.findOne({
      where: {
        contractVersionId: p.contractVersionId,
        categoryId: p.categoryId,
      },
    });
    if (existing) {
      existing.included = p.included;
      existing.sla = p.sla as typeof existing.sla;
      await existing.save();
      return toDomainCategory(existing);
    }
    const row = await this.model.create({
      contractVersionId: p.contractVersionId,
      categoryId: p.categoryId,
      included: p.included,
      sla: p.sla,
    } as any);
    return toDomainCategory(row);
  }
  async remove(contractVersionId: string, categoryId: string): Promise<void> {
    await this.model.destroy({
      where: { contractVersionId, categoryId },
    });
  }
  async listByContractVersion(
    contractVersionId: string,
  ): Promise<ContractCategoryEntity[]> {
    const rows = await this.model.findAll({
      where: { contractVersionId },
      order: [['categoryId', 'ASC']],
    });
    return rows.map(toDomainCategory);
  }
  async find(
    contractVersionId: string,
    categoryId: string,
  ): Promise<ContractCategoryEntity | null> {
    const row = await this.model.findOne({
      where: { contractVersionId, categoryId },
    });
    return row ? toDomainCategory(row) : null;
  }
}
