const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function assertIsoDate(day: string) {
  if (!ISO.test(day)) throw new Error('holiday.date.invalid_iso');
}

export function pickHolidayCalendarCode(coverage: Record<string, unknown> | null | undefined): string | null {
  if (!coverage || typeof coverage !== 'object') return null;
  const working = (coverage as Record<string, unknown>)['working'];
  if (!working || typeof working !== 'object') return null;
  const code = (working as Record<string, unknown>)['holidayCalendarCode'];
  return typeof code === 'string' && code.length > 0 ? code : null;
}

