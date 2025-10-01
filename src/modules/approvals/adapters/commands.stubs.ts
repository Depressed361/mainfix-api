import type { TicketCommand } from '../domain/ports';

export class NoopTicketCommand implements TicketCommand {
  async blockTransitions(_ticketId: string, _reason: string): Promise<void> { /* no-op */ }
  async unblockTransitions(_ticketId: string, _reason: string): Promise<void> { /* no-op */ }
}

