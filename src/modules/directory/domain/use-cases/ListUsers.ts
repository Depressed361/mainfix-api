import type { UserRepository, Pagination, UserRole } from '../ports';

export class ListUsers {
  constructor(private readonly users: UserRepository) {}
  execute(companyId: string, q?: { role?: UserRole; active?: boolean; search?: string } & Pagination) {
    return this.users.listByCompany(companyId, q);
  }
}

