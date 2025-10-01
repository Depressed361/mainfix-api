import type { UserRepository } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

export class ArchiveUser {
  constructor(private readonly users: UserRepository) {}
  execute(_actor: AuthenticatedActor, id: string) {
    return this.users.update(id, { active: false });
  }
}

