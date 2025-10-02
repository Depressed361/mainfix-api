import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UsersService } from '../directory/users/users.service';
import { AdminScope } from '../directory/models/admin-scope.model';
import { AuthenticatedActor, AdminScopePayload } from './auth-actor.types';

const CAPABILITY_SCOPES = [
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
];

@Injectable()
export class AuthActorService {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(AdminScope)
    private readonly adminScopeModel: typeof AdminScope,
  ) {}

  async loadActor(userId: string): Promise<AuthenticatedActor> {
    const user = await this.usersService.findById(userId).catch((err) => {
      if (process.env.NODE_ENV === 'test') {
        // Help debugging unexpected 401s in e2e by surfacing context

        console.warn(
          '[AuthActorService.loadActor] test env: user not found',
          userId,
          String(err?.message || err),
        );
      }
      throw new UnauthorizedException('User not found');
    });

    if (!user.active) {
      throw new UnauthorizedException('User disabled');
    }

    let scopes: AdminScopePayload[] = [];
    if (user.role === 'admin') {
      const rows = await this.adminScopeModel.findAll({
        where: { userId },
        order: [['created_at', 'ASC']],
      });
      scopes = rows.map((row) => ({
        scope: row.scope,
        companyId: row.companyId ?? undefined,
        siteId: row.siteId ?? undefined,
        buildingId: row.buildingId ?? undefined,
      }));
    }

    const { scopeStrings, companyScopeIds, siteScopeIds, buildingScopeIds } =
      this.buildScopeIndexes(user.role, scopes, user.companyId ?? undefined);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      siteId: user.siteId ?? undefined,
      scopes,
      scopeStrings,
      companyScopeIds,
      siteScopeIds,
      buildingScopeIds,
    };
  }

  private buildScopeIndexes(
    role: string,
    scopes: AdminScopePayload[],
    defaultCompanyId?: string,
  ) {
    const scopeSet = new Set<string>();
    const companyScopeIds = new Set<string>();
    const siteScopeIds = new Set<string>();
    const buildingScopeIds = new Set<string>();

    const baseReadScopes = [
      'category:read',
      'skill:read',
      'contract:read',
      'competency:read',
      'ticket:read',
    ];
    baseReadScopes.forEach((scope) => scopeSet.add(scope));

    if (role === 'admin') {
      for (const scope of scopes) {
        switch (scope.scope) {
          case 'platform':
            scopeSet.add('admin:super');
            CAPABILITY_SCOPES.forEach((cap) => scopeSet.add(cap));
            break;
          case 'company':
            scopeSet.add('admin:company');
            CAPABILITY_SCOPES.forEach((cap) => scopeSet.add(cap));
            if (scope.companyId) companyScopeIds.add(scope.companyId);
            break;
          case 'site':
            scopeSet.add('admin:site');
            if (scope.siteId) siteScopeIds.add(scope.siteId);
            if (scope.companyId) companyScopeIds.add(scope.companyId);
            break;
          case 'building':
            scopeSet.add('admin:building');
            if (scope.buildingId) buildingScopeIds.add(scope.buildingId);
            if (scope.siteId) siteScopeIds.add(scope.siteId);
            if (scope.companyId) companyScopeIds.add(scope.companyId);
            break;
          default:
            break;
        }
      }
    }

    if (defaultCompanyId) {
      companyScopeIds.add(defaultCompanyId);
    }

    return {
      scopeStrings: Array.from(scopeSet),
      companyScopeIds: Array.from(companyScopeIds),
      siteScopeIds: Array.from(siteScopeIds),
      buildingScopeIds: Array.from(buildingScopeIds),
    };
  }
}
