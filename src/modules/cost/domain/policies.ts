import type { AdminScopeGuard, DirectoryQuery, TeamsQuery, TicketsQuery, UUID } from './ports';

const DEC = /^(?:\d+)(?:\.\d{1,2})?$/;

export function assertDecimalStringOrUndefined(v: string | undefined, name: string) {
  if (v === undefined) return;
  if (!DEC.test(v)) throw new Error(`cost.decimal.invalid.${name}`);
}

export function mul(a: string, b: string): string {
  const ax = Math.round(Number(a) * 100);
  const bx = Math.round(Number(b) * 100);
  if (!Number.isFinite(ax) || !Number.isFinite(bx)) return '0.00';
  const res = (ax * bx) / 10000;
  return (res / 100).toFixed(2);
}

export function isTravelLike(sku?: string | null, label?: string | null): boolean {
  const sk = (sku ?? '').toUpperCase();
  const lb = (label ?? '').toLowerCase();
  if (sk === 'TRAVEL') return true;
  return /\b(d[eé]placement|travel)\b/.test(lb);
}

export async function assertActorCanWriteCost(
  guard: AdminScopeGuard,
  dirs: DirectoryQuery,
  teams: TeamsQuery,
  tickets: TicketsQuery,
  actorUserId: UUID,
  ticketId: UUID,
): Promise<void> {
  const meta = await tickets.getTicketMeta(ticketId);
  // Status check
  const blocked = ['closed', 'cancelled', 'canceled'];
  if (blocked.includes(meta.status)) throw new Error('cost.ticket.closed');
  // Role/scope
  const role = await dirs.getUserRole(actorUserId);
  const scopeOk = (await guard.canAccessCompany(actorUserId, meta.companyId)) || (await guard.canAccessSite(actorUserId, meta.siteId)) || (meta.buildingId ? await guard.canAccessBuilding(actorUserId, meta.buildingId) : false);
  const inTeam = meta.assigneeTeamId ? await dirs.userIsInTeam(actorUserId, meta.assigneeTeamId) : false;
  const allowedRoles = new Set(['maintainer', 'manager', 'admin']);
  if (!scopeOk && !inTeam) throw new Error('cost.forbidden.scope');
  if (!inTeam && !allowedRoles.has(role)) throw new Error('cost.forbidden.role');
  // If assigned team exists, ensure it is active
  if (meta.assigneeTeamId) {
    const tm = await teams.getTeamMeta(meta.assigneeTeamId);
    if (!tm.active) throw new Error('cost.team.inactive');
  }
}

export function parseApprovalThresholdEUR(rules: Record<string, unknown> | null | undefined): string | null {
  if (!rules || typeof rules !== 'object') return null;
  // Accept shapes like { thresholdEUR: "100.00" } or { cost: { thresholdEUR: "100.00" } }
  const r = rules as Record<string, unknown>;
  const direct = r['thresholdEUR'];
  if (typeof direct === 'string' && DEC.test(direct)) return direct;
  const cost = r['cost'];
  if (cost && typeof cost === 'object') {
    const t = (cost as Record<string, unknown>)['thresholdEUR'];
    if (typeof t === 'string' && DEC.test(t)) return t;
  }
  return null;
}

