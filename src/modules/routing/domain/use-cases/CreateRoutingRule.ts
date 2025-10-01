import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import { NotFoundError } from '../errors';
import type {
  RoutingAction,
  RoutingCondition,
  RoutingRule,
} from '../entities/RoutingRule';
import { RuleValidator } from '../services/RuleValidator';
import type { ContractQuery, RoutingRuleRepository } from '../ports';
import { assertContractInCompany } from '../policies';

export interface CreateRoutingRuleInput {
  contractVersionId: string;
  priority?: number;
  condition: RoutingCondition;
  action: RoutingAction;
}

export class CreateRoutingRule {
  constructor(
    private readonly rules: RoutingRuleRepository,
    private readonly contracts: ContractQuery,
    private readonly validator: RuleValidator = new RuleValidator(),
  ) {}

  async execute(
    actor: AuthenticatedActor,
    input: CreateRoutingRuleInput,
  ): Promise<RoutingRule> {
    this.validator.validateCondition(input.condition);
    this.validator.validateAction(input.action);

    const cv = await this.contracts.getContractVersion(input.contractVersionId);
    if (!cv) throw new NotFoundError('routing.contract_version.not_found');
    assertContractInCompany(actor, cv);

    const record = await this.rules.create({
      contractVersionId: input.contractVersionId,
      priority: input.priority ?? 100,
      condition: input.condition,
      action: input.action,
    });
    return record;
  }
}
