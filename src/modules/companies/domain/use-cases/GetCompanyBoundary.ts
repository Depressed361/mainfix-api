import type { CompanyQuery } from '../ports';

export class GetCompanyBoundary {
  constructor(private readonly query: CompanyQuery) {}
  execute(companyId: string) {
    return this.query.getBoundary(companyId);
  }
}

