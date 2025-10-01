import type { SlaTargetRepository } from '../ports';

export class GetSlaForTicket {
  constructor(private readonly targets: SlaTargetRepository) {}
  execute(ticketId: string) { return this.targets.findByTicket(ticketId) }
}

