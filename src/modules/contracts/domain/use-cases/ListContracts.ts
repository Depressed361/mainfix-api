import type { ContractRepository, Pagination } from '../ports';
import type { UUID } from '../types';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { Site } from '../../catalog/models/site.model';

export class ListContracts {
  constructor(private readonly contracts: ContractRepository, private readonly sites: typeof Site) {}
  async execute(actor: AuthenticatedActor, siteId: UUID, p?: Pagination) {
    const site = await this.sites.findByPk(siteId);
    if (!site) return [];
    const companyId = site.companyId;
    const hasSuper = actor.scopeStrings?.includes('admin:super');
    const allowed = hasSuper || actor.companyId === companyId || (actor.companyScopeIds || []).includes(companyId) || (actor.siteScopeIds || []).includes(siteId);
    if (!allowed) return [];
    return this.contracts.listBySite(siteId, p);
  }
}
