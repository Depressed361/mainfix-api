export type UUID = string;

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequestEntity {
  id: UUID;
  ticketId: UUID;
  reason?: string | null;
  amountEstimate?: string | null; // DECIMAL(12,2) -> string
  currency: string; // CHAR(3), default 'EUR'
  status: ApprovalStatus;
  createdAt: Date;
}

export interface Pagination {
  page?: number;
  pageSize?: number;
}

export interface ApprovalRequestRepository {
  create(
    p: Omit<
      ApprovalRequestEntity,
      'id' | 'status' | 'createdAt' | 'currency'
    > & { currency?: string },
  ): Promise<ApprovalRequestEntity>;
  setStatus(id: UUID, status: ApprovalStatus): Promise<void>;
  findById(id: UUID): Promise<ApprovalRequestEntity | null>;
  findPendingByTicket(ticketId: UUID): Promise<ApprovalRequestEntity | null>;
  list(q: {
    companyId?: UUID;
    siteIds?: UUID[];
    buildingIds?: UUID[];
    ticketIds?: UUID[];
    status?: ApprovalStatus[];
    from?: Date;
    to?: Date;
    page?: number;
    pageSize?: number;
  }): Promise<{ rows: ApprovalRequestEntity[]; total: number }>;
}

export interface TicketsQuery {
  getTicketMeta(ticketId: UUID): Promise<{
    companyId: UUID;
    siteId: UUID;
    buildingId?: UUID | null;
    categoryId: UUID;
    priority: 'P1' | 'P2' | 'P3';
    status: string;
    createdAt: Date;
    contractVersionId: UUID;
  }>;
}

export interface ContractsQuery {
  // renvoie la structure d'approvals telle que stockée en JSONB
  getApprovalRules(contractVersionId: UUID): Promise<unknown>;
}

export interface CostQuery {
  // total estimé actuel du ticket (string DECIMAL) si disponible
  estimateForTicket(ticketId: UUID): Promise<string | null>;
}

export interface AdminScopeGuard {
  canAccessCompany(actorUserId: UUID, companyId: UUID): Promise<boolean>;
  canAccessSite(actorUserId: UUID, siteId: UUID): Promise<boolean>;
  canAccessBuilding(actorUserId: UUID, buildingId: UUID): Promise<boolean>;
}

export interface DirectoryQuery {
  getUserMeta(userId: UUID): Promise<{
    companyId: UUID;
    role: 'occupant' | 'maintainer' | 'manager' | 'approver' | 'admin';
    active: boolean;
  }>;
}

export interface TicketEventCommand {
  appendEvent(p: {
    ticketId: UUID;
    actorUserId: UUID;
    type: string;
    payload?: unknown;
  }): Promise<void>;
}

export interface TicketCommand {
  // utilisé pour bloquer/débloquer les transitions ; pas de modif DB dans approvals
  blockTransitions(ticketId: UUID, reason: string): Promise<void>;
  unblockTransitions(ticketId: UUID, reason: string): Promise<void>;
}

export const TOKENS = {
  ApprovalRequestRepository: 'Approvals.ApprovalRequestRepository',
  TicketsQuery: 'Approvals.TicketsQuery',
  ContractsQuery: 'Approvals.ContractsQuery',
  CostQuery: 'Approvals.CostQuery',
  AdminScopeGuard: 'Approvals.AdminScopeGuard',
  DirectoryQuery: 'Approvals.DirectoryQuery',
  TicketEventCommand: 'Approvals.TicketEventCommand',
  TicketCommand: 'Approvals.TicketCommand',
} as const;
