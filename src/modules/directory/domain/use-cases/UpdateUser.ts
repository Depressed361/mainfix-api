import type { UserRepository, UserRole } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

export class UpdateUser {
  constructor(private readonly users: UserRepository) {}
  execute(_actor: AuthenticatedActor, id: string, patch: { displayName?: string; role?: UserRole; siteId?: string; active?: boolean }) {
    return this.users.update(id, patch);
  }
}

