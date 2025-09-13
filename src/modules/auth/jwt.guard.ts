import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException();
    const token = auth.slice(7);
    try {
      const payload = this.jwt.verify(token, {
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
