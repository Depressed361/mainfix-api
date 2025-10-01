import type { CompetencyMatrixRepository, UUID } from '../ports';

export class ExportCompetencyDictionary {
  constructor(private readonly matrix: CompetencyMatrixRepository) {}
  async execute(contractVersionId: UUID) {
    const rows = await this.matrix.listByContractVersion(contractVersionId);
    const dict: Record<string, { teams: string[]; buildings: (string | null)[]; windows: string[] }> = {};
    for (const r of rows) {
      const key = `${r.categoryId}`;
      if (!dict[key]) dict[key] = { teams: [], buildings: [], windows: [] };
      dict[key].teams.push(r.teamId);
      dict[key].buildings.push(r.buildingId);
      dict[key].windows.push(r.window);
    }
    return dict;
  }
}

