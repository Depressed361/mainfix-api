import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import { NotFoundError } from '../errors';
import type { RoutingRule } from '../entities/RoutingRule';
import type { ContractQuery, RoutingRuleRepository } from '../ports';
import { assertContractInCompany } from '../policies';

export class ListRoutingRules {
  constructor(
    private readonly rules: RoutingRuleRepository,
    private readonly contracts: ContractQuery,
  ) {}

  async execute(actor: AuthenticatedActor, contractVersionId: string): Promise<RoutingRule[]> {
    const cv = await this.contracts.getContractVersion(contractVersionId);
    if (!cv) throw new NotFoundError('routing.contract_version.not_found');
    assertContractInCompany(actor, cv);
    return this.rules.listByContractVersion(contractVersionId);
  }
}

