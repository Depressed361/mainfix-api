import type { HolidayCalendarEntity, UUID } from '../ports';

export class HolidayCalendarAggregate implements HolidayCalendarEntity {
  constructor(
    public readonly id: UUID,
    public readonly code: string,
    public readonly country?: string | null,
  ) {}
}

