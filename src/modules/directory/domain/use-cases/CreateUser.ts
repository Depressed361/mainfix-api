import type { UserRepository, AuthCommand, UserRole } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import { InvalidInputError } from '../errors';

export class CreateUser {
  constructor(private readonly users: UserRepository, private readonly auth: AuthCommand) {}
  async execute(_actor: AuthenticatedActor, p: { companyId: string; email: string; displayName: string; role: UserRole; siteId?: string; passwordHash?: string }) {
    const exists = await this.users.findByEmail(p.email);
    if (exists) throw new InvalidInputError('directory.user.email_conflict');
    const user = await this.users.create({ companyId: p.companyId, email: p.email, displayName: p.displayName, role: p.role, siteId: p.siteId ?? null });
    if (p.passwordHash) await this.auth.setPasswordHash(user.id, p.passwordHash);
    return user;
  }
}

