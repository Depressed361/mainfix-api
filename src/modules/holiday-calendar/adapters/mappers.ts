import type { HolidayCalendarEntity, HolidayEntity } from '../domain/ports';
import { HolidayCalendar as HolidayCalendarModel } from '../../calendar/models/holiday-calendar.model';
import { Holiday as HolidayModel } from '../../calendar/models/holiday.model';

export const toDomainCalendar = (m: HolidayCalendarModel): HolidayCalendarEntity => ({
  id: m.id,
  code: m.code,
  country: m.country ?? null,
});

export const toDomainHoliday = (m: HolidayModel): HolidayEntity => ({
  id: m.id,
  calendarId: (m as any).calendarId ?? null,
  day: m.day,
  label: m.label ?? null,
});

