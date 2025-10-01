import { InjectModel } from '@nestjs/sequelize';
import type { AdminScopeGuard, ApprovalsCommand, ApprovalsQuery, ContractsQuery, DirectoryQuery, TeamsQuery, TicketEventCommand, TicketsQuery } from '../domain/ports';
import { Ticket } from '../../tickets/models/ticket.model';
import { TicketEvent } from '../../tickets/models/ticket-event.model';
import { Team } from '../../directory/models/team.model';
import { TeamMember } from '../../directory/models/team-member.model';
import { User } from '../../directory/models/user.model';
import { ContractVersion } from '../../contracts/models/contract-version.model';
import { AuthActorService } from '../../auth/auth-actor.service';
import { AdminScopeEvaluatorService } from '../../auth/admin-scope-evaluator.service';
import { EvaluateApprovalNeed } from '../../approvals/domain/use-cases/EvaluateApprovalNeed';
import { GetApprovalStatusForTicket } from '../../approvals/domain/use-cases/GetApprovalStatusForTicket';

export class SequelizeTicketsQueryForCost implements TicketsQuery {
  constructor(
    @InjectModel(Ticket) private readonly tickets: typeof Ticket,
    @InjectModel(ContractVersion) private readonly versions: typeof ContractVersion,
  ) {}
  async getTicketMeta(ticketId: string) {
    const t = await this.tickets.findByPk(ticketId);
    if (!t) throw new Error('cost.ticket.not_found');
    const contractId: string | undefined = (t as any).contractId ?? undefined;
    const version: number | undefined = (t as any).contractVersion ?? undefined;
    let contractVersionId: string | null = null;
    if (contractId && typeof version === 'number') {
      const cv = await this.versions.findOne({ where: { contractId, version } as any, attributes: ['id'] });
      contractVersionId = cv?.id ?? null;
    }
    return {
      companyId: t.companyId,
      siteId: t.siteId,
      buildingId: (t as any).buildingId ?? null,
      assigneeTeamId: (t as any).assigneeTeamId ?? null,
      status: t.status,
      priority: t.priority as any,
      contractVersionId,
    };
  }
}

export class SequelizeTeamsQueryForCost implements TeamsQuery {
  constructor(@InjectModel(Team) private readonly teams: typeof Team) {}
  async getTeamMeta(teamId: string) {
    const t = await this.teams.findByPk(teamId);
    if (!t) throw new Error('cost.team.not_found');
    return { companyId: t.companyId, type: t.type as any, active: t.active };
  }
}

export class SequelizeDirectoryQueryForCost implements DirectoryQuery {
  constructor(@InjectModel(User) private readonly users: typeof User, @InjectModel(TeamMember) private readonly members: typeof TeamMember) {}
  async userIsInTeam(userId: string, teamId: string): Promise<boolean> { return !!(await this.members.findOne({ where: { userId, teamId } as any })) }
  async getUserRole(userId: string): Promise<'occupant'|'maintainer'|'manager'|'approver'|'admin'> {
    const u = await this.users.findByPk(userId); if (!u) throw new Error('cost.user.not_found');
    return u.role as any;
  }
}

export class AdminScopeGuardAdapter implements AdminScopeGuard {
  constructor(private readonly actors: AuthActorService, private readonly evaluator: AdminScopeEvaluatorService) {}
  async canAccessCompany(actorUserId: string, companyId: string): Promise<boolean> { const actor = await this.actors.loadActor(actorUserId); return this.evaluator.canAccessCompany(actor, companyId); }
  async canAccessSite(actorUserId: string, siteId: string): Promise<boolean> { const actor = await this.actors.loadActor(actorUserId); return this.evaluator.canAccessSite(actor, siteId); }
  async canAccessBuilding(actorUserId: string, buildingId: string): Promise<boolean> { const actor = await this.actors.loadActor(actorUserId); return this.evaluator.canAccessBuilding(actor, buildingId); }
}

export class SequelizeTicketEventCommandForCost implements TicketEventCommand {
  constructor(@InjectModel(TicketEvent) private readonly events: typeof TicketEvent) {}
  async appendEvent(p: { ticketId: string; actorUserId: string; type: string; payload?: unknown }): Promise<void> { await this.events.create({ ticketId: p.ticketId, actorUserId: p.actorUserId, type: p.type, payload: p.payload as any } as any) }
}

export class SequelizeContractsQueryForCost implements ContractsQuery {
  constructor(@InjectModel(ContractVersion) private readonly versions: typeof ContractVersion) {}
  async getApprovalRules(contractVersionId: string): Promise<Record<string, unknown> | null> {
    const v = await this.versions.findByPk(contractVersionId); if (!v) return null; return (v as any).approvals ?? null;
  }
}

export class ApprovalsQueryAdapter implements ApprovalsQuery {
  constructor(private readonly status: GetApprovalStatusForTicket) {}
  async getApprovalStatusForTicket(ticketId: string): Promise<'NONE'|'PENDING'|'APPROVED'|'REJECTED'> {
    const s = await this.status.execute(ticketId);
    // Map: if we get APPROVED but there were never requests, upstream returns APPROVED; treat that as APPROVED
    return s as any;
  }
}

export class ApprovalsCommandAdapter implements ApprovalsCommand {
  constructor(private readonly evalNeed: EvaluateApprovalNeed) {}
  async evaluateApprovalNeed(p: { ticketId: string; reason?: string | undefined; amountEstimate?: string | undefined; currency?: string | undefined; }): Promise<void> {
    await this.evalNeed.execute('system', { ticketId: p.ticketId, reason: p.reason });
  }
}

