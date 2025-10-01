import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { ContractVersionRepository } from '../ports';
import type { CoverageJson, EscalationJson, ApprovalsJson, UUID } from '../types';
import { ConflictError, InvalidInputError } from '../errors';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export class CreateContractVersion {
  constructor(private readonly versions: ContractVersionRepository) {}
  async execute(
    _actor: AuthenticatedActor,
    p: { contractId: UUID; version: number; coverage: CoverageJson; escalation?: EscalationJson; approvals?: ApprovalsJson },
  ) {
    if (!isObject(p.coverage)) throw new InvalidInputError('contracts.coverage.invalid');
    if (p.escalation !== undefined && !isObject(p.escalation)) throw new InvalidInputError('contracts.escalation.invalid');
    if (p.approvals !== undefined && !isObject(p.approvals)) throw new InvalidInputError('contracts.approvals.invalid');
    const max = (await this.versions.getMaxVersion(p.contractId)) ?? 0;
    if (p.version !== max + 1) throw new ConflictError('contracts.version.order');
    return this.versions.create({ contractId: p.contractId, version: p.version, coverage: p.coverage, escalation: p.escalation, approvals: p.approvals });
  }
}

