import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import { NotFoundError } from '../errors';
import type { ContractQuery, RoutingRuleRepository } from '../ports';
import { assertContractInCompany } from '../policies';

export class DeleteRoutingRule {
  constructor(
    private readonly rules: RoutingRuleRepository,
    private readonly contracts: ContractQuery,
  ) {}

  async execute(actor: AuthenticatedActor, id: string): Promise<void> {
    const current = await this.rules.findById(id);
    if (!current) throw new NotFoundError('routing.rule.not_found');
    const cv = await this.contracts.getContractVersion(current.contractVersionId);
    if (!cv) throw new NotFoundError('routing.contract_version.not_found');
    assertContractInCompany(actor, cv);
    await this.rules.deleteById(id);
  }
}

