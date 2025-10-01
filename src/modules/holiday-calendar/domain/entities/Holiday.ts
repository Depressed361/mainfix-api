import type { HolidayEntity, UUID, ISODate } from '../ports';

export class HolidayAggregate implements HolidayEntity {
  constructor(
    public readonly id: UUID,
    public readonly calendarId: UUID | null | undefined,
    public readonly day: ISODate,
    public readonly label?: string | null,
  ) {}
}

