import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import type { TicketListQuery, TicketRepository } from '../domain/ports';
import { Ticket } from '../models/ticket.model';
import { toDomainTicket } from './mappers';
import { NotFoundError } from '../domain/errors';

function generateTicketNumber(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `T-${Date.now()}-${random}`;
}

export class SequelizeTicketRepository implements TicketRepository {
  constructor(@InjectModel(Ticket) private readonly model: typeof Ticket) {}
  async create(t: any) {
    const row = await this.model.create({
      number: generateTicketNumber(),
      companyId: t.companyId,
      siteId: t.siteId,
      buildingId: t.buildingId ?? null,
      locationId: t.locationId ?? null,
      assetId: t.assetId ?? null,
      categoryId: t.categoryId,
      reporterId: t.reporterId,
      assigneeTeamId: t.assigneeTeamId ?? null,
      status: t.status,
      priority: t.priority,
      title: t.title,
      description: t.description ?? null,
      slaAckDeadline: t.ackDueAt ?? null,
      slaResolveDeadline: t.resolveDueAt ?? null,
      contractId: t.contractId ?? null,
      contractVersion: t.contractVersion ?? null,
      contractSnapshot: t.contractSnapshot ?? null,
    } as any);
    return toDomainTicket(row);
  }
  async update(id: string, patch: any) {
    const row = await this.model.findByPk(id);
    if (!row) throw new NotFoundError('tickets.not_found');
    Object.assign(row, patch);
    await row.save();
    return toDomainTicket(row);
  }
  async findById(id: string) {
    const row = await this.model.findByPk(id);
    return row ? toDomainTicket(row) : null;
  }
  async list(q: TicketListQuery) {
    const where: WhereOptions<Ticket> = {} as any;
    if (q.companyId) (where as any).companyId = q.companyId;
    if (q.siteIds && q.siteIds.length)
      (where as any).siteId = { [Op.in]: q.siteIds } as any;
    if (q.buildingIds && q.buildingIds.length)
      (where as any).buildingId = { [Op.in]: q.buildingIds } as any;
    if (q.reporterId) (where as any).reporterId = q.reporterId;
    if (q.status && q.status.length)
      (where as any).status = { [Op.in]: q.status } as any;
    if (q.priority && q.priority.length)
      (where as any).priority = { [Op.in]: q.priority } as any;
    if (q.categoryIds && q.categoryIds.length)
      (where as any).categoryId = { [Op.in]: q.categoryIds } as any;
    if (q.text) (where as any).title = { [Op.iLike]: `%${q.text}%` } as any;
    const orderField = q.sortBy ?? 'createdAt';
    const orderDir = (q.sortDir ?? 'desc').toUpperCase();
    const limit = q.pageSize;
    const offset = q.page && q.pageSize ? (q.page - 1) * q.pageSize : undefined;
    const { rows, count } = await this.model.findAndCountAll({
      where,
      order: [[orderField as any, orderDir as any]],
      limit,
      offset,
    });
    return { rows: rows.map(toDomainTicket), total: count };
  }
  async setAssignee(id: string, teamId: string | null) {
    await this.model.update({ assigneeTeamId: teamId } as any, {
      where: { id } as any,
    });
  }
  async setStatus(id: string, status: string) {
    await this.model.update({ status } as any, { where: { id } as any });
  }
  async setSlaTargets(
    id: string,
    ackDueAt: Date | null,
    resolveDueAt: Date | null,
  ) {
    await this.model.update(
      { slaAckDeadline: ackDueAt, slaResolveDeadline: resolveDueAt } as any,
      { where: { id } as any },
    );
  }
  async setMilestones(id: string, m: any) {
    await this.model.update(m, { where: { id } as any });
  }
}
