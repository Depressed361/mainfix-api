import type { FileExporter, RseReportRepository } from '../ports';

export class ExportRseReport {
  constructor(private readonly repo: RseReportRepository, private readonly exporter: FileExporter) {}
  async execute(id: string, format: 'csv' | 'pdf') {
    const report = await this.repo.findById(id);
    if (!report) throw new Error('reports.report.not_found');
    const { path } = await this.exporter.exportRseReport({ report, format });
    await this.repo.setExportPath(id, path);
    return { path };
  }
}

