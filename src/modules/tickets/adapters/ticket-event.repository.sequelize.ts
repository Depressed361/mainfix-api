import { InjectModel } from '@nestjs/sequelize';
import type { TicketEventRepository } from '../domain/ports';
import { TicketEvent } from '../models/ticket-event.model';
import { toDomainEvent } from './mappers';

export class SequelizeTicketEventRepository implements TicketEventRepository {
  constructor(@InjectModel(TicketEvent) private readonly model: typeof TicketEvent) {}
  async append(e: any) { const row = await this.model.create({ ticketId: e.ticketId, actorUserId: e.actorUserId, type: e.type, payload: e.payload ?? null } as any); return toDomainEvent(row) }
  async list(ticketId: string, p?: { page?: number; pageSize?: number }) { const rows = await this.model.findAll({ where: { ticketId } as any, order: [['createdAt','DESC']], limit: p?.pageSize, offset: p?.page && p?.pageSize ? (p.page-1)*p.pageSize : undefined }); return rows.map(toDomainEvent) }
}
