import type { UUID } from './ports';

// We do not impose a schema on approval rules. Keep unknown and parse defensively.
export type ApprovalRulesJson = unknown;

export interface ThresholdContext {
  ticket: {
    companyId: UUID;
    siteId: UUID;
    buildingId?: UUID | null;
    categoryId: UUID;
    priority: 'P1' | 'P2' | 'P3';
  };
  rules: ApprovalRulesJson;
}

export function parseThresholdEUR(
  rules: ApprovalRulesJson,
  ctx: { priority: 'P1' | 'P2' | 'P3' },
): string | null {
  // Best-effort parser with safe typing. Recognizes simple shapes:
  // - { thresholdEUR: "1000.00" }
  // - { byPriority: { P1: "1000.00", P2: "2000.00" } }
  // Returns null if not found.
  if (!rules || typeof rules !== 'object') return null;
  const r = rules as Record<string, unknown>;
  const direct = r['thresholdEUR'];
  if (typeof direct === 'string' && direct.length > 0) return direct;
  const byPriority = r['byPriority'];
  if (byPriority && typeof byPriority === 'object') {
    const p = (byPriority as Record<string, unknown>)[ctx.priority];
    if (typeof p === 'string' && p.length > 0) return p;
  }
  return null;
}

export function shouldTriggerApproval(
  amountEUR: string | null,
  context: ThresholdContext,
): boolean {
  if (!amountEUR) return false;
  const threshold = parseThresholdEUR(context.rules, {
    priority: context.ticket.priority,
  });
  if (!threshold) return false;
  // Compare as decimals represented as strings; convert to numbers safely (no fractions beyond 2 decimals expected)
  const a = Number(amountEUR);
  const t = Number(threshold);
  if (!Number.isFinite(a) || !Number.isFinite(t)) return false;
  return a >= t;
}

export function shouldKeepBlockedOnReject(_rules: ApprovalRulesJson): boolean {
  // If rules require further review on rejection, they could include a flag:
  // { keepBlockedOnReject: true }
  if (!_rules || typeof _rules !== 'object') return false;
  const r = _rules as Record<string, unknown>;
  return r['keepBlockedOnReject'] === true;
}
