import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { EvaluationContext, EvaluationResult } from '../entities/RoutingRule';
import { EvaluateRouting } from './EvaluateRouting';

export class SimulateRouting {
  constructor(private readonly evaluator: EvaluateRouting) {}

  async execute(actor: AuthenticatedActor, ctx: EvaluationContext): Promise<EvaluationResult> {
    // For now, simulation is same as evaluation but we rely on tiebreaker trace
    return this.evaluator.execute(actor, ctx);
  }
}

