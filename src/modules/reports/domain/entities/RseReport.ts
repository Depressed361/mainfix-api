export interface RseReportEntity {
  id: string;
  companyId: string;
  periodStart: Date;
  periodEnd: Date;
  satisfactionAvg: number | null;
  comfortIndexAvg: number | null;
  ergonomicsTicketsCount: number;
  resolvedRatio: number | null;
  exportPath?: string | null;
  createdAt: Date;
}

