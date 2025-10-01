import type { AdminScopeRepository } from '../ports';

export class ListAdminScopes {
  constructor(private readonly repo: AdminScopeRepository) {}
  execute(userId: string) { return this.repo.listByUser(userId) }
}

