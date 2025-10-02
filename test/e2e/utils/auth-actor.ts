export const IDs = {
  companyA: '00000000-0000-0000-0000-0000000000a1',
  companyB: '00000000-0000-0000-0000-0000000000b1',
  siteA1: '00000000-0000-0000-0000-0000000000a2',
  siteB1: '00000000-0000-0000-0000-0000000000b2',
  contractA: '00000000-0000-0000-0000-0000000000a3',
  contractB: '00000000-0000-0000-0000-0000000000b3',
  contractVersionA1: '00000000-0000-0000-0000-0000000000a4',
  contractVersionB1: '00000000-0000-0000-0000-0000000000b4',
  buildingA1: '00000000-0000-0000-0000-0000000000a5',
  buildingB1: '00000000-0000-0000-0000-0000000000b5',
  teamA1: '00000000-0000-0000-0000-0000000000a6',
  categoryA1: '00000000-0000-0000-0000-0000000000a7',
};

type Scope =
  | { level: 'company'; companyId: string }
  | { level: 'site'; siteId: string }
  | { level: 'contract'; contractId: string };

type Actor = {
  userId: string;
  companyId: string;
  roles: string[];
  siteIds: string[];
  adminScopes: Scope[];
};

const actors: Record<string, Actor> = {
  companyA_adminAll: {
    userId: 'u-a1',
    companyId: IDs.companyA,
    roles: ['admin'],
    siteIds: [IDs.siteA1],
    adminScopes: [{ level: 'company', companyId: IDs.companyA }],
  },
  companyA_site1: {
    userId: 'u-a2',
    companyId: IDs.companyA,
    roles: ['admin'],
    siteIds: [IDs.siteA1],
    adminScopes: [{ level: 'site', siteId: IDs.siteA1 }],
  },
  companyB_adminAll: {
    userId: 'u-b1',
    companyId: IDs.companyB,
    roles: ['admin'],
    siteIds: [IDs.siteB1],
    adminScopes: [{ level: 'company', companyId: IDs.companyB }],
  },
};

export function asActor(key: keyof typeof actors): string {
  return JSON.stringify(actors[key]);
}

// Build an AuthenticatedActor-compatible object for req.actor/user
export function toAuthenticatedActor(a: Actor) {
  const scopeStrings = new Set<string>();
  const companyScopeIds = new Set<string>();
  const siteScopeIds = new Set<string>();
  const buildingScopeIds = new Set<string>();

  // Basic read scopes typically granted in app
  [
    'category:read',
    'skill:read',
    'contract:read',
    'competency:read',
    'ticket:read',
  ].forEach((s) => scopeStrings.add(s));

  if (a.roles.includes('admin')) {
    a.adminScopes.forEach((s) => {
      if (s.level === 'company') {
        scopeStrings.add('admin:company');
        companyScopeIds.add(s.companyId);
        [
          'category:write',
          'skill:write',
          'contract:write',
          'competency:write',
          'ticket:write',
        ].forEach((cap) => scopeStrings.add(cap));
      }
      if (s.level === 'site') {
        scopeStrings.add('admin:site');
        siteScopeIds.add(s.siteId);
      }
      if (s.level === 'contract') {
        scopeStrings.add('contract:read');
      }
    });
  }

  // Always include actor.companyId as an accessible company scope
  companyScopeIds.add(a.companyId);

  return {
    id: a.userId,
    email: `${a.userId}@test.local`,
    role: a.roles.includes('admin') ? 'admin' : (a.roles[0] ?? 'maintainer'),
    companyId: a.companyId,
    siteId: a.siteIds[0],
    scopes: [],
    scopeStrings: Array.from(scopeStrings),
    companyScopeIds: Array.from(companyScopeIds),
    siteScopeIds: Array.from(siteScopeIds),
    buildingScopeIds: Array.from(buildingScopeIds),
  };
}
