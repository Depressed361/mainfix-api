import type { AssignTarget, RoutingAction } from '../entities/RoutingRule';

export class ActionResolver {
  resolveCandidates(action: RoutingAction): AssignTarget[] {
    const list: AssignTarget[] = [];
    const assign = Array.isArray(action.assign) ? action.assign : [action.assign];
    list.push(...assign);
    if (action.fallback && Array.isArray(action.fallback)) list.push(...action.fallback);
    return list;
  }
}

