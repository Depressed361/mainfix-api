import { InjectModel } from '@nestjs/sequelize';
import type { TeamSkillRepository, TeamSkillRecord, Pagination, UUID } from '../domain/ports';
import { TeamSkill } from '../models/team-skills.model';
import { toDomainSkill } from './mappers';

export class SequelizeTeamSkillRepository implements TeamSkillRepository {
  constructor(@InjectModel(TeamSkill) private readonly model: typeof TeamSkill) {}
  async upsert(rec: TeamSkillRecord): Promise<void> {
    await this.model.upsert({ teamId: rec.teamId, skillId: rec.skillId } as any);
  }
  async delete(teamId: UUID, skillId: UUID): Promise<void> {
    await this.model.destroy({ where: { teamId, skillId } as any });
  }
  async listByTeam(teamId: UUID, p?: Pagination): Promise<TeamSkillRecord[]> {
    const rows = await this.model.findAll({ where: { teamId } as any, limit: p?.pageSize, offset: p && p.page && p.pageSize ? (p.page - 1) * p.pageSize : undefined });
    return rows.map(toDomainSkill);
  }
  async listTeamsBySkill(skillId: UUID, p?: Pagination): Promise<UUID[]> {
    const rows = await this.model.findAll({ where: { skillId } as any, limit: p?.pageSize, offset: p && p.page && p.pageSize ? (p.page - 1) * p.pageSize : undefined });
    return rows.map((r) => r.teamId);
  }
  async hasSkill(teamId: UUID, skillId: UUID): Promise<boolean> {
    return !!(await this.model.findOne({ where: { teamId, skillId } as any }));
  }
}

