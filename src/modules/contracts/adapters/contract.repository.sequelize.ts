import { InjectModel } from '@nestjs/sequelize';
import type { ContractRepository } from '../domain/ports';
import type { ContractEntity } from '../domain/entities/Contract';
import { Contract } from '../models/contract.model';
import { toDomainContract } from './mappers';

export class SequelizeContractRepository implements ContractRepository {
  constructor(@InjectModel(Contract) private readonly model: typeof Contract) {}
  async create(p: Omit<ContractEntity, 'id' | 'active'> & { active?: boolean }): Promise<ContractEntity> {
    const row = await this.model.create({ siteId: p.siteId, providerCompanyId: p.providerCompanyId ?? null, name: p.name, active: p.active ?? true } as any);
    return toDomainContract(row);
  }
  async update(id: string, patch: Partial<Omit<ContractEntity, 'id'>>): Promise<ContractEntity> {
    const row = await this.model.findByPk(id);
    if (!row) throw new Error('contracts.contract.not_found');
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.providerCompanyId !== undefined) (row as any).providerCompanyId = patch.providerCompanyId;
    await row.save();
    return toDomainContract(row);
  }
  async archive(id: string): Promise<void> {
    const row = await this.model.findByPk(id);
    if (!row) return;
    row.active = false; await row.save();
  }
  async findById(id: string): Promise<ContractEntity | null> {
    const row = await this.model.findByPk(id);
    return row ? toDomainContract(row) : null;
  }
  async listBySite(siteId: string): Promise<ContractEntity[]> {
    const rows = await this.model.findAll({ where: { siteId } as any, order: [['name', 'ASC']] });
    return rows.map(toDomainContract);
  }
}

