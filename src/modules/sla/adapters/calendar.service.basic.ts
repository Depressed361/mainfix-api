import type { CalendarService } from '../domain/ports';

export class BasicCalendarService implements CalendarService {
  addBusinessDuration(start: Date, durationMinutes: number): Date {
    return new Date(start.getTime() + durationMinutes * 60 * 1000);
  }
  businessElapsed(from: Date, to: Date): number {
    return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 60000));
  }
}

