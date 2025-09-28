import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedActor } from '../auth-actor.types';

interface CompanyScopedRequest extends Request {
  actor?: AuthenticatedActor;
  companyId?: string;
}

@Injectable()
export class CompanyScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<CompanyScopedRequest>();
    const actor = req.actor;
    if (!actor) {
      throw new UnauthorizedException('taxonomy.auth.missing_actor');
    }

    const requestedCompanyId =
      req.params?.companyId ||
      (typeof (req.query as Record<string, unknown>)?.companyId === 'string'
        ? ((req.query as Record<string, unknown>).companyId as string)
        : undefined) ||
      (typeof (req.body as Record<string, unknown>)?.companyId === 'string'
        ? ((req.body as Record<string, unknown>).companyId as string)
        : undefined) ||
      actor.companyId;

    if (!requestedCompanyId) {
      throw new ForbiddenException('taxonomy.company_scope.missing_company');
    }

    if (this.hasAccess(actor, requestedCompanyId)) {
      req.companyId = requestedCompanyId;
      return true;
    }

    throw new ForbiddenException('taxonomy.company_scope.denied');
  }

  private hasAccess(actor: AuthenticatedActor, companyId: string): boolean {
    if (actor.scopeStrings.includes('admin:super')) return true;
    if (actor.companyScopeIds.includes(companyId)) return true;
    return actor.companyId === companyId;
  }
}
