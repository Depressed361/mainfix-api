import type { FileExporter, FileImporter } from '../domain/ports';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { WellBeingScoreEntity } from '../domain/entities/WellBeingScore';

export class LocalCsvExporter implements FileExporter {
  async exportCsv(input: { scores: WellBeingScoreEntity[] }): Promise<{ path: string }> {
    const dir = path.join(process.cwd(), 'exports'); await fs.mkdir(dir, { recursive: true });
    const filename = `well_being_${Date.now()}.csv`; const full = path.join(dir, filename);
    const header = 'siteId,periodStart,periodEnd,averageRating,nbSurveys\n';
    const lines = input.scores.map(s => [s.siteId, s.periodStart.toISOString().slice(0,10), s.periodEnd.toISOString().slice(0,10), s.averageRating, String(s.nbSurveys)].join(','));
    await fs.writeFile(full, header + lines.join('\n') + '\n');
    return { path: full };
  }
}

export class LocalCsvImporter implements FileImporter {
  async parseCsv(input: { path: string }): Promise<Array<{ siteId: string; periodStart: Date; periodEnd: Date; averageRating: string; nbSurveys: number }>> {
    const content = await fs.readFile(input.path, 'utf8');
    const lines = content.trim().split(/\r?\n/);
    const rows: Array<{ siteId: string; periodStart: Date; periodEnd: Date; averageRating: string; nbSurveys: number }> = [];
    for (let i = 1; i < lines.length; i++) {
      const [siteId, pStart, pEnd, avg, nb] = lines[i].split(',');
      rows.push({ siteId, periodStart: new Date(pStart), periodEnd: new Date(pEnd), averageRating: avg, nbSurveys: Number(nb) });
    }
    return rows;
  }
}

