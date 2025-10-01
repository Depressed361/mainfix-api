export type UUID = string;
export type SlaType = 'ack' | 'resolve';
export type TicketPriority = 'P1' | 'P2' | 'P3';
export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'awaiting_confirmation' | 'resolved' | 'closed' | 'cancelled';

export interface SlaTargetEntity {
  id: UUID;
  ticketId: UUID;
  type: SlaType;
  dueAt: Date;
  createdAt: Date;
  paused?: boolean;
  pausedAt?: Date | null;
}

export interface SlaBreachEntity {
  id: UUID;
  ticketId: UUID;
  type: SlaType;
  detectedAt: Date;
  delayMs: number;
  createdAt: Date;
  notified?: boolean;
}

export interface Pagination { page?: number; pageSize?: number }

export interface SlaTargetRepository {
  upsert(target: { ticketId: UUID; type: SlaType; dueAt: Date }): Promise<SlaTargetEntity>;
  findByTicket(ticketId: UUID): Promise<SlaTargetEntity[]>;
  findByTicketAndType(ticketId: UUID, type: SlaType): Promise<SlaTargetEntity | null>;
  updateDueAt(ticketId: UUID, type: SlaType, newDueAt: Date): Promise<void>;
  deleteForTicket(ticketId: UUID): Promise<void>;
  setPaused(ticketId: UUID, type: SlaType, paused: boolean, at?: Date | null): Promise<void>;
}

export interface SlaBreachRepository {
  create(b: { ticketId: UUID; type: SlaType; detectedAt: Date; delayMs: number }): Promise<SlaBreachEntity>;
  list(q: { companyId?: UUID; siteIds?: UUID[]; buildingIds?: UUID[]; teamIds?: UUID[]; types?: SlaType[]; from?: Date; to?: Date; page?: number; pageSize?: number }): Promise<{ rows: SlaBreachEntity[]; total: number }>;
}

export interface ContractsQuery {
  getCategorySla(contractVersionId: UUID, categoryId: UUID): Promise<Record<TicketPriority, { ackMinutes: number; resolveHours: number }> | null>;
}

export interface TicketsQuery {
  getTicketMeta(ticketId: UUID): Promise<{ companyId: UUID; siteId: UUID; buildingId?: UUID | null; categoryId: UUID; priority: TicketPriority; status: TicketStatus; createdAt: Date; ackAt?: Date | null; resolvedAt?: Date | null; contractVersionId: UUID }>;
  listEvents(ticketId: UUID): Promise<Array<{ type: string; createdAt: Date; payload?: unknown }>>;
}

export interface AdminScopeGuard { canAccessCompany(actorUserId: UUID, companyId: UUID): Promise<boolean>; canAccessSite(actorUserId: UUID, siteId: UUID): Promise<boolean>; canAccessBuilding(actorUserId: UUID, buildingId: UUID): Promise<boolean> }
export interface DirectoryQuery { getUserMeta(userId: UUID): Promise<{ companyId: UUID; role: 'occupant' | 'maintainer' | 'manager' | 'approver' | 'admin'; active: boolean }> }

export interface CalendarService { addBusinessDuration(start: Date, durationMinutes: number, opts: { window: 'business_hours' | 'after_hours' | 'any'; timezone: string; businessHours?: { start: string; end: string }; weekdays?: number[]; holidays?: Date[] }): Date; businessElapsed(from: Date, to: Date, opts: { window: 'business_hours' | 'after_hours' | 'any'; timezone: string; businessHours?: { start: string; end: string }; weekdays?: number[]; holidays?: Date[] }): number }
export interface Notifier { notifyBreach(input: { ticketId: UUID; type: SlaType; detectedAt: Date; delayMs: number; recipients: Array<{ type: 'team' | 'user' | 'role'; id?: UUID; roleKey?: string }> }): Promise<void> }

export const TOKENS = {
  SlaTargetRepository: 'SLA.SlaTargetRepository',
  SlaBreachRepository: 'SLA.SlaBreachRepository',
  ContractsQuery: 'SLA.ContractsQuery',
  TicketsQuery: 'SLA.TicketsQuery',
  AdminScopeGuard: 'SLA.AdminScopeGuard',
  DirectoryQuery: 'SLA.DirectoryQuery',
  CalendarService: 'SLA.CalendarService',
  Notifier: 'SLA.Notifier',
} as const;

