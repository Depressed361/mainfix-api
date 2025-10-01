import { InjectModel } from '@nestjs/sequelize';
import type { ContractVersionRepository } from '../domain/ports';
import type { ContractVersionEntity } from '../domain/entities/ContractVersion';
import { ContractVersion } from '../models/contract-version.model';
import { toDomainVersion } from './mappers';

export class SequelizeContractVersionRepository implements ContractVersionRepository {
  constructor(@InjectModel(ContractVersion) private readonly model: typeof ContractVersion) {}
  async create(p: Omit<ContractVersionEntity, 'id' | 'createdAt'>): Promise<ContractVersionEntity> {
    const row = await this.model.create({ contractId: p.contractId, version: p.version, coverage: p.coverage as any, escalation: p.escalation as any, approvals: p.approvals as any } as any);
    return toDomainVersion(row);
  }
  async update(id: string, patch: Partial<Omit<ContractVersionEntity, 'id' | 'contractId' | 'version'>>): Promise<ContractVersionEntity> {
    const row = await this.model.findByPk(id);
    if (!row) throw new Error('contracts.version.not_found');
    if (patch.coverage !== undefined) row.coverage = patch.coverage as any;
    if (patch.escalation !== undefined) row.escalation = patch.escalation as any;
    if (patch.approvals !== undefined) row.approvals = patch.approvals as any;
    await row.save();
    return toDomainVersion(row);
  }
  async deleteById(id: string): Promise<void> { await this.model.destroy({ where: { id } as any }); }
  async findById(id: string): Promise<ContractVersionEntity | null> { const row = await this.model.findByPk(id); return row ? toDomainVersion(row) : null; }
  async listByContract(contractId: string): Promise<ContractVersionEntity[]> {
    const rows = await this.model.findAll({ where: { contractId } as any, order: [['version', 'DESC']] });
    return rows.map(toDomainVersion);
  }
  async findByContractAndVersion(contractId: string, version: number): Promise<ContractVersionEntity | null> {
    const row = await this.model.findOne({ where: { contractId, version } as any });
    return row ? toDomainVersion(row) : null;
  }
  async getMaxVersion(contractId: string): Promise<number | null> {
    const row = await this.model.findOne({ where: { contractId } as any, order: [['version', 'DESC']] });
    return row ? row.version : null;
  }
}

