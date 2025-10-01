import type { HolidayEntity, HolidayRepository } from '../ports';
import { assertIsoDate } from '../policies';

export class ListHolidaysInRange {
  constructor(private readonly repo: HolidayRepository) {}
  async execute(p: { calendarId: string; from: string; to: string }): Promise<HolidayEntity[]> {
    assertIsoDate(p.from); assertIsoDate(p.to);
    const rows = await this.repo.listInRange({ calendarId: p.calendarId, from: p.from, to: p.to });
    return rows.sort((a, b) => a.day.localeCompare(b.day));
  }
}

