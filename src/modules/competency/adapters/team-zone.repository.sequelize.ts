import { InjectModel } from '@nestjs/sequelize';
import type { TeamZoneRepository, TeamZoneRecord, Pagination, UUID } from '../domain/ports';
import { TeamZone } from '../models/team-zone.model';
import { toDomainZone } from './mappers';

export class SequelizeTeamZoneRepository implements TeamZoneRepository {
  constructor(@InjectModel(TeamZone) private readonly model: typeof TeamZone) {}
  async upsert(rec: TeamZoneRecord): Promise<void> {
    await this.model.upsert({ teamId: rec.teamId, buildingId: rec.buildingId } as any);
  }
  async delete(teamId: UUID, buildingId: UUID): Promise<void> {
    await this.model.destroy({ where: { teamId, buildingId } as any });
  }
  async listByTeam(teamId: UUID, p?: Pagination): Promise<TeamZoneRecord[]> {
    const rows = await this.model.findAll({ where: { teamId } as any, limit: p?.pageSize, offset: p && p.page && p.pageSize ? (p.page - 1) * p.pageSize : undefined });
    return rows.map(toDomainZone);
  }
  async listByBuilding(buildingId: UUID, p?: Pagination): Promise<TeamZoneRecord[]> {
    const rows = await this.model.findAll({ where: { buildingId } as any, limit: p?.pageSize, offset: p && p.page && p.pageSize ? (p.page - 1) * p.pageSize : undefined });
    return rows.map(toDomainZone);
  }
  async exists(teamId: UUID, buildingId: UUID): Promise<boolean> {
    const found = await this.model.findOne({ where: { teamId, buildingId } as any });
    return !!found;
  }
}

