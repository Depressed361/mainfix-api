import { InjectModel } from '@nestjs/sequelize';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import type { UserRepository, UserEntity, Pagination, UserRole } from '../domain/ports';
import { User } from '../models/user.model';
import { toDomainUser } from './mappers';

export class SequelizeUserRepository implements UserRepository {
  constructor(@InjectModel(User) private readonly model: typeof User) {}
  async create(p: Omit<UserEntity, 'id' | 'createdAt' | 'active'> & { active?: boolean }): Promise<UserEntity> {
    const row = await this.model.create({ companyId: p.companyId, email: p.email, displayName: p.displayName, role: p.role as any, siteId: p.siteId ?? null, passwordHash: '' as any, active: p.active ?? true } as any);
    return toDomainUser(row);
  }
  async update(id: string, patch: Partial<Pick<UserEntity, 'displayName' | 'role' | 'siteId' | 'active'>>): Promise<UserEntity> {
    const row = await this.model.findByPk(id); if (!row) throw new Error('directory.user.not_found');
    if (patch.displayName !== undefined) row.displayName = patch.displayName;
    if (patch.role !== undefined) row.role = patch.role as any;
    if (patch.siteId !== undefined) (row as any).siteId = patch.siteId;
    if (patch.active !== undefined) row.active = patch.active;
    await row.save();
    return toDomainUser(row);
  }
  async findById(id: string): Promise<UserEntity | null> { const row = await this.model.findByPk(id); return row ? toDomainUser(row) : null }
  async findByEmail(email: string): Promise<UserEntity | null> { const row = await this.model.findOne({ where: { email } as any }); return row ? toDomainUser(row) : null }
  async listByCompany(companyId: string, q?: { role?: UserRole; active?: boolean; search?: string } & Pagination): Promise<UserEntity[]> {
    const where: WhereOptions<User> = { companyId } as any;
    if (q?.role) (where as any).role = q.role as any;
    if (q?.active !== undefined) (where as any).active = q.active;
    if (q?.search) (where as any).displayName = { [Op.iLike]: `%${q.search}%` };
    const limit = q?.pageSize; const offset = q?.page && q?.pageSize ? (q.page - 1) * q.pageSize : undefined;
    const rows = await this.model.findAll({ where, order: [['displayName', 'ASC']], limit, offset });
    return rows.map(toDomainUser);
  }
  async deleteById(id: string): Promise<void> { await this.model.destroy({ where: { id } as any }) }
}

