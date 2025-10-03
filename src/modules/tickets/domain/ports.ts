export type UUID = string;

export type TicketStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_confirmation'
  | 'resolved'
  | 'closed'
  | 'cancelled';

export type TicketPriority = 'P1' | 'P2' | 'P3';
export interface ContractSnapshotCategory {
  categoryId: UUID;
  included: boolean;
  sla: Record<TicketPriority, { ackMinutes: number; resolveHours: number }>;
}

export interface ContractSnapshot {
  contractVersionId: UUID;
  contractId: UUID;
  version: number;
  siteId: UUID;
  coverage: Record<string, unknown>;
  escalation?: Record<string, unknown> | null;
  approvals?: Record<string, unknown> | null;
  categories: ContractSnapshotCategory[];
}
export interface TicketEntity {
  id: UUID;
  number: string;
  companyId: UUID;
  siteId: UUID;
  buildingId?: UUID | null;
  locationId?: UUID | null;
  assetId?: UUID | null;
  categoryId: UUID;
  reporterId: UUID;
  assigneeTeamId?: UUID | null;
  status: TicketStatus;
  priority: TicketPriority;
  title: string;
  description?: string | null;
  createdAt: Date;
  ackAt?: Date | null;
  resolvedAt?: Date | null;
  validatedAt?: Date | null;
  closedAt?: Date | null;
  ackDueAt?: Date | null;
  resolveDueAt?: Date | null;
  contractId?: UUID | null;
  contractVersion?: number | null;
  contractSnapshot: ContractSnapshot;
}

export type TicketEventType =
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'COMMENTED'
  | 'ATTACHMENT_ADDED'
  | 'ATTACHMENT_DELETED'
  | 'LINKED'
  | 'UNLINKED'
  | 'SLA_BREACH'
  | 'ESCALATED'
  | 'REOPENED';

export interface TicketEventEntity {
  id: UUID;
  ticketId: UUID;
  type: TicketEventType;
  actorUserId: UUID;
  payload?: unknown;
  createdAt: Date;
}

export type TicketLinkType = 'duplicate' | 'related' | 'parent' | 'child';
export interface TicketLinkEntity {
  id: UUID; // synthetic id from parent/child
  sourceTicketId: UUID;
  targetTicketId: UUID;
  type: TicketLinkType;
  createdAt: Date;
}

export interface TicketCommentEntity {
  id: UUID;
  ticketId: UUID;
  authorUserId: UUID;
  body: string;
  createdAt: Date;
}

export interface Pagination {
  page?: number;
  pageSize?: number;
}

export interface TicketListQuery {
  companyId?: UUID;
  siteIds?: UUID[];
  buildingIds?: UUID[];
  teamIds?: UUID[];
  reporterId?: UUID;
  status?: TicketStatus[];
  priority?: TicketPriority[];
  categoryIds?: UUID[];
  text?: string;
  createdFrom?: Date;
  createdTo?: Date;
  sortBy?: 'createdAt' | 'priority' | 'resolveDueAt' | 'ackDueAt';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface TicketRepository {
  create(
    t: Omit<
      TicketEntity,
      | 'id'
      | 'number'
      | 'createdAt'
      | 'ackAt'
      | 'resolvedAt'
      | 'validatedAt'
      | 'closedAt'
      | 'ackDueAt'
      | 'resolveDueAt'
    > & { ackDueAt?: Date | null; resolveDueAt?: Date | null },
  ): Promise<TicketEntity>;
  update(
    id: UUID,
    patch: Partial<
      Omit<TicketEntity, 'id' | 'companyId' | 'siteId' | 'contractSnapshot'>
    >,
  ): Promise<TicketEntity>;
  findById(id: UUID): Promise<TicketEntity | null>;
  list(q: TicketListQuery): Promise<{ rows: TicketEntity[]; total: number }>;
  setAssignee(id: UUID, teamId: UUID | null): Promise<void>;
  setStatus(id: UUID, status: TicketStatus): Promise<void>;
  setSlaTargets(
    id: UUID,
    ackDueAt: Date | null,
    resolveDueAt: Date | null,
  ): Promise<void>;
  setMilestones(
    id: UUID,
    m: {
      ackAt?: Date | null;
      resolvedAt?: Date | null;
      validatedAt?: Date | null;
      closedAt?: Date | null;
    },
  ): Promise<void>;
}

export interface TicketEventRepository {
  append(
    e: Omit<TicketEventEntity, 'id' | 'createdAt'>,
  ): Promise<TicketEventEntity>;
  list(ticketId: UUID, p?: Pagination): Promise<TicketEventEntity[]>;
}

export interface TicketCommentRepository {
  create(
    c: Omit<TicketCommentEntity, 'id' | 'createdAt'>,
  ): Promise<TicketCommentEntity>;
  list(ticketId: UUID, p?: Pagination): Promise<TicketCommentEntity[]>;
}

export interface TicketLinkRepository {
  create(l: {
    sourceTicketId: UUID;
    targetTicketId: UUID;
    type: TicketLinkType;
  }): Promise<TicketLinkEntity>;
  delete(id: UUID): Promise<void>;
  list(ticketId: UUID): Promise<TicketLinkEntity[]>;
}

export interface CatalogQuery {
  getSiteMeta(siteId: UUID): Promise<{ companyId: UUID }>;
}

export interface ContractsQuery {
  isCategoryIncluded(
    contractVersionId: UUID,
    categoryId: UUID,
  ): Promise<boolean>;
  getContractVersionMeta(contractVersionId: UUID): Promise<{
    contractId: UUID;
    siteId: UUID;
    companyId?: UUID | null;
    version: number;
    coverage: Record<string, unknown>;
    escalation?: Record<string, unknown> | null;
    approvals?: Record<string, unknown> | null;
    categories: ContractSnapshotCategory[];
  }>;
  getCategorySla(
    contractVersionId: UUID,
    categoryId: UUID,
  ): Promise<Record<
    TicketPriority,
    { ackMinutes: number; resolveHours: number }
  > | null>;
}

export interface RoutingCommand {
  evaluate(ctx: {
    contractVersionId: UUID;
    categoryId: UUID;
    buildingId?: UUID | null;
    timeWindow: 'business_hours' | 'after_hours';
  }): Promise<{
    teamId: UUID | null;
    decision: 'auto' | 'fallback' | 'manual-required';
    rationale?: string;
  }>;
}

export interface DirectoryQuery {
  getUserMeta(userId: UUID): Promise<{
    companyId: UUID;
    role: 'occupant' | 'maintainer' | 'manager' | 'approver' | 'admin';
    active: boolean;
  }>;
  isUserInTeam(userId: UUID, teamId: UUID): Promise<boolean>;
}

export interface AdminScopeGuard {
  canAccessCompany(actorUserId: UUID, companyId: UUID): Promise<boolean>;
  canAccessSite(actorUserId: UUID, siteId: UUID): Promise<boolean>;
  canAccessBuilding(actorUserId: UUID, buildingId: UUID): Promise<boolean>;
}

export const TOKENS = {
  TicketRepository: 'Tickets.TicketRepository',
  TicketEventRepository: 'Tickets.TicketEventRepository',
  TicketCommentRepository: 'Tickets.TicketCommentRepository',
  TicketLinkRepository: 'Tickets.TicketLinkRepository',
  CatalogQuery: 'Tickets.CatalogQuery',
  ContractsQuery: 'Tickets.ContractsQuery',
  RoutingCommand: 'Tickets.RoutingCommand',
  DirectoryQuery: 'Tickets.DirectoryQuery',
  AdminScopeGuard: 'Tickets.AdminScopeGuard',
} as const;
