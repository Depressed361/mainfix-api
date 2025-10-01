import type { EvaluationContext, RoutingCondition } from '../entities/RoutingRule';

export class ConditionMatcher {
  matches(ctx: EvaluationContext, cond: RoutingCondition): boolean {
    // anyOf (OR) support
    if (cond.anyOf && cond.anyOf.length > 0) {
      return cond.anyOf.some((c) => this.matches(ctx, c));
    }

    if (cond.categoryId && cond.categoryId !== ctx.categoryId) return false;
    if (cond.priorityIn && ctx.priority !== undefined && !cond.priorityIn.includes(ctx.priority)) return false;
    if (cond.buildingId && cond.buildingId !== ctx.buildingId) return false;
    if (cond.locationId && cond.locationId !== ctx.locationId) return false;
    if (cond.assetKindIn && (ctx.assetKind === undefined || !cond.assetKindIn.includes(ctx.assetKind))) return false;
    if (cond.timeWindow && cond.timeWindow !== ctx.timeWindow) return false;
    if (cond.tagsAnyOf && (!ctx.tags || !cond.tagsAnyOf.some((t) => ctx.tags!.includes(t)))) return false;

    return true;
  }
}

