import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  companyId?: string;
  siteId?: string;
}

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    companyId?: string;
    siteId?: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException();
    const token = auth.slice(7);
    try {
      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });
      req.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId,
        siteId: payload.siteId,
      };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
