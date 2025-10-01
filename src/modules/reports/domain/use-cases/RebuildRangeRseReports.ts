import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import { GenerateRseReport } from './GenerateRseReport';

export class RebuildRangeRseReports {
  constructor(private readonly generator: GenerateRseReport) {}
  async execute(actor: AuthenticatedActor, p: { companyId: string; periodStart: Date; periodEnd: Date; range?: 'month' | 'quarter' | 'year' }) {
    // Minimal: generate only for the provided range as a single batch (can be expanded to slice by months)
    return this.generator.execute(actor, { companyId: p.companyId, periodStart: p.periodStart, periodEnd: p.periodEnd });
  }
}

