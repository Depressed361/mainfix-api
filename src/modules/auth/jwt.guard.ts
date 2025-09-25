import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AuthActorService } from './auth-actor.service';
import type { AuthenticatedActor } from './auth-actor.types';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  companyId?: string;
  siteId?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly actorService: AuthActorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { actor?: AuthenticatedActor; user?: AuthenticatedActor }>();
    const token = this.extractToken(req);
    const payload = this.verifyToken(token);
    const actor = await this.actorService.loadActor(payload.sub);

    req.actor = actor;
    req.user = actor;

    return true;
  }

  private extractToken(req: Request): string {
    const header: string | string[] | undefined = req.headers['authorization'];
    if (!header)
      throw new UnauthorizedException('Missing authorization header');

    const value: string = Array.isArray(header) ? header[0] : header;
    if (typeof value !== 'string' || !value.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    return value.slice(7).trim();
  }

  private verifyToken(token: string): JwtPayload {
    try {
      return this.jwt.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'test',
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
