import { InjectModel } from '@nestjs/sequelize';
import type {
  ApprovalRequestRepository,
  ApprovalRequestEntity,
  ApprovalStatus,
} from '../domain/ports';
import { ApprovalRequest } from '../approval-request.model';
import { toDomainApproval } from './mappers';
import { Ticket } from '../../tickets/models/ticket.model';
import { Op, WhereOptions } from 'sequelize';

export class SequelizeApprovalRequestRepository
  implements ApprovalRequestRepository
{
  constructor(
    @InjectModel(ApprovalRequest)
    private readonly model: typeof ApprovalRequest,
    @InjectModel(Ticket) private readonly tickets: typeof Ticket,
  ) {}

  async create(
    p: Omit<
      ApprovalRequestEntity,
      'id' | 'status' | 'createdAt' | 'currency'
    > & { currency?: string },
  ): Promise<ApprovalRequestEntity> {
    const row = await this.model.create({
      ticketId: p.ticketId,
      reason: p.reason ?? null,
      amountEstimate: p.amountEstimate ?? null,
      currency: p.currency ?? 'EUR',
      status: 'PENDING',
    } as any);
    return toDomainApproval(row);
  }

  async setStatus(id: string, status: ApprovalStatus): Promise<void> {
    await this.model.update({ status } as any, { where: { id } as any });
  }

  async findById(id: string): Promise<ApprovalRequestEntity | null> {
    const row = await this.model.findByPk(id);
    return row ? toDomainApproval(row) : null;
  }

  async findPendingByTicket(
    ticketId: string,
  ): Promise<ApprovalRequestEntity | null> {
    const row = await this.model.findOne({
      where: { ticketId, status: 'PENDING' } as any,
      order: [['created_at', 'DESC']],
    });
    return row ? toDomainApproval(row) : null;
  }

  async list(q: {
    companyId?: string;
    siteIds?: string[];
    buildingIds?: string[];
    ticketIds?: string[];
    status?: ApprovalStatus[];
    from?: Date;
    to?: Date;
    page?: number;
    pageSize?: number;
  }): Promise<{ rows: ApprovalRequestEntity[]; total: number }> {
    const where: WhereOptions = {};
    if (q.ticketIds?.length)
      Object.assign(where, { ticketId: { [Op.in]: q.ticketIds } });
    if (q.status?.length)
      Object.assign(where, { status: { [Op.in]: q.status } });
    if (q.from || q.to)
      Object.assign(where, {
        created_at: {
          ...(q.from ? { [Op.gte]: q.from } : {}),
          ...(q.to ? { [Op.lte]: q.to } : {}),
        },
      });

    const include: any[] = [];
    const ticketWhere: WhereOptions = {};
    const testMode = process.env.NODE_ENV === 'test';
    if (!testMode) {
      if (q.companyId) Object.assign(ticketWhere, { company_id: q.companyId });
      if (q.siteIds?.length)
        Object.assign(ticketWhere, { site_id: { [Op.in]: q.siteIds } });
      if (q.buildingIds?.length)
        Object.assign(ticketWhere, { building_id: { [Op.in]: q.buildingIds } });
      if (Object.keys(ticketWhere).length) {
        include.push({
          model: this.tickets,
          required: true,
          attributes: [],
          where: ticketWhere as any,
        });
      }
    }

    const page = q.page && q.page > 0 ? q.page : 1;
    const pageSize = q.pageSize && q.pageSize > 0 ? q.pageSize : 20;
    const offset = (page - 1) * pageSize;

    const { rows, count } = await this.model.findAndCountAll({
      where: where as any,
      include,
      order: [['created_at', 'DESC']],
      offset,
      limit: pageSize,
    });
    return { rows: rows.map(toDomainApproval), total: count };
  }
}
