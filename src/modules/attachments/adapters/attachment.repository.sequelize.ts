import { InjectModel } from '@nestjs/sequelize';
import type { AttachmentRepository, AttachmentEntity, Pagination } from '../domain/ports';
import { TicketAttachment } from '../../tickets/ticket-attachment.model';
import { toDomainAttachment } from './mappers';

export class SequelizeAttachmentRepository implements AttachmentRepository {
  constructor(@InjectModel(TicketAttachment) private readonly model: typeof TicketAttachment) {}
  async create(p: { ticketId: string; storageKey: string; mimeType?: string | null; sizeBytes?: number | null; uploadedBy?: string | null }): Promise<AttachmentEntity> {
    const row = await this.model.create({ ticketId: p.ticketId, key: p.storageKey, mimeType: p.mimeType ?? null, sizeBytes: p.sizeBytes ?? null, uploadedBy: p.uploadedBy ?? null } as any);
    return toDomainAttachment(row);
  }
  async deleteById(id: string): Promise<void> { await this.model.destroy({ where: { id } as any }) }
  async listByTicket(ticketId: string, p?: Pagination): Promise<AttachmentEntity[]> {
    const rows = await this.model.findAll({ where: { ticketId } as any, order: [['createdAt', 'DESC']], limit: p?.pageSize, offset: p?.page && p?.pageSize ? (p.page - 1) * p.pageSize : undefined });
    return rows.map(toDomainAttachment);
  }
  async findById(id: string): Promise<AttachmentEntity | null> { const row = await this.model.findByPk(id); return row ? toDomainAttachment(row) : null }
  async existsByTicketAndKey(ticketId: string, storageKey: string): Promise<boolean> { return !!(await this.model.findOne({ where: { ticketId, key: storageKey } as any })) }
}

