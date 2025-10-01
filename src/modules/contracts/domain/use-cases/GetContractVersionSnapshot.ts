import type { UUID, SlaByPriority } from '../types';
import type { ContractVersionRepository, ContractCategoryRepository } from '../ports';

export class GetContractVersionSnapshot {
  constructor(private readonly versions: ContractVersionRepository, private readonly cats: ContractCategoryRepository) {}
  async execute(contractVersionId: UUID, categoryId: UUID): Promise<{ version: number; contractId: UUID; categorySla: SlaByPriority | null }> {
    const v = await this.versions.findById(contractVersionId);
    if (!v) throw new Error('contracts.version.not_found');
    const cat = await this.cats.find(contractVersionId, categoryId);
    return { version: v.version, contractId: v.contractId, categorySla: cat?.sla ?? null };
  }
}

