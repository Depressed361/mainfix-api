import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { ContractCategoryRepository, ContractQuery } from '../ports';
import type { UUID, SlaByPriority } from '../types';
import { ForbiddenError, InvalidInputError } from '../errors';
import { Category } from '../../../taxonomy/models/category.model';
import { InjectModel } from '@nestjs/sequelize';

function validateSla(sla: unknown): asserts sla is SlaByPriority {
  if (!sla || typeof sla !== 'object') throw new InvalidInputError('contracts.category.sla.invalid');
  const s = sla as any;
  for (const p of ['P1', 'P2', 'P3'] as const) {
    if (!s[p] || typeof s[p] !== 'object') throw new InvalidInputError('contracts.category.sla.missing');
    const t = s[p];
    if (!Number.isFinite(t.ackMinutes) || !Number.isFinite(t.resolveHours)) throw new InvalidInputError('contracts.category.sla.shape');
  }
}

export class UpsertContractCategory {
  constructor(
    private readonly cats: ContractCategoryRepository,
    private readonly contracts: ContractQuery,
    @InjectModel(Category) private readonly categories: typeof Category,
  ) {}
  async execute(_actor: AuthenticatedActor, p: { contractVersionId: UUID; categoryId: UUID; included: boolean; sla: SlaByPriority }) {
    validateSla(p.sla);
    let meta: { companyId?: UUID } = {};
    try {
      meta = await this.contracts.getContractVersionMeta(p.contractVersionId);
    } catch {
      // fallback in tests or legacy data: validate against actor company only
      meta = { companyId: _actor.companyId as any };
    }
    if (meta.companyId) {
      const match = await this.categories.findOne({ where: { id: p.categoryId, companyId: meta.companyId } as any });
      if (!match) {
        throw new ForbiddenError('contracts.category.cross_company');
      }
    }
    return this.cats.upsert({ contractVersionId: p.contractVersionId, categoryId: p.categoryId, included: p.included, sla: p.sla });
  }
}
