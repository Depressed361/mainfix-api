import type {
  EvaluationContext,
  EvaluationResult,
  RoutingRule,
} from './entities/RoutingRule';

export const TOKENS = {
  RoutingRuleRepository: 'RoutingRuleRepository',
  ContractQuery: 'ContractQuery',
  ContractCategoryQuery: 'ContractCategoryQuery',
  CompetencyQuery: 'CompetencyQuery',
  GeoQuery: 'GeoQuery',
  LoadQuery: 'LoadQuery',
} as const;

export interface RoutingRuleRepository {
  create(input: Omit<RoutingRule, 'id'>): Promise<RoutingRule>;
  update(
    id: string,
    patch: Partial<Omit<RoutingRule, 'id' | 'contractVersionId'>>,
  ): Promise<RoutingRule>;
  deleteById(id: string): Promise<void>;
  findById(id: string): Promise<RoutingRule | null>;
  listByContractVersion(contractVersionId: string): Promise<RoutingRule[]>; // sorted asc by priority, id
}

export interface ContractVersionInfo {
  id: string;
  companyId: string;
  siteId: string;
  contractId: string;
}

export interface ContractQuery {
  getContractVersion(id: string): Promise<ContractVersionInfo | null>;
}

export interface ContractCategoryQuery {
  isCategoryIncluded(
    contractVersionId: string,
    categoryId: string,
  ): Promise<boolean>;
}

export interface CompetencyEligibilityInput {
  contractVersionId: string;
  categoryId: string;
  zone?: string | null; // optional placeholder
  window?: 'business' | 'after_hours' | null;
}

export interface CompetencyQuery {
  eligibleTeams(input: CompetencyEligibilityInput): Promise<string[]>; // teamIds
}

export interface GeoQuery {
  distance(
    teamId: string,
    target: { locationId?: string; lat?: number; lng?: number },
  ): Promise<number>;
}

export interface LoadQuery {
  currentOpenLoad(teamId: string): Promise<number>;
}

export interface EvaluateRoutingPort {
  evaluate(ctx: EvaluationContext): Promise<EvaluationResult>;
}
