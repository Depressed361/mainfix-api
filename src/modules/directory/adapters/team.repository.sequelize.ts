import { InjectModel } from '@nestjs/sequelize';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import type { TeamRepository, TeamEntity, Pagination, TeamType } from '../domain/ports';
import { Team } from '../models/team.model';
import { toDomainTeam } from './mappers';

export class SequelizeTeamRepository implements TeamRepository {
  constructor(@InjectModel(Team) private readonly model: typeof Team) {}
  async create(p: Omit<TeamEntity, 'id' | 'active'> & { active?: boolean }): Promise<TeamEntity> {
    const row = await this.model.create({ companyId: p.companyId, name: p.name, type: p.type as any, active: p.active ?? true } as any);
    return toDomainTeam(row);
  }
  async update(id: string, patch: Partial<Pick<TeamEntity, 'name' | 'type' | 'active'>>): Promise<TeamEntity> {
    const row = await this.model.findByPk(id); if (!row) throw new Error('directory.team.not_found');
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.type !== undefined) row.type = patch.type as any;
    if (patch.active !== undefined) row.active = patch.active;
    await row.save();
    return toDomainTeam(row);
  }
  async findById(id: string): Promise<TeamEntity | null> { const row = await this.model.findByPk(id); return row ? toDomainTeam(row) : null }
  async listByCompany(companyId: string, q?: { type?: TeamType; active?: boolean; search?: string } & Pagination): Promise<TeamEntity[]> {
    const where: WhereOptions<Team> = { companyId } as any;
    if (q?.type) (where as any).type = q.type as any;
    if (q?.active !== undefined) (where as any).active = q.active;
    if (q?.search) (where as any).name = { [Op.iLike]: `%${q.search}%` };
    const limit = q?.pageSize; const offset = q?.page && q?.pageSize ? (q.page - 1) * q.pageSize : undefined;
    const rows = await this.model.findAll({ where, order: [['name', 'ASC']], limit, offset });
    return rows.map(toDomainTeam);
  }
  async deleteById(id: string): Promise<void> { await this.model.destroy({ where: { id } as any }) }
}

