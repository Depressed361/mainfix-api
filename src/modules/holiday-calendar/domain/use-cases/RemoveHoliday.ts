import type { HolidayRepository } from '../ports';
import { assertIsoDate } from '../policies';

export class RemoveHoliday {
  constructor(private readonly repo: HolidayRepository) {}
  async execute(p: { calendarId: string; day: string }): Promise<void> {
    assertIsoDate(p.day);
    await this.repo.delete({ calendarId: p.calendarId, day: p.day });
  }
}

