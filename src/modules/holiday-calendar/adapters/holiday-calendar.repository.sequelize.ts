import { InjectModel } from '@nestjs/sequelize';
import type { HolidayCalendarRepository, HolidayCalendarEntity, Pagination } from '../domain/ports';
import { HolidayCalendar } from '../../calendar/models/holiday-calendar.model';
import { toDomainCalendar } from './mappers';

export class SequelizeHolidayCalendarRepository implements HolidayCalendarRepository {
  constructor(@InjectModel(HolidayCalendar) private readonly model: typeof HolidayCalendar) {}

  async createOrUpdate(p: { code: string; country?: string | null }): Promise<HolidayCalendarEntity> {
    const existing = await this.model.findOne({ where: { code: p.code } as any });
    if (existing) { existing.country = p.country ?? null as any; await existing.save(); return toDomainCalendar(existing) }
    const row = await this.model.create({ code: p.code, country: p.country ?? null } as any);
    return toDomainCalendar(row);
  }

  async findByCode(code: string): Promise<HolidayCalendarEntity | null> {
    const row = await this.model.findOne({ where: { code } as any });
    return row ? toDomainCalendar(row) : null;
  }

  async findById(id: string): Promise<HolidayCalendarEntity | null> {
    const row = await this.model.findByPk(id);
    return row ? toDomainCalendar(row) : null;
  }

  async list(p?: Pagination): Promise<{ rows: HolidayCalendarEntity[]; total: number }> {
    const page = p?.page && p.page > 0 ? p.page : 1;
    const pageSize = p?.pageSize && p.pageSize > 0 ? p.pageSize : 20;
    const offset = (page - 1) * pageSize;
    const { rows, count } = await this.model.findAndCountAll({ order: [['code', 'ASC']], offset, limit: pageSize });
    return { rows: rows.map(toDomainCalendar), total: count };
  }
}

