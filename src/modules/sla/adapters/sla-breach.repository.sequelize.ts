import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import type { SlaBreachRepository, SlaBreachEntity, SlaType } from '../domain/ports';
import { SlaBreach } from '../sla-breach.model';
import { SlaTarget } from '../sla-target.model';
import { Ticket } from '../../tickets/models/ticket.model';
import { toDomainBreach } from './mappers';

export class SequelizeSlaBreachRepository implements SlaBreachRepository {
  constructor(@InjectModel(SlaBreach) private readonly model: typeof SlaBreach, @InjectModel(SlaTarget) private readonly targets: typeof SlaTarget) {}
  async create(b: { ticketId: string; type: SlaType; detectedAt: Date; delayMs: number }): Promise<SlaBreachEntity> {
    const target = await this.targets.findOne({ where: { ticketId: b.ticketId, kind: b.type } as any });
    if (!target) throw new Error('sla.target_not_found');
    const row = await this.model.create({ slaTargetId: target.id, breachedAt: b.detectedAt, level: 1, notified: false } as any);
    const withInclude = await this.model.findByPk(row.id, { include: [{ model: this.targets, include: [{ model: Ticket }] }] as any });
    return toDomainBreach(withInclude as any);
  }
  async list(q: { companyId?: string; siteIds?: string[]; buildingIds?: string[]; teamIds?: string[]; types?: SlaType[]; from?: Date; to?: Date; page?: number; pageSize?: number }): Promise<{ rows: SlaBreachEntity[]; total: number }> {
    const where: WhereOptions<SlaBreach> = {} as any;
    if (q.from || q.to) (where as any).breachedAt = { ...(q.from ? { [Op.gte]: q.from } : {}), ...(q.to ? { [Op.lte]: q.to } : {}) } as any;
    const limit = q.pageSize; const offset = q.page && q.pageSize ? (q.page - 1) * q.pageSize : undefined;
    const include = [{ model: this.targets, where: q.types && q.types.length ? ({ kind: { [Op.in]: q.types } } as any) : ({} as any), include: [{ model: Ticket, where: q.companyId ? ({ companyId: q.companyId } as any) : ({} as any) }] }] as any;
    const { rows, count } = await this.model.findAndCountAll({ where, include, order: [['breachedAt','DESC']], limit, offset });
    return { rows: rows.map((r) => toDomainBreach(r as any)), total: count };
  }
}
