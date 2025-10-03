import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { ContractVersionRepository } from '../ports';
import { ConflictError, InvalidInputError } from '../errors';
import type {
  CoverageJson,
  EscalationJson,
  ApprovalsJson,
  UUID,
} from '../types';
import { Ticket } from '../../../tickets/models/ticket.model';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export class UpdateContractVersion {
  constructor(
    private readonly versions: ContractVersionRepository,
    private readonly tickets: typeof Ticket,
  ) {}
  async execute(
    _actor: AuthenticatedActor,
    id: UUID,
    patch: {
      coverage?: CoverageJson;
      escalation?: EscalationJson;
      approvals?: ApprovalsJson;
    },
  ) {
    if (patch.coverage !== undefined && !isObject(patch.coverage))
      throw new InvalidInputError('contracts.coverage.invalid');
    if (patch.escalation !== undefined && !isObject(patch.escalation))
      throw new InvalidInputError('contracts.escalation.invalid');
    if (patch.approvals !== undefined && !isObject(patch.approvals))
      throw new InvalidInputError('contracts.approvals.invalid');
    const current = await this.versions.findById(id);
    if (!current) throw new InvalidInputError('contracts.version.not_found');
    // Immutability: if any ticket references this version, forbid updates
    const usageCount = await this.tickets.count({
      where: {
        contractId: current.contractId,
        contractVersion: current.version,
      } as any,
    });
    const isReferenced = usageCount > 0;
    if (
      isReferenced &&
      (patch.coverage !== undefined ||
        patch.escalation !== undefined ||
        patch.approvals !== undefined)
    ) {
      throw new ConflictError('contracts.version.immutable');
    }
    return this.versions.update(id, patch);
  }
}
