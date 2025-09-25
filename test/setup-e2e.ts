import {
  INestApplication,
  CanActivate,
  ExecutionContext,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { AdminScope } from '../src/modules/directory/models/admin-scope.model';
import type { AuthenticatedActor } from '../src/modules/auth/auth-actor.types';
import { JwtAuthGuard } from '../src/modules/auth/jwt.guard';
import { RequireAdminRoleGuard } from '../src/modules/auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../src/modules/auth/guards/require-admin-scope.guard';
import { ScopesGuard } from '../src/modules/auth/guards/scopes.guard';

dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  ),
});

console.log('[E2E DB check]', {
  host: process.env.TEST_DB_HOST,
  port: process.env.TEST_DB_PORT,
  user: process.env.TEST_DB_USER,
  passType: typeof process.env.TEST_DB_PASS,
  name: process.env.TEST_DB_NAME,
});

const baseSuper: AuthenticatedActor = {
  id: 'super-admin-test',
  email: 'super@test.local',
  role: 'admin',
  companyId: 'placeholder',
  siteId: undefined,
  scopes: [],
  scopeStrings: ['admin:super'],
  companyScopeIds: [],
  siteScopeIds: [],
  buildingScopeIds: [],
};

const baseCompanyAdmin: AuthenticatedActor = {
  id: 'company-admin-test',
  email: 'company@test.local',
  role: 'admin',
  companyId: 'placeholder',
  siteId: undefined,
  scopes: [],
  scopeStrings: [
    'admin:company',
    'category:read',
    'category:write',
    'skill:read',
    'skill:write',
    'contract:read',
    'contract:write',
    'competency:read',
    'competency:write',
    'ticket:read',
    'ticket:write',
  ],
  companyScopeIds: [],
  siteScopeIds: [],
  buildingScopeIds: [],
};

function buildActor(kind: 'super-admin' | 'company-admin', companyId?: string) {
  const source = kind === 'super-admin' ? baseSuper : baseCompanyAdmin;
  const resolvedCompanyId = companyId ?? source.companyId;
  return {
    ...source,
    companyId: resolvedCompanyId,
    companyScopeIds: resolvedCompanyId ? [resolvedCompanyId] : [],
  } as AuthenticatedActor;
}

class TestJwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Record<string, any>>();
    const actorHeader =
      (req.headers['x-test-actor'] as string) || 'company-admin';
    const companyHeaderRaw = req.headers['x-company-id'] as string | undefined;
    const companyHeader =
      companyHeaderRaw && companyHeaderRaw.length > 0
        ? companyHeaderRaw
        : undefined;
    const userHeaderRaw = req.headers['x-test-user-id'] as string | undefined;
    const userHeader =
      userHeaderRaw && userHeaderRaw.length > 0 ? userHeaderRaw : undefined;
    const actor = buildActor(
      actorHeader as 'super-admin' | 'company-admin',
      companyHeader,
    );
    if (userHeader) {
      actor.id = userHeader;
      const scopes = await AdminScope.findAll({
        where: { userId: userHeader },
      });
      console.log(
        'TestJwtGuard scopes',
        scopes.map((entry) => ({
          scope: entry.scope,
          companyId: entry.companyId,
          siteId: entry.siteId,
          buildingId: entry.buildingId,
        })),
      );
      const companyScopes = scopes
        .filter((entry) => entry.scope === 'company' && entry.companyId)
        .map((entry) => entry.companyId!);
      const siteScopes = scopes
        .filter((entry) => entry.scope === 'site' && entry.siteId)
        .map((entry) => entry.siteId!);
      const buildingScopes = scopes
        .filter((entry) => entry.scope === 'building' && entry.buildingId)
        .map((entry) => entry.buildingId!);
      actor.companyScopeIds = Array.from(
        new Set([...actor.companyScopeIds, ...companyScopes]),
      );
      actor.siteScopeIds = Array.from(
        new Set([...actor.siteScopeIds, ...siteScopes]),
      );
      actor.buildingScopeIds = Array.from(
        new Set([...actor.buildingScopeIds, ...buildingScopes]),
      );
    }
    if (companyHeader) {
      actor.companyId = companyHeader;
      if (!actor.companyScopeIds.includes(companyHeader)) {
        actor.companyScopeIds = [...actor.companyScopeIds, companyHeader];
      }
    } else if (actor.companyScopeIds.length > 0) {
      [actor.companyId] = actor.companyScopeIds;
    }
    req.actor = actor;
    req.user = actor;
    return true;
  }
}
class AllowGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

export async function createE2EApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(JwtAuthGuard)
    .useClass(TestJwtGuard)
    .overrideGuard(RequireAdminRoleGuard)
    .useClass(AllowGuard)
    .overrideGuard(RequireAdminScopeGuard)
    .useClass(AllowGuard)
    .overrideGuard(ScopesGuard)
    .useClass(AllowGuard)
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}
