export type UUID = string;
export type Priority = 'P1' | 'P2' | 'P3';
export type TimeWindow = 'business_hours' | 'after_hours' | 'any';

export interface SlaTarget { ackMinutes: number; resolveHours: number }
export type SlaByPriority = Record<Priority, SlaTarget>;

export interface CoverageJson {
  zones?: { buildingIds?: UUID[] };
  timeWindows?: Array<Exclude<TimeWindow, 'any'>>;
  priorityMapping?: Partial<Record<Priority, number>>;
  [k: string]: unknown;
}

export interface EscalationJson {
  levels?: Array<{ delayMinutes: number; who: { type: 'team' | 'user' | 'role'; id?: UUID; roleKey?: string } }>;
  [k: string]: unknown;
}

export interface ApprovalsJson {
  rules?: Array<{ threshold?: number; approver: { type: 'user' | 'role'; id?: UUID; roleKey?: string } }>;
  [k: string]: unknown;
}

