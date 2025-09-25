import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class RequireAdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { actor?: { role: string } }>();
    const actor = req.actor;
    if (!actor) throw new UnauthorizedException('Missing actor context');
    if (actor.role !== 'admin') {
      throw new ForbiddenException('Requires admin role');
    }
    return true;
  }
}
