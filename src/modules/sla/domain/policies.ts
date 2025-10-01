import type { CalendarService, TicketPriority } from './ports';

export function computeDueDates(
  calendar: CalendarService,
  createdAt: Date,
  priority: TicketPriority,
  sla: Record<TicketPriority, { ackMinutes: number; resolveHours: number }>,
  opts: { window: 'business_hours' | 'after_hours' | 'any'; timezone: string },
) {
  const ackMinutes = sla[priority].ackMinutes;
  const resolveMinutes = sla[priority].resolveHours * 60;
  const ackDueAt = calendar.addBusinessDuration(createdAt, ackMinutes, opts);
  const resolveDueAt = calendar.addBusinessDuration(createdAt, resolveMinutes, opts);
  return { ackDueAt, resolveDueAt };
}

