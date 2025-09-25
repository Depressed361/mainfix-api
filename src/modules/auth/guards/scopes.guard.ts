import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { SCOPES_KEY } from '../decorators/scopes.decorator';
import type { AuthenticatedActor } from '../auth-actor.types';

interface ScopeAwareRequest extends Request {
  actor?: AuthenticatedActor;
  user?: AuthenticatedActor;
}

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<ScopeAwareRequest>();
    const actor = req.actor ?? req.user;
    if (!actor) throw new UnauthorizedException('Missing actor context');

    const requiredScopes =
      this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (requiredScopes.length === 0) return true;

    if (actor.scopeStrings.includes('admin:super')) {
      return true;
    }

    const hasAll = requiredScopes.every((scope) =>
      actor.scopeStrings.includes(scope),
    );
    if (!hasAll) {
      throw new ForbiddenException('Missing required scope');
    }

    const companyId = this.extractCompanyId(req);
    if (companyId) {
      const canAccess =
        actor.scopeStrings.includes('admin:super') ||
        actor.companyScopeIds.includes(companyId);
      if (!canAccess) {
        throw new ForbiddenException('Company scope mismatch');
      }
    }

    const siteId = this.extractSiteId(req);
    if (siteId) {
      const canAccess =
        actor.scopeStrings.includes('admin:super') ||
        actor.siteScopeIds.includes(siteId);
      if (!canAccess) {
        throw new ForbiddenException('Site scope mismatch');
      }
    }

    const buildingId = this.extractBuildingId(req);
    if (buildingId) {
      const canAccess =
        actor.scopeStrings.includes('admin:super') ||
        actor.buildingScopeIds.includes(buildingId);
      if (!canAccess) {
        throw new ForbiddenException('Building scope mismatch');
      }
    }

    return true;
  }

  private extractCompanyId(req: Request) {
    return (
      req.params?.companyId ??
      (req.params as Record<string, any>)?.company_id ??
      (req.query as Record<string, any>)?.companyId ??
      (req.query as Record<string, any>)?.company_id ??
      (req.body as Record<string, any>)?.companyId ??
      (req.body as Record<string, any>)?.company_id
    );
  }

  private extractSiteId(req: Request) {
    return (
      req.params?.siteId ??
      (req.params as Record<string, any>)?.site_id ??
      (req.query as Record<string, any>)?.siteId ??
      (req.query as Record<string, any>)?.site_id ??
      (req.body as Record<string, any>)?.siteId ??
      (req.body as Record<string, any>)?.site_id
    );
  }

  private extractBuildingId(req: Request) {
    return (
      req.params?.buildingId ??
      (req.params as Record<string, any>)?.building_id ??
      (req.query as Record<string, any>)?.buildingId ??
      (req.query as Record<string, any>)?.building_id ??
      (req.body as Record<string, any>)?.buildingId ??
      (req.body as Record<string, any>)?.building_id
    );
  }
}
