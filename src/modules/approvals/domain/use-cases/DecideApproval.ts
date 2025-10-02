import type {
  AdminScopeGuard,
  ApprovalRequestRepository,
  ContractsQuery,
  DirectoryQuery,
  TicketCommand,
  TicketEventCommand,
  UUID,
} from '../ports';
import { AlreadyDecidedError, ForbiddenError, NotFoundError } from '../errors';
import { shouldKeepBlockedOnReject } from '../policies';

export class DecideApproval {
  constructor(
    private readonly approvals: ApprovalRequestRepository,
    private readonly tickets: {
      getTicketMeta(ticketId: UUID): Promise<{
        companyId: UUID;
        siteId: UUID;
        buildingId?: UUID | null;
        contractVersionId: UUID;
      }>;
    },
    private readonly dirs: DirectoryQuery,
    private readonly guard: AdminScopeGuard,
    private readonly contracts: ContractsQuery,
    private readonly events: TicketEventCommand,
    private readonly commands: TicketCommand,
  ) {}

  async execute(
    actorUserId: UUID,
    p: {
      approvalRequestId: UUID;
      decision: 'APPROVED' | 'REJECTED';
      note?: string;
    },
  ) {
    const req = await this.approvals.findById(p.approvalRequestId);
    if (!req) throw new NotFoundError('approvals.request.not_found');
    if (req.status !== 'PENDING') throw new AlreadyDecidedError();

    const meta = await this.tickets.getTicketMeta(req.ticketId);
    const actor = await this.dirs.getUserMeta(actorUserId);
    const allowedRoles = new Set(['manager', 'approver', 'admin']);
    if (!allowedRoles.has(actor.role))
      throw new ForbiddenError('approvals.decision.role_forbidden');
    // Check admin scopes
    const companyOk = await this.guard.canAccessCompany(
      actorUserId,
      meta.companyId,
    );
    const siteOk = await this.guard.canAccessSite(actorUserId, meta.siteId);
    const buildingOk = meta.buildingId
      ? await this.guard.canAccessBuilding(actorUserId, meta.buildingId)
      : false;
    if (!companyOk && !siteOk && !buildingOk)
      throw new ForbiddenError('approvals.decision.scope_forbidden');

    await this.approvals.setStatus(req.id, p.decision);
    const type =
      p.decision === 'APPROVED' ? 'APPROVAL_APPROVED' : 'APPROVAL_REJECTED';
    await this.events.appendEvent({
      ticketId: req.ticketId,
      actorUserId,
      type,
      payload: {
        approvalRequestId: req.id,
        amountEstimate: req.amountEstimate,
        currency: req.currency,
        reason: req.reason,
        decisionNote: p.note ?? null,
      },
    });

    if (p.decision === 'APPROVED') {
      await this.commands.unblockTransitions(req.ticketId, 'approval_approved');
    } else {
      const rules = await this.contracts.getApprovalRules(
        meta.contractVersionId,
      );
      if (shouldKeepBlockedOnReject(rules)) {
        await this.commands.blockTransitions(req.ticketId, 'approval_rejected');
      }
    }
  }
}
