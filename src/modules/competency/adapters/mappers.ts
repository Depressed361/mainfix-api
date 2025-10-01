import type {
  CompetencyRecord as DCompetency,
  TeamZoneRecord as DTeamZone,
  TeamSkillRecord as DTeamSkill,
} from '../domain/ports';
import { CompetencyMatrix as SCompetency } from '../models/competency-matrix.model';
import { TeamZone as STeamZone } from '../models/team-zone.model';
import { TeamSkill as STeamSkill } from '../models/team-skills.model';

export const toDomainCompetency = (row: SCompetency): DCompetency => ({
  id: row.id,
  contractVersionId: row.contractVersionId,
  teamId: row.teamId,
  categoryId: row.categoryId,
  buildingId: (row as any).buildingId ?? null,
  level: row.level as any,
  window: row.window as any,
});

export const toDomainZone = (row: STeamZone): DTeamZone => ({ teamId: row.teamId, buildingId: row.buildingId });
export const toDomainSkill = (row: STeamSkill): DTeamSkill => ({ teamId: row.teamId, skillId: row.skillId });

