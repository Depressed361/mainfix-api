import type { ContractsQuery, TicketsQuery, SlaTargetRepository, CalendarService } from '../ports';
import { computeDueDates } from '../policies';

export class UpsertSlaTargetsOnTicketCreated {
  constructor(private readonly contracts: ContractsQuery, private readonly tickets: TicketsQuery, private readonly targets: SlaTargetRepository, private readonly calendar: CalendarService) {}
  async execute(ticketId: string) {
    const meta = await this.tickets.getTicketMeta(ticketId);
    const sla = await this.contracts.getCategorySla(meta.contractVersionId, meta.categoryId);
    if (!sla) throw new Error('sla.sla_missing');
    const { ackDueAt, resolveDueAt } = computeDueDates(this.calendar, meta.createdAt, meta.priority, sla, { window: 'business_hours', timezone: 'Europe/Paris' });
    await this.targets.upsert({ ticketId, type: 'ack', dueAt: ackDueAt });
    await this.targets.upsert({ ticketId, type: 'resolve', dueAt: resolveDueAt });
  }
}

