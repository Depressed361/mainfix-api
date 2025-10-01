export type UUID = string;
export type ISODate = string; // 'YYYY-MM-DD'

export interface HolidayCalendarEntity {
  id: UUID;
  code: string;
  country?: string | null;
}

export interface HolidayEntity {
  id: UUID;
  calendarId?: UUID | null;
  day: ISODate;
  label?: string | null;
}

export interface Pagination { page?: number; pageSize?: number }

export interface HolidayCalendarRepository {
  createOrUpdate(p: { code: string; country?: string | null }): Promise<HolidayCalendarEntity>;
  findByCode(code: string): Promise<HolidayCalendarEntity | null>;
  findById(id: UUID): Promise<HolidayCalendarEntity | null>;
  list(p?: Pagination): Promise<{ rows: HolidayCalendarEntity[]; total: number }>;
}

export interface HolidayRepository {
  upsert(p: { calendarId: UUID; day: ISODate; label?: string | null }): Promise<HolidayEntity>;
  delete(p: { calendarId: UUID; day: ISODate }): Promise<void>;
  listInRange(p: { calendarId: UUID; from: ISODate; to: ISODate }): Promise<HolidayEntity[]>;
  exists(p: { calendarId: UUID; day: ISODate }): Promise<boolean>;
}

export interface ContractsQuery {
  getCoverage(contractVersionId: UUID): Promise<Record<string, unknown> | null>;
}

export interface SlaHolidayProvider {
  getHolidays(calendarCode: string, from: ISODate, to: ISODate): Promise<ISODate[]>;
}

export const TOKENS = {
  HolidayCalendarRepository: 'Holiday.HolidayCalendarRepository',
  HolidayRepository: 'Holiday.HolidayRepository',
  ContractsQuery: 'Holiday.ContractsQuery',
  SlaHolidayProvider: 'Holiday.SlaHolidayProvider',
} as const;

