import type { HolidayEntity, HolidayRepository } from '../ports';
import { assertIsoDate } from '../policies';

export class UpsertHoliday {
  constructor(private readonly repo: HolidayRepository) {}
  async execute(p: { calendarId: string; day: string; label?: string | null }): Promise<HolidayEntity> {
    assertIsoDate(p.day);
    return this.repo.upsert({ calendarId: p.calendarId, day: p.day, label: p.label ?? null });
  }
}

