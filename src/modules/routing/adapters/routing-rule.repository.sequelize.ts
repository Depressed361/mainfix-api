import { InjectModel } from '@nestjs/sequelize';
import type { RoutingRuleRepository } from '../domain/ports';
import type { RoutingRule as DomainRoutingRule } from '../domain/entities/RoutingRule';
import { RoutingRule as SequelizeRoutingRule } from '../models/routing-rule.model';
import { toDomain, toPersistence } from './mappers';

export class SequelizeRoutingRuleRepository implements RoutingRuleRepository {
  constructor(
    @InjectModel(SequelizeRoutingRule)
    private readonly model: typeof SequelizeRoutingRule,
  ) {}

  async create(
    input: Omit<DomainRoutingRule, 'id'>,
  ): Promise<DomainRoutingRule> {
    const created = await this.model.create(
      toPersistence(input) as SequelizeRoutingRule,
    );
    return toDomain(created);
  }

  async update(
    id: string,
    patch: Partial<Omit<DomainRoutingRule, 'id' | 'contractVersionId'>>,
  ): Promise<DomainRoutingRule> {
    const record = await this.model.findByPk(id);
    if (!record) throw new Error('routing.rule.not_found');
    if (patch.priority !== undefined) record.priority = patch.priority;
    if (patch.condition !== undefined)
      record.condition = patch.condition as typeof record.condition;
    if (patch.action !== undefined)
      record.action = patch.action as unknown as typeof record.action;
    await record.save();
    return toDomain(record);
  }

  async deleteById(id: string): Promise<void> {
    await this.model.destroy({ where: { id } });
  }

  async findById(id: string): Promise<DomainRoutingRule | null> {
    const found = await this.model.findByPk(id);
    return found ? toDomain(found) : null;
  }

  async listByContractVersion(
    contractVersionId: string,
  ): Promise<DomainRoutingRule[]> {
    const rows = await this.model.findAll({
      where: { contractVersionId: contractVersionId },
      order: [
        ['priority', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    return rows.map(toDomain);
  }
}
