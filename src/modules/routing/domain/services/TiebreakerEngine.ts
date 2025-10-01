import type { EvaluationContext, OrderStrategy } from '../entities/RoutingRule';
import type { GeoQuery, LoadQuery } from '../ports';

export interface Candidate {
  type: 'team' | 'vendor';
  id: string;
}

export class TiebreakerEngine {
  private rrCursor = new Map<string, number>();

  constructor(
    private readonly loadQuery: LoadQuery,
    private readonly geoQuery: GeoQuery,
  ) {}

  async pick(ctx: EvaluationContext, candidates: Candidate[], strategy?: OrderStrategy) {
    const trace = [] as Array<{ strategy: OrderStrategy | 'default_chain'; scores?: Record<string, number>; winnerId?: string }>;
    let list = candidates;
    const apply = async (s: OrderStrategy) => {
      const r = await this.applyStrategy(ctx, list, s);
      trace.push({ strategy: s, scores: r.scores, winnerId: r.winnerId });
      list = r.sorted;
    };

    const chain: OrderStrategy[] = strategy && strategy !== 'as_listed' ? [strategy] : ['least_load', 'nearest', 'round_robin'];
    if (!strategy) trace.push({ strategy: 'default_chain' });
    for (const s of chain) {
      await apply(s);
    }
    return { winner: list[0], trace };
  }

  private async applyStrategy(ctx: EvaluationContext, candidates: Candidate[], s: OrderStrategy) {
    if (s === 'as_listed') return { sorted: candidates, scores: Object.fromEntries(candidates.map((c, i) => [c.id, i])), winnerId: candidates[0]?.id };
    if (s === 'least_load') return this.byLeastLoad(candidates);
    if (s === 'nearest') return this.byNearest(ctx, candidates);
    if (s === 'round_robin') return this.byRoundRobin(ctx, candidates);
    return { sorted: candidates, scores: {}, winnerId: candidates[0]?.id };
  }

  private async byLeastLoad(candidates: Candidate[]) {
    const scores: Record<string, number> = {};
    for (const c of candidates) {
      if (c.type === 'team') {
        try {
          scores[c.id] = await this.loadQuery.currentOpenLoad(c.id);
        } catch {
          scores[c.id] = 0;
        }
      } else {
        scores[c.id] = 0; // vendors treated as zero load
      }
    }
    const sorted = [...candidates].sort((a, b) => (scores[a.id] - scores[b.id]) || a.id.localeCompare(b.id));
    return { sorted, scores, winnerId: sorted[0]?.id };
  }

  private async byNearest(ctx: EvaluationContext, candidates: Candidate[]) {
    const scores: Record<string, number> = {};
    for (const c of candidates) {
      if (c.type === 'team') {
        try {
          scores[c.id] = await this.geoQuery.distance(c.id, { locationId: ctx.locationId });
        } catch {
          scores[c.id] = Number.MAX_SAFE_INTEGER / 2;
        }
      } else {
        scores[c.id] = Number.MAX_SAFE_INTEGER / 2; // vendors deprioritized in proximity
      }
    }
    const sorted = [...candidates].sort((a, b) => (scores[a.id] - scores[b.id]) || a.id.localeCompare(b.id));
    return { sorted, scores, winnerId: sorted[0]?.id };
  }

  private async byRoundRobin(ctx: EvaluationContext, candidates: Candidate[]) {
    const key = `${ctx.contractVersionId}:${ctx.categoryId}`;
    const idx = this.rrCursor.get(key) ?? 0;
    const sorted = [...candidates];
    const rotate = (arr: Candidate[], k: number) => arr.slice(k).concat(arr.slice(0, k));
    const rotated = rotate(sorted, idx % Math.max(1, candidates.length));
    this.rrCursor.set(key, (idx + 1) % Math.max(1, candidates.length));
    const scores: Record<string, number> = Object.fromEntries(rotated.map((c, i) => [c.id, i]));
    return { sorted: rotated, scores, winnerId: rotated[0]?.id };
  }
}
