import { SiteRepository } from '../ports';
import { ListSitesContext, ListSitesQuery, ListSitesResult } from '../types';

export class ListSites {
  constructor(private readonly repo: SiteRepository) {}

  async exec(
    query: ListSitesQuery = {},
    context: ListSitesContext = {},
  ): Promise<ListSitesResult> {
    const sanitizedQuery: ListSitesQuery = {};

    const companyId = query.companyId?.trim();
    if (companyId) sanitizedQuery.companyId = companyId;
    if (query.search?.trim()) sanitizedQuery.search = query.search.trim();

    if (
      typeof query.limit === 'number' &&
      Number.isFinite(query.limit) &&
      query.limit > 0
    ) {
      sanitizedQuery.limit = Math.min(query.limit, 100);
    }

    if (
      typeof query.offset === 'number' &&
      Number.isFinite(query.offset) &&
      query.offset >= 0
    ) {
      sanitizedQuery.offset = query.offset;
    }

    if (
      !sanitizedQuery.companyId &&
      !context.isPlatformAdmin &&
      context.actorCompanyId?.trim()
    ) {
      sanitizedQuery.companyId = context.actorCompanyId.trim();
    }

    return this.repo.list(sanitizedQuery);
  }
}
