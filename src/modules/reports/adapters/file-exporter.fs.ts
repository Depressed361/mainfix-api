import type { FileExporter } from '../domain/ports';
import type { RseReportEntity } from '../domain/entities/RseReport';
import { promises as fs } from 'fs';
import * as path from 'path';

export class LocalFileExporter implements FileExporter {
  async exportRseReport(params: { report: RseReportEntity; format: 'csv' | 'pdf' }): Promise<{ path: string }> {
    const dir = path.join(process.cwd(), 'exports');
    await fs.mkdir(dir, { recursive: true });
    const filename = `rse_${params.report.companyId}_${params.report.periodStart.toString()}_${params.report.periodEnd.toString()}.${params.format}`.replace(/[:]/g, '-');
    const full = path.join(dir, filename);
    const content = this.serialize(params.report, params.format);
    await fs.writeFile(full, content);
    return { path: full };
  }
  private serialize(r: RseReportEntity, format: 'csv' | 'pdf'): Buffer | string {
    if (format === 'csv') {
      const header = 'companyId,periodStart,periodEnd,satisfactionAvg,comfortIndexAvg,ergonomicsTicketsCount,resolvedRatio\n';
      const row = [r.companyId, r.periodStart.toISOString().slice(0, 10), r.periodEnd.toISOString().slice(0, 10), r.satisfactionAvg ?? '', r.comfortIndexAvg ?? '', r.ergonomicsTicketsCount, r.resolvedRatio ?? ''].join(',');
      return header + row + '\n';
    }
    // Minimal PDF stub: write plain text; real PDF generation can be integrated later
    return `RSE Report\nCompany: ${r.companyId}\nPeriod: ${r.periodStart.toISOString().slice(0, 10)}..${r.periodEnd.toISOString().slice(0, 10)}\nSatisfaction: ${r.satisfactionAvg}\nComfort: ${r.comfortIndexAvg}\nErgonomics Tickets: ${r.ergonomicsTicketsCount}\nResolved Ratio: ${r.resolvedRatio}\n`;
  }
}

