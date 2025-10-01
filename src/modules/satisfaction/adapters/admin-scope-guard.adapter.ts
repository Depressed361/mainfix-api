import { Inject, Injectable } from '@nestjs/common';
import type { AdminScopeGuard } from '../domain/ports';
import { AuthActorService } from '../../auth/auth-actor.service';
import { AdminScopeEvaluatorService } from '../../auth/admin-scope-evaluator.service';

@Injectable()
export class AdminScopeGuardAdapter implements AdminScopeGuard {
  constructor(
    @Inject(AuthActorService) private readonly actors: AuthActorService,
    @Inject(AdminScopeEvaluatorService)
    private readonly evaluator: AdminScopeEvaluatorService,
  ) {}

  async canAccessCompany(actorUserId: string, companyId: string): Promise<boolean> {
    const actor = await this.actors.loadActor(actorUserId);
    return this.evaluator.canAccessCompany(actor, companyId);
  }

  async canAccessSite(actorUserId: string, siteId: string): Promise<boolean> {
    const actor = await this.actors.loadActor(actorUserId);
    return this.evaluator.canAccessSite(actor, siteId);
  }
}

