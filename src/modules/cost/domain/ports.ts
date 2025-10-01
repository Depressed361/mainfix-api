export type UUID = string;

export interface TicketCostEntity {
  id: UUID;
  ticketId: UUID;
  laborHours?: string | null;
  laborRate?: string | null;
  partsCost?: string | null;
  total?: string | null;
  currency: string;
  createdAt: Date;
}

export interface TicketPartEntity {
  id: UUID;
  ticketId: UUID;
  sku?: string | null;
  label?: string | null;
  qty?: string | null;
  unitCost?: string | null;
}

export interface Pagination { page?: number; pageSize?: number }

export interface TicketCostRepository {
  upsertByTicket(p: { ticketId: UUID; laborHours?: string; laborRate?: string; currency?: string }): Promise<TicketCostEntity>;
  setPartsCost(ticketId: UUID, partsCost: string): Promise<void>;
  getByTicket(ticketId: UUID): Promise<TicketCostEntity | null>;
}

export interface TicketPartRepository {
  addOrUpdate(p: { id?: UUID; ticketId: UUID; sku?: string; label?: string; qty?: string; unitCost?: string }): Promise<TicketPartEntity>;
  remove(p: { id: UUID; ticketId: UUID }): Promise<void>;
  listByTicket(ticketId: UUID): Promise<TicketPartEntity[]>;
  sumPartsCost(ticketId: UUID): Promise<string>;
}

export interface TicketsQuery {
  getTicketMeta(ticketId: UUID): Promise<{
    companyId: UUID; siteId: UUID; buildingId?: UUID | null;
    assigneeTeamId?: UUID | null; status: string; priority: 'P1'|'P2'|'P3';
    contractVersionId?: UUID | null;
  }>;
}

export interface TeamsQuery {
  getTeamMeta(teamId: UUID): Promise<{ companyId: UUID; type: 'internal'|'vendor'; active: boolean }>;
}

export interface AdminScopeGuard {
  canAccessCompany(actorUserId: UUID, companyId: UUID): Promise<boolean>;
  canAccessSite(actorUserId: UUID, siteId: UUID): Promise<boolean>;
  canAccessBuilding(actorUserId: UUID, buildingId: UUID): Promise<boolean>;
}

export interface DirectoryQuery {
  userIsInTeam(userId: UUID, teamId: UUID): Promise<boolean>;
  getUserRole(userId: UUID): Promise<'occupant'|'maintainer'|'manager'|'approver'|'admin'>;
}

export interface ApprovalsQuery {
  getApprovalStatusForTicket(ticketId: UUID): Promise<'NONE'|'PENDING'|'APPROVED'|'REJECTED'>;
}

export interface ApprovalsCommand {
  evaluateApprovalNeed(p: { ticketId: UUID; reason?: string; amountEstimate?: string; currency?: string }): Promise<void>;
}

export interface ContractsQuery {
  getApprovalRules(contractVersionId: UUID): Promise<Record<string, unknown> | null>;
}

export interface TicketEventCommand {
  appendEvent(p: { ticketId: UUID; actorUserId: UUID; type: string; payload?: unknown }): Promise<void>;
}

export const TOKENS = {
  TicketCostRepository: 'Cost.TicketCostRepository',
  TicketPartRepository: 'Cost.TicketPartRepository',
  TicketsQuery: 'Cost.TicketsQuery',
  TeamsQuery: 'Cost.TeamsQuery',
  AdminScopeGuard: 'Cost.AdminScopeGuard',
  DirectoryQuery: 'Cost.DirectoryQuery',
  ApprovalsQuery: 'Cost.ApprovalsQuery',
  ApprovalsCommand: 'Cost.ApprovalsCommand',
  ContractsQuery: 'Cost.ContractsQuery',
  TicketEventCommand: 'Cost.TicketEventCommand',
} as const;

