import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { CatalogQuery, CompanyQuery, DirectoryCommand } from '../ports';
import { ForbiddenError, InvalidInputError } from '../errors';

export class OnboardVendorForSite {
  constructor(
    private readonly catalog: CatalogQuery,
    private readonly companyQuery: CompanyQuery,
    private readonly directory: DirectoryCommand,
  ) {}

  async execute(actor: AuthenticatedActor, companyId: string, p: { siteId: string; vendorTeamName: string; initialMemberIds?: string[] }) {
    const meta = await this.catalog.getSiteMeta(p.siteId);
    if (meta.companyId !== companyId) throw new ForbiddenError('companies.vendor_onboarding.cross_company');
    // ensure actor has scope (best-effort; real enforcement via guard)
    if (!(actor.scopeStrings?.includes('admin:super') || actor.companyId === companyId || actor.companyScopeIds?.includes(companyId))) {
      throw new ForbiddenError('companies.company_scope.denied');
    }
    const { teamId } = await this.directory.createVendorTeam({ companyId, name: p.vendorTeamName, active: true });
    await this.directory.setTeamTypeVendor(teamId);
    if (p.initialMemberIds && p.initialMemberIds.length > 0) {
      await this.directory.addTeamMembers({ teamId, userIds: p.initialMemberIds });
    }
    return { teamId };
  }
}

