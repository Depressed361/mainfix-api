import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRoutingRuleDto } from '../dto/create-routing-rule.dto';
import { RoutingRule } from '../models/routing-rule.model';

@Injectable()
export class RoutingRulesService {
  constructor(@InjectModel(RoutingRule) private readonly model: typeof RoutingRule) {}

  create(dto: CreateRoutingRuleDto) {
    return this.model.create(dto as any);
  }

  findAll(contractVersionId?: string) {
    return this.model.findAll({
      where: contractVersionId ? ({ contractVersionId } as any) : undefined,
      order: [['priority', 'ASC']],
    });
  }

  async remove(id: string) {
    const r = await this.model.findByPk(id);
    if (!r) throw new NotFoundException('Routing rule not found');
    await r.destroy();
    return { deleted: true };
  }
}
