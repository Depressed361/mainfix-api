import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { TicketListQuery, TicketRepository } from '../ports';

export class ListTickets {
  constructor(private readonly repo: TicketRepository) {}
  execute(_actor: AuthenticatedActor, q: TicketListQuery) { return this.repo.list(q) }
}

