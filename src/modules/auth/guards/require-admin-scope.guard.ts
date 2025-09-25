import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import {
  ADMIN_SCOPE_KEY,
  AdminScopeRequirement,
} from '../decorators/admin-scope.decorator';
import { AdminScopeEvaluatorService } from '../admin-scope-evaluator.service';
import type { AuthenticatedActor } from '../auth-actor.types';

@Injectable()
export class RequireAdminScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly evaluator: AdminScopeEvaluatorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirements = this.reflector.getAllAndOverride<
      AdminScopeRequirement[]
    >(ADMIN_SCOPE_KEY, [context.getHandler(), context.getClass()]);

    // No specific scope requirement -> let the request pass (role guard should still run).
    if (!requirements || requirements.length === 0) return true;

    const req = context
      .switchToHttp()
      .getRequest<Request & { actor?: AuthenticatedActor }>();
    const actor = req.actor;

    if (!actor) throw new UnauthorizedException('Missing actor context');
    if (actor.role !== 'admin')
      throw new ForbiddenException('Requires admin role');

    for (const requirement of requirements) {
      if (requirement.type === 'platform') {
        const allowed: boolean = this.evaluator.hasPlatformScope(actor);
        if (!allowed) {
          throw new ForbiddenException('Insufficient admin scope');
        }
        continue;
      }

      if (!requirement.param) {
        throw new BadRequestException(
          `Missing parameter mapping for scope type ${requirement.type}`,
        );
      }

      const resourceId = this.extractResourceId(req, requirement);
      if (!resourceId) {
        if (requirement.optional) continue;
        throw new BadRequestException(
          `Missing identifier for ${requirement.type}`,
        );
      }

      const allowed = await this.isAllowed(actor, requirement.type, resourceId);
      if (!allowed) {
        throw new ForbiddenException('Insufficient admin scope');
      }
    }

    return true;
  }

  private extractResourceId(req: Request, requirement: AdminScopeRequirement) {
    const { param } = requirement;
    if (!param) return undefined;

    const sourceValue =
      req.params?.[param] ??
      req.query?.[param] ??
      (req.body as Record<string, any>)?.[param];

    if (typeof sourceValue === 'string' && sourceValue.length > 0)
      return sourceValue;
    if (Array.isArray(sourceValue) && sourceValue.length > 0)
      return typeof sourceValue[0] === 'string' ? sourceValue[0] : undefined;
    return undefined;
  }

  private isAllowed(
    actor: AuthenticatedActor,
    type: AdminScopeRequirement['type'],
    id: string,
  ) {
    switch (type) {
      case 'company':
        return this.evaluator.canAccessCompany(actor, id);
      case 'site':
        return this.evaluator.canAccessSite(actor, id);
      case 'building':
        return this.evaluator.canAccessBuilding(actor, id);
      default:
        return Promise.resolve(false);
    }
  }
}
