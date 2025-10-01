import type { ContractsQuery, SlaHolidayProvider } from '../ports';
import { pickHolidayCalendarCode } from '../policies';

export class GetHolidaysForContract {
  constructor(private readonly contracts: ContractsQuery, private readonly provider: SlaHolidayProvider) {}
  async execute(p: { contractVersionId: string; from: string; to: string }): Promise<{ calendarCode: string | null; holidays: string[] }> {
    const coverage = await this.contracts.getCoverage(p.contractVersionId);
    const code = pickHolidayCalendarCode(coverage);
    if (!code) return { calendarCode: null, holidays: [] };
    const holidays = await this.provider.getHolidays(code, p.from, p.to);
    return { calendarCode: code, holidays };
  }
}

