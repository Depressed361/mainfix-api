import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import { ConditionMatcher } from '../services/ConditionMatcher';
import { ActionResolver } from '../services/ActionResolver';
import { TiebreakerEngine, Candidate } from '../services/TiebreakerEngine';
import type { EvaluationContext, EvaluationResult } from '../entities/RoutingRule';
import type {
  CompetencyQuery,
  ContractCategoryQuery,
  ContractQuery,
  RoutingRuleRepository,
} from '../ports';
import { NotFoundError } from '../errors';
import { assertContractInCompany } from '../policies';

export class EvaluateRouting {
  constructor(
    private readonly rules: RoutingRuleRepository,
    private readonly contracts: ContractQuery,
    private readonly categories: ContractCategoryQuery,
    private readonly competency: CompetencyQuery,
    private readonly matcher: ConditionMatcher,
    private readonly actions: ActionResolver,
    private readonly tiebreakers: TiebreakerEngine,
  ) {}

  async execute(actor: AuthenticatedActor, ctx: EvaluationContext): Promise<EvaluationResult> {
    const cv = await this.contracts.getContractVersion(ctx.contractVersionId);
    if (!cv) throw new NotFoundError('routing.contract_version.not_found');
    assertContractInCompany(actor, cv);

    const included = await this.categories.isCategoryIncluded(ctx.contractVersionId, ctx.categoryId);
    if (!included) {
      return { outcome: { kind: 'NO_ASSIGNMENT', reason: 'scope_violation' }, tiebreakerTrace: [] };
    }

    const eligibleTeams = await this.competency.eligibleTeams({
      contractVersionId: ctx.contractVersionId,
      categoryId: ctx.categoryId,
      window: ctx.timeWindow,
      zone: null,
    });

    const rules = await this.rules.listByContractVersion(ctx.contractVersionId);

    for (const rule of rules) {
      if (!this.matcher.matches(ctx, rule.condition)) continue;
      const targets = this.actions.resolveCandidates(rule.action);
      const candidates: Candidate[] = targets
        .filter((t) => (t.type === 'team' ? eligibleTeams.includes(t.teamId) : true))
        .map((t) => (t.type === 'team' ? { type: 'team', id: t.teamId } : { type: 'vendor', id: t.externalVendorId }));

      if (candidates.length === 0) continue;
      if (candidates.length === 1) {
        const only = candidates[0];
        return {
          outcome: { kind: 'ASSIGNED', assigneeType: only.type, assigneeId: only.id, ruleId: rule.id },
          tiebreakerTrace: [],
        };
      }
      const { winner, trace } = await this.tiebreakers.pick(ctx, candidates, rule.action.order);
      return {
        outcome: { kind: 'ASSIGNED', assigneeType: winner.type, assigneeId: winner.id, ruleId: rule.id },
        tiebreakerTrace: trace,
      };
    }

    return { outcome: { kind: 'NO_ASSIGNMENT', reason: 'no_match' }, tiebreakerTrace: [] };
  }
}

