import { InjectModel } from '@nestjs/sequelize';
import type { ContractsQuery, SlaHolidayProvider } from '../domain/ports';
import { ContractVersion } from '../../contracts/models/contract-version.model';
import type { HolidayCalendarRepository, HolidayRepository } from '../domain/ports';

export class SequelizeContractsQuery implements ContractsQuery {
  constructor(@InjectModel(ContractVersion) private readonly versions: typeof ContractVersion) {}
  async getCoverage(contractVersionId: string): Promise<Record<string, unknown> | null> {
    const v = await this.versions.findByPk(contractVersionId);
    if (!v) return null;
    const coverage = (v as any).coverage as Record<string, unknown> | undefined;
    return coverage ?? null;
  }
}

export class RepoSlaHolidayProvider implements SlaHolidayProvider {
  constructor(private readonly calendars: HolidayCalendarRepository, private readonly holidays: HolidayRepository) {}
  async getHolidays(calendarCode: string, from: string, to: string): Promise<string[]> {
    const cal = await this.calendars.findByCode(calendarCode);
    if (!cal) return [];
    const rows = await this.holidays.listInRange({ calendarId: cal.id, from, to });
    return rows.map(r => r.day);
  }
}

