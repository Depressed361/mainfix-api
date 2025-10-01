import { InjectModel } from '@nestjs/sequelize';
import type { AdminScopeRepository, AdminScopeEntity, AdminScopeType } from '../domain/ports';
import { AdminScope } from '../models/admin-scope.model';
import { toDomainAdminScope } from './mappers';

export class SequelizeAdminScopeRepository implements AdminScopeRepository {
  constructor(@InjectModel(AdminScope) private readonly model: typeof AdminScope) {}
  async grant(s: Omit<AdminScopeEntity, 'createdAt'>): Promise<AdminScopeEntity> {
    const existing = await this.model.findOne({ where: { userId: s.userId, scope: s.scope as any, companyId: s.companyId ?? null, siteId: s.siteId ?? null, buildingId: s.buildingId ?? null } as any });
    if (existing) return toDomainAdminScope(existing);
    const row = await this.model.create({ userId: s.userId, scope: s.scope as any, companyId: s.companyId ?? null, siteId: s.siteId ?? null, buildingId: s.buildingId ?? null } as any);
    return toDomainAdminScope(row);
  }
  async revoke(s: Omit<AdminScopeEntity, 'createdAt'>): Promise<void> {
    await this.model.destroy({ where: { userId: s.userId, scope: s.scope as any, companyId: s.companyId ?? null, siteId: s.siteId ?? null, buildingId: s.buildingId ?? null } as any });
  }
  async listByUser(userId: string): Promise<AdminScopeEntity[]> { const rows = await this.model.findAll({ where: { userId } as any }); return rows.map(toDomainAdminScope) }
  async has(userId: string, scope: AdminScopeType, target?: { companyId?: string | null; siteId?: string | null; buildingId?: string | null }): Promise<boolean> {
    const row = await this.model.findOne({ where: { userId, scope: scope as any, companyId: target?.companyId ?? null, siteId: target?.siteId ?? null, buildingId: target?.buildingId ?? null } as any });
    return !!row;
  }
}

