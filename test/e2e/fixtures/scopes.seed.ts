import { INestApplication } from '@nestjs/common';
import { Company } from '../../../src/modules/companies/company.model';
import { Site } from '../../../src/modules/catalog/models/site.model';
import { Building } from '../../../src/modules/catalog/models/buildings.model';
import { Contract } from '../../../src/modules/contracts/models/contract.model';
import { ContractVersion } from '../../../src/modules/contracts/models/contract-version.model';
import { Category } from '../../../src/modules/taxonomy/models/category.model';
import { Team } from '../../../src/modules/directory/models/team.model';
import { TeamZone } from '../../../src/modules/competency/models/team-zone.model';
import { CompetencyMatrix } from '../../../src/modules/competency/models/competency-matrix.model';
import { RoutingRule } from '../../../src/modules/routing/models/routing-rule.model';
import { IDs } from '../utils/auth-actor';

export async function seedScopesFixture(_app: INestApplication) {
  // Companies
  await Company.upsert({ id: IDs.companyA, name: 'Company A' } as any);
  await Company.upsert({ id: IDs.companyB, name: 'Company B' } as any);

  // Sites
  await Site.upsert({ id: IDs.siteA1, companyId: IDs.companyA, code: 'A1', name: 'Site A1', timezone: 'Europe/Paris' } as any);
  await Site.upsert({ id: IDs.siteB1, companyId: IDs.companyB, code: 'B1', name: 'Site B1', timezone: 'Europe/Paris' } as any);

  // Buildings
  await Building.upsert({ id: IDs.buildingA1, siteId: IDs.siteA1, code: 'BA1', name: 'Building A1' } as any);
  await Building.upsert({ id: IDs.buildingB1, siteId: IDs.siteB1, code: 'BB1', name: 'Building B1' } as any);

  // Contracts
  await Contract.upsert({ id: IDs.contractA, siteId: IDs.siteA1, name: 'CA', active: true } as any);
  await Contract.upsert({ id: IDs.contractB, siteId: IDs.siteB1, name: 'CB', active: true } as any);

  // Contract versions
  await ContractVersion.upsert({
    id: IDs.contractVersionA1,
    contractId: IDs.contractA,
    version: 1,
    coverage: { timeWindows: ['business_hours'] },
  } as any);
  await ContractVersion.upsert({
    id: IDs.contractVersionB1,
    contractId: IDs.contractB,
    version: 1,
    coverage: { timeWindows: ['business_hours'] },
  } as any);

  // Taxonomy (company-scoped)
  await Category.upsert({ id: IDs.categoryA1, companyId: IDs.companyA, key: 'hvac', label: 'HVAC' } as any);

  // Team & competency (company A)
  await Team.upsert({ id: IDs.teamA1, companyId: IDs.companyA, name: 'Team A1', type: 'internal', active: true } as any);
  await TeamZone.upsert({ teamId: IDs.teamA1, buildingId: IDs.buildingA1 } as any);
  await CompetencyMatrix.upsert({
    contractVersionId: IDs.contractVersionA1,
    teamId: IDs.teamA1,
    categoryId: IDs.categoryA1,
    buildingId: IDs.buildingA1,
    level: 'primary',
    window: 'business_hours',
  } as any);

  // Routing rule sur contractVersion A1 (best-effort)
  try {
    await RoutingRule.upsert({
      id: '00000000-0000-0000-0000-00000000rrA',
      contractVersionId: IDs.contractVersionA1,
      priority: 100,
      condition: { timeWindow: 'business' },
      action: { assign: { type: 'team', teamId: IDs.teamA1 } },
    } as any);
  } catch {
    // ignore if schema differs; not critical for scope tests
  }
}
