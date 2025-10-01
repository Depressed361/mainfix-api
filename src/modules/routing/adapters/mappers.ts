import type { RoutingRule as DomainRoutingRule } from '../domain/entities/RoutingRule';
import { RoutingRule as SequelizeRoutingRule } from '../models/routing-rule.model';

export function toDomain(model: SequelizeRoutingRule): DomainRoutingRule {
  return {
    id: model.id,
    contractVersionId: model.contractVersionId,
    priority: model.priority,
    condition: model.condition as DomainRoutingRule['condition'],
    action: model.action as unknown as DomainRoutingRule['action'],
  };
}

export function toPersistence(
  rule: Omit<DomainRoutingRule, 'id'>,
): Partial<SequelizeRoutingRule> {
  return {
    contractVersionId: rule.contractVersionId,
    priority: rule.priority,
    condition: rule.condition as SequelizeRoutingRule['condition'],
    action: rule.action as unknown as SequelizeRoutingRule['action'],
  };
}
