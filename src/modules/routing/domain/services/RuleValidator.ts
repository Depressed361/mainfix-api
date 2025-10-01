import { InvalidRuleError } from '../errors';
import type {
  AssignTarget,
  RoutingAction,
  RoutingCondition,
} from '../entities/RoutingRule';

function isUUID(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}
function isNumberArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.every((x) => Number.isInteger(x) && x >= 0);
}

function isAssignTarget(v: unknown): v is AssignTarget {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Partial<AssignTarget>;
  if (obj.type === 'team') return isUUID(obj.teamId);
  if (obj.type === 'vendor') return isUUID(obj.externalVendorId);
  return false;
}

function normalizeAssign(value: AssignTarget | AssignTarget[]): AssignTarget[] {
  return Array.isArray(value) ? value : [value];
}

export class RuleValidator {
  validateCondition(cond: unknown): asserts cond is RoutingCondition {
    if (!cond || typeof cond !== 'object') {
      throw new InvalidRuleError(
        'routing.invalid_rule.condition',
        'Condition must be an object',
      );
    }
    const c = cond as Partial<RoutingCondition>;
    if (c.categoryId !== undefined && !isUUID(c.categoryId))
      throw new InvalidRuleError('routing.invalid_rule.condition.categoryId');
    if (c.priorityIn !== undefined && !isNumberArray(c.priorityIn))
      throw new InvalidRuleError('routing.invalid_rule.condition.priorityIn');
    if (c.buildingId !== undefined && !isUUID(c.buildingId))
      throw new InvalidRuleError('routing.invalid_rule.condition.buildingId');
    if (c.locationId !== undefined && !isUUID(c.locationId))
      throw new InvalidRuleError('routing.invalid_rule.condition.locationId');
    if (c.assetKindIn !== undefined && !isStringArray(c.assetKindIn))
      throw new InvalidRuleError('routing.invalid_rule.condition.assetKindIn');
    if (
      c.timeWindow !== undefined &&
      c.timeWindow !== 'business' &&
      c.timeWindow !== 'after_hours'
    )
      throw new InvalidRuleError('routing.invalid_rule.condition.timeWindow');
    if (c.tagsAnyOf !== undefined && !isStringArray(c.tagsAnyOf))
      throw new InvalidRuleError('routing.invalid_rule.condition.tagsAnyOf');
    if (c.anyOf !== undefined) {
      if (!Array.isArray(c.anyOf) || c.anyOf.length === 0)
        throw new InvalidRuleError('routing.invalid_rule.condition.anyOf');
      for (const sub of c.anyOf) this.validateCondition(sub);
    }
  }

  validateAction(action: unknown): asserts action is RoutingAction {
    if (!action || typeof action !== 'object') {
      throw new InvalidRuleError(
        'routing.invalid_rule.action',
        'Action must be an object',
      );
    }
    const a = action as Partial<RoutingAction>;
    if (!a.assign)
      throw new InvalidRuleError('routing.invalid_rule.action.assign');
    const assignList = normalizeAssign(a.assign);
    if (assignList.length === 0)
      throw new InvalidRuleError('routing.invalid_rule.action.assign.empty');
    for (const t of assignList) {
      if (!isAssignTarget(t))
        throw new InvalidRuleError('routing.invalid_rule.action.assign.target');
    }
    if (
      a.order !== undefined &&
      !['as_listed', 'least_load', 'nearest', 'round_robin'].includes(a.order)
    ) {
      throw new InvalidRuleError('routing.invalid_rule.action.order');
    }
    if (a.fallback !== undefined) {
      if (
        !Array.isArray(a.fallback) ||
        a.fallback.some((t: unknown) => !isAssignTarget(t))
      ) {
        throw new InvalidRuleError('routing.invalid_rule.action.fallback');
      }
    }
  }
}
