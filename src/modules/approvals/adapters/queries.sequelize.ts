import { InjectModel } from '@nestjs/sequelize';
import type { AdminScopeGuard, ContractsQuery, CostQuery, DirectoryQuery, TicketEventCommand, TicketsQuery } from '../domain/ports';
import { Ticket } from '../../tickets/models/ticket.model';
import { TicketEvent } from '../../tickets/models/ticket-event.model';
import { User } from '../../directory/models/user.model';
import { ContractVersion } from '../../contracts/models/contract-version.model';
import { AuthActorService } from '../../auth/auth-actor.service';
import { AdminScopeEvaluatorService } from '../../auth/admin-scope-evaluator.service';

export class SequelizeTicketsQuery implements TicketsQuery {
  constructor(
    @InjectModel(Ticket) private readonly tickets: typeof Ticket,
    @InjectModel(ContractVersion) private readonly versions: typeof ContractVersion,
  ) {}
  async getTicketMeta(ticketId: string) {
    const t = await this.tickets.findByPk(ticketId);
    if (!t) throw new Error('approvals.ticket.not_found');
    // Resolve contractVersionId from contractId + version fields
    const contractId: string | undefined = (t as any).contractId ?? undefined;
    const version: number | undefined = (t as any).contractVersion ?? undefined;
    if (!contractId || typeof version !== 'number') throw new Error('approvals.contract_version.missing');
    const cv = await this.versions.findOne({ where: { contractId, version } as any, attributes: ['id'] });
    if (!cv) throw new Error('approvals.contract_version.not_found');
    return {
      companyId: t.companyId,
      siteId: t.siteId,
      buildingId: (t as any).buildingId ?? null,
      categoryId: t.categoryId,
      priority: t.priority as any,
      status: t.status,
      createdAt: t.createdAt,
      contractVersionId: cv.id,
    };
  }
}

export class SequelizeContractsQuery implements ContractsQuery {
  constructor(@InjectModel(ContractVersion) private readonly versions: typeof ContractVersion) {}
  async getApprovalRules(contractVersionId: string): Promise<unknown> {
    const v = await this.versions.findByPk(contractVersionId);
    if (!v) throw new Error('approvals.contract_version.not_found');
    return (v as any).approvals ?? null;
  }
}

export class SequelizeDirectoryQueryForApprovals implements DirectoryQuery {
  constructor(@InjectModel(User) private readonly users: typeof User) {}
  async getUserMeta(userId: string) {
    const u = await this.users.findByPk(userId);
    if (!u) throw new Error('approvals.user.not_found');
    return { companyId: u.companyId, role: u.role as any, active: u.active };
  }
}

export class SequelizeTicketEventCommandForApprovals implements TicketEventCommand {
  constructor(@InjectModel(TicketEvent) private readonly events: typeof TicketEvent) {}
  async appendEvent(p: { ticketId: string; actorUserId: string; type: string; payload?: unknown }): Promise<void> {
    await this.events.create({ ticketId: p.ticketId, actorUserId: p.actorUserId, type: p.type, payload: p.payload as any } as any);
  }
}

// Cost aggregation adapter can be implemented later; provide a conservative stub returning null.
export class NullCostQuery implements CostQuery {
  async estimateForTicket(_ticketId: string): Promise<string | null> { return null; }
}

export class AdminScopeGuardAdapter implements AdminScopeGuard {
  constructor(private readonly actors: AuthActorService, private readonly evaluator: AdminScopeEvaluatorService) {}
  async canAccessCompany(actorUserId: string, companyId: string): Promise<boolean> {
    const actor = await this.actors.loadActor(actorUserId); return this.evaluator.canAccessCompany(actor, companyId);
  }
  async canAccessSite(actorUserId: string, siteId: string): Promise<boolean> {
    const actor = await this.actors.loadActor(actorUserId); return this.evaluator.canAccessSite(actor, siteId);
  }
  async canAccessBuilding(actorUserId: string, buildingId: string): Promise<boolean> {
    const actor = await this.actors.loadActor(actorUserId); return this.evaluator.canAccessBuilding(actor, buildingId);
  }
}

