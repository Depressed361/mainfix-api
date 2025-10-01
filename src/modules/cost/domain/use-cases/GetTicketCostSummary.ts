import type { TicketCostEntity, TicketPartEntity, TicketCostRepository, TicketPartRepository, UUID } from '../ports';

export class GetTicketCostSummary {
  constructor(private readonly costs: TicketCostRepository, private readonly parts: TicketPartRepository) {}
  async execute(p: { ticketId: UUID }): Promise<{ cost: TicketCostEntity | null; parts: TicketPartEntity[] }> {
    const cost = await this.costs.getByTicket(p.ticketId);
    const parts = await this.parts.listByTicket(p.ticketId);
    const sorted = parts.slice().sort((a, b) => (a.label ?? a.sku ?? '').localeCompare(b.label ?? b.sku ?? ''));
    return { cost, parts: sorted };
  }
}

