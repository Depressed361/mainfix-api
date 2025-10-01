import { InjectModel } from '@nestjs/sequelize';
import type { SlaTargetRepository, SlaTargetEntity, SlaType } from '../domain/ports';
import { SlaTarget } from '../sla-target.model';
import { toDomainTarget } from './mappers';

export class SequelizeSlaTargetRepository implements SlaTargetRepository {
  constructor(@InjectModel(SlaTarget) private readonly model: typeof SlaTarget) {}
  async upsert(target: { ticketId: string; type: SlaType; dueAt: Date }): Promise<SlaTargetEntity> {
    const existing = await this.model.findOne({ where: { ticketId: target.ticketId, kind: target.type } as any });
    if (existing) { existing.deadline = target.dueAt; await existing.save(); return toDomainTarget(existing) }
    const row = await this.model.create({ ticketId: target.ticketId, kind: target.type, deadline: target.dueAt } as any);
    return toDomainTarget(row);
  }
  async findByTicket(ticketId: string): Promise<SlaTargetEntity[]> { const rows = await this.model.findAll({ where: { ticketId } as any }); return rows.map(toDomainTarget) }
  async findByTicketAndType(ticketId: string, type: SlaType): Promise<SlaTargetEntity | null> { const row = await this.model.findOne({ where: { ticketId, kind: type } as any }); return row ? toDomainTarget(row) : null }
  async updateDueAt(ticketId: string, type: SlaType, newDueAt: Date): Promise<void> { await this.model.update({ deadline: newDueAt } as any, { where: { ticketId, kind: type } as any }) }
  async deleteForTicket(ticketId: string): Promise<void> { await this.model.destroy({ where: { ticketId } as any }) }
  async setPaused(ticketId: string, type: SlaType, paused: boolean, at?: Date | null): Promise<void> { await this.model.update({ paused, pausedAt: at ?? null } as any, { where: { ticketId, kind: type } as any }) }
}

