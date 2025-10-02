import type { ContractVersionRepository, Pagination } from '../ports';
import type { UUID } from '../types';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { Contract } from '../models/contract.model';
import { Site } from '../../catalog/models/site.model';

export class ListContractVersions {
  constructor(private readonly versions: ContractVersionRepository, private readonly contracts: typeof Contract, private readonly sites: typeof Site) {}
  async execute(actor: AuthenticatedActor, contractId: UUID, p?: Pagination) {
    const contract = await this.contracts.findByPk(contractId);
    if (!contract) return [];
    const site = await this.sites.findByPk(contract.siteId);
    const companyId = site?.companyId;
    if (!companyId) return [];
    const hasSuper = actor.scopeStrings?.includes('admin:super');
    const allowed = hasSuper || actor.companyId === companyId || (actor.companyScopeIds || []).includes(companyId) || (actor.siteScopeIds || []).includes(contract.siteId);
    if (!allowed) return [];
    return this.versions.listByContract(contractId, p);
  }
}
