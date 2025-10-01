import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import { InvalidRuleError, NotFoundError } from '../errors';
import type { RoutingAction, RoutingCondition, RoutingRule } from '../entities/RoutingRule';
import { RuleValidator } from '../services/RuleValidator';
import type { ContractQuery, RoutingRuleRepository } from '../ports';
import { assertContractInCompany } from '../policies';

export interface UpdateRoutingRuleInput {
  id: string;
  priority?: number;
  condition?: RoutingCondition;
  action?: RoutingAction;
}

export class UpdateRoutingRule {
  constructor(
    private readonly rules: RoutingRuleRepository,
    private readonly contracts: ContractQuery,
    private readonly validator: RuleValidator = new RuleValidator(),
  ) {}

  async execute(actor: AuthenticatedActor, input: UpdateRoutingRuleInput): Promise<RoutingRule> {
    const current = await this.rules.findById(input.id);
    if (!current) throw new NotFoundError('routing.rule.not_found');

    const cv = await this.contracts.getContractVersion(current.contractVersionId);
    if (!cv) throw new NotFoundError('routing.contract_version.not_found');
    assertContractInCompany(actor, cv);

    const patch: any = {};
    if (input.priority !== undefined) {
      if (!Number.isInteger(input.priority) || input.priority < 0) {
        throw new InvalidRuleError('routing.invalid_rule.priority');
      }
      patch.priority = input.priority;
    }
    if (input.condition !== undefined) {
      this.validator.validateCondition(input.condition);
      patch.condition = input.condition;
    }
    if (input.action !== undefined) {
      this.validator.validateAction(input.action);
      patch.action = input.action;
    }

    return this.rules.update(input.id, patch);
  }
}
