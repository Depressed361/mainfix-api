import { InjectModel } from '@nestjs/sequelize';
import type { TicketCommentRepository } from '../domain/ports';
import { TicketComment } from '../ticket-comment.model';
import { toDomainComment } from './mappers';

export class SequelizeTicketCommentRepository implements TicketCommentRepository {
  constructor(@InjectModel(TicketComment) private readonly model: typeof TicketComment) {}
  async create(c: any) { const row = await this.model.create({ ticketId: c.ticketId, authorUserId: c.authorUserId, body: c.body } as any); return toDomainComment(row) }
  async list(ticketId: string, p?: { page?: number; pageSize?: number }) { const rows = await this.model.findAll({ where: { ticketId } as any, order: [['createdAt','DESC']], limit: p?.pageSize, offset: p?.page && p?.pageSize ? (p.page-1)*p.pageSize : undefined }); return rows.map(toDomainComment) }
}

