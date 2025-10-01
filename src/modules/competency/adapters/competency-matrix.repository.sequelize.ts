import { InjectModel } from '@nestjs/sequelize';
import type { CompetencyMatrixRepository, CompetencyRecord, Pagination, TimeWindow, UUID } from '../domain/ports';
import { CompetencyMatrix } from '../models/competency-matrix.model';
import { toDomainCompetency } from './mappers';

export class SequelizeCompetencyMatrixRepository implements CompetencyMatrixRepository {
  constructor(@InjectModel(CompetencyMatrix) private readonly model: typeof CompetencyMatrix) {}

  async upsert(rec: Omit<CompetencyRecord, 'id'>): Promise<CompetencyRecord> {
    const existing = await this.find({
      contractVersionId: rec.contractVersionId,
      teamId: rec.teamId,
      categoryId: rec.categoryId,
      buildingId: rec.buildingId ?? null,
      window: rec.window,
    });
    if (existing) {
      const row = await this.model.findByPk(existing.id);
      if (row) {
        row.level = rec.level as any;
        await row.save();
        return toDomainCompetency(row);
      }
      return existing;
    }
    const created = await this.model.create({
      contractVersionId: rec.contractVersionId,
      teamId: rec.teamId,
      categoryId: rec.categoryId,
      buildingId: rec.buildingId ?? null,
      level: rec.level as any,
      window: rec.window as any,
    } as any);
    return toDomainCompetency(created);
  }

  async deleteByUniqueKey(k: { contractVersionId: string; teamId: string; categoryId: string; buildingId: string | null; window: TimeWindow; }): Promise<void> {
    await this.model.destroy({ where: {
      contractVersionId: k.contractVersionId,
      teamId: k.teamId,
      categoryId: k.categoryId,
      buildingId: k.buildingId,
      window: k.window as any,
    } as any });
  }

  async listByContractVersion(contractVersionId: UUID, p?: Pagination): Promise<CompetencyRecord[]> {
    const rows = await this.model.findAll({ where: { contractVersionId } as any, limit: p?.pageSize, offset: p && p.page && p.pageSize ? (p.page - 1) * p.pageSize : undefined });
    return rows.map(toDomainCompetency);
  }
  async listByTeam(contractVersionId: UUID, teamId: UUID): Promise<CompetencyRecord[]> {
    const rows = await this.model.findAll({ where: { contractVersionId, teamId } as any });
    return rows.map(toDomainCompetency);
  }
  async listByCategory(contractVersionId: UUID, categoryId: UUID): Promise<CompetencyRecord[]> {
    const rows = await this.model.findAll({ where: { contractVersionId, categoryId } as any });
    return rows.map(toDomainCompetency);
  }
  async find(k: { contractVersionId: string; teamId: string; categoryId: string; buildingId: string | null; window: TimeWindow; }): Promise<CompetencyRecord | null> {
    const row = await this.model.findOne({ where: {
      contractVersionId: k.contractVersionId,
      teamId: k.teamId,
      categoryId: k.categoryId,
      buildingId: k.buildingId,
      window: k.window as any,
    } as any });
    return row ? toDomainCompetency(row) : null;
  }
}

