import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedActor } from '../auth-actor.types';

export const AdminContextDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedActor => {
    const request = ctx.switchToHttp().getRequest<Request & { actor?: AuthenticatedActor }>();
    const actor = request.actor;
    if (!actor) {
      throw new UnauthorizedException('Missing actor context');
    }
    return actor;
  },
);
