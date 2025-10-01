import type { HolidayCalendarEntity } from '../ports';
import { InvalidInputError } from '../errors';
import type { HolidayCalendarRepository } from '../ports';

export class CreateOrUpdateCalendar {
  constructor(private readonly repo: HolidayCalendarRepository) {}
  async execute(p: { code: string; country?: string | null }): Promise<HolidayCalendarEntity> {
    if (!p.code || typeof p.code !== 'string' || p.code.trim().length === 0) throw new InvalidInputError('holiday.calendar.invalid_code');
    return this.repo.createOrUpdate({ code: p.code.trim(), country: p.country ?? null });
  }
}

