import type { AdminScopeGuard, ApprovalRequestEntity, ApprovalRequestRepository, ApprovalStatus, UUID } from '../ports';

export class ListApprovalRequests {
  constructor(
    private readonly approvals: ApprovalRequestRepository,
    private readonly guard: AdminScopeGuard,
  ) {}

  async execute(actorUserId: UUID, q: { companyId?: UUID; siteIds?: UUID[]; buildingIds?: UUID[]; status?: ApprovalStatus[]; from?: Date; to?: Date; page?: number; pageSize?: number; }): Promise<{ rows: ApprovalRequestEntity[]; total: number }> {
    // Enforce admin scopes for each perimeter filter
    if (q.companyId) {
      const ok = await this.guard.canAccessCompany(actorUserId, q.companyId);
      if (!ok) return { rows: [], total: 0 };
    }
    if (q.siteIds && q.siteIds.length) {
      for (const s of q.siteIds) {
        const ok = await this.guard.canAccessSite(actorUserId, s);
        if (!ok) return { rows: [], total: 0 };
      }
    }
    if (q.buildingIds && q.buildingIds.length) {
      for (const b of q.buildingIds) {
        const ok = await this.guard.canAccessBuilding(actorUserId, b);
        if (!ok) return { rows: [], total: 0 };
      }
    }
    return this.approvals.list(q);
  }
}

