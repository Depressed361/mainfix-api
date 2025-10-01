import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { ContractVersionRepository } from '../ports';
import type { CoverageJson, EscalationJson, ApprovalsJson, UUID } from '../types';
import { InvalidInputError } from '../errors';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export class UpdateContractVersion {
  constructor(private readonly versions: ContractVersionRepository) {}
  async execute(
    _actor: AuthenticatedActor,
    id: UUID,
    patch: { coverage?: CoverageJson; escalation?: EscalationJson; approvals?: ApprovalsJson },
  ) {
    if (patch.coverage !== undefined && !isObject(patch.coverage)) throw new InvalidInputError('contracts.coverage.invalid');
    if (patch.escalation !== undefined && !isObject(patch.escalation)) throw new InvalidInputError('contracts.escalation.invalid');
    if (patch.approvals !== undefined && !isObject(patch.approvals)) throw new InvalidInputError('contracts.approvals.invalid');
    return this.versions.update(id, patch);
  }
}

