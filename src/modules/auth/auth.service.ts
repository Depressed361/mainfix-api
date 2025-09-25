import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../directory/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  companyId?: string;
  siteId?: string;
}

type FullUser = AuthUser & { passwordHash: string };

function isFullUser(value: unknown): value is FullUser {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.email === 'string' &&
    typeof v.role === 'string' &&
    typeof v.passwordHash === 'string'
  );
}

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const maybeExisting: unknown = await this.users.findByEmail(dto.email);
    if (isFullUser(maybeExisting)) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const createdUnknown: unknown = await this.users.create({
      email: dto.email,
      passwordHash,
      role: 'occupant',
      companyId: dto.companyId,
      siteId: dto.siteId,
    });

    if (!isFullUser(createdUnknown)) {
      // Défensif: si le repo renvoie une forme inattendue
      throw new UnauthorizedException('Failed to create user');
    }

    return this.sign(createdUnknown);
  }

  async login(dto: LoginDto) {
    const maybeUser: unknown = await this.users.findByEmail(dto.email);
    if (!isFullUser(maybeUser)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, maybeUser.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.sign(maybeUser);
  }

  private sign(user: AuthUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      siteId: user.siteId,
    };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        siteId: user.siteId,
      },
    };
  }
}
