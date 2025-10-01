import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { ContractCategoryRepository } from '../ports';
import type { UUID, SlaByPriority } from '../types';
import { InvalidInputError } from '../errors';

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
  constructor(private readonly cats: ContractCategoryRepository) {}
  async execute(_actor: AuthenticatedActor, p: { contractVersionId: UUID; categoryId: UUID; included: boolean; sla: SlaByPriority }) {
    validateSla(p.sla);
    return this.cats.upsert({ contractVersionId: p.contractVersionId, categoryId: p.categoryId, included: p.included, sla: p.sla });
  }
}

