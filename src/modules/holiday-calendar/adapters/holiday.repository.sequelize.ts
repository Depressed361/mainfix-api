import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import type { HolidayRepository, HolidayEntity } from '../domain/ports';
import { Holiday } from '../../calendar/models/holiday.model';
import { toDomainHoliday } from './mappers';

export class SequelizeHolidayRepository implements HolidayRepository {
  constructor(@InjectModel(Holiday) private readonly model: typeof Holiday) {}

  async exists(p: { calendarId: string; day: string }): Promise<boolean> {
    const row = await this.model.findOne({ where: { calendarId: p.calendarId, day: p.day } as any });
    return !!row;
  }

  async upsert(p: { calendarId: string; day: string; label?: string | null }): Promise<HolidayEntity> {
    const existing = await this.model.findOne({ where: { calendarId: p.calendarId, day: p.day } as any });
    if (existing) { existing.label = p.label ?? null as any; await existing.save(); return toDomainHoliday(existing) }
    const row = await this.model.create({ calendarId: p.calendarId, day: p.day, label: p.label ?? null } as any);
    return toDomainHoliday(row);
  }

  async delete(p: { calendarId: string; day: string }): Promise<void> {
    await this.model.destroy({ where: { calendarId: p.calendarId, day: p.day } as any });
  }

  async listInRange(p: { calendarId: string; from: string; to: string }): Promise<HolidayEntity[]> {
    const rows = await this.model.findAll({ where: { calendarId: p.calendarId, day: { [Op.gte]: p.from, [Op.lte]: p.to } } as any, order: [['day', 'ASC']] });
    return rows.map(toDomainHoliday);
  }
}

