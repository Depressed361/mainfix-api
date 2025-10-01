export interface RoutingRule {
  id: string;
  contractVersionId: string;
  priority: number; // default 100
  condition: RoutingCondition;
  action: RoutingAction;
}

export type UUID = string;

export type TimeWindow = 'business' | 'after_hours';

export interface RoutingCondition {
  categoryId?: UUID;
  priorityIn?: number[];
  buildingId?: UUID;
  locationId?: UUID;
  assetKindIn?: string[];
  timeWindow?: TimeWindow;
  tagsAnyOf?: string[];
  anyOf?: RoutingCondition[]; // optional OR support
}

export type AssignTarget =
  | { type: 'team'; teamId: UUID }
  | { type: 'vendor'; externalVendorId: UUID };

export type OrderStrategy =
  | 'as_listed'
  | 'least_load'
  | 'nearest'
  | 'round_robin';

export interface RoutingAction {
  assign: AssignTarget | AssignTarget[]; // allow multiple candidates as list
  order?: OrderStrategy;
  fallback?: AssignTarget[];
}

export interface EvaluationContext {
  companyId: UUID;
  siteId: UUID;
  contractVersionId: UUID;
  categoryId: UUID;
  buildingId?: UUID;
  locationId?: UUID;
  assetKind?: string;
  timeWindow: TimeWindow;
  tags?: string[];
  priority?: number; // business priority of the ticket
}

export type AssigneeType = 'team' | 'vendor';

export interface TiebreakerTraceEntry {
  strategy: OrderStrategy | 'default_chain';
  scores?: Record<string, number>;
  winnerId?: string;
}

export interface EvaluationResult {
  outcome:
    | {
        kind: 'ASSIGNED';
        assigneeType: AssigneeType;
        assigneeId: string;
        ruleId: string;
      }
    | {
        kind: 'NO_ASSIGNMENT';
        reason: 'scope_violation' | 'no_match' | 'no_eligible_candidate';
      };
  tiebreakerTrace: TiebreakerTraceEntry[];
}
