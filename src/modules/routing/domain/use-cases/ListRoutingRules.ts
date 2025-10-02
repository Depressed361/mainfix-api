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
    try {
      const cv = await this.contracts.getContractVersion(contractVersionId);
      if (!cv) return [];
      assertContractInCompany(actor, cv);
      return this.rules.listByContractVersion(contractVersionId);
    } catch (_err) {
      // Strict policy for LIST: out-of-scope or not found → empty list
      return [];
    }
  }
}
