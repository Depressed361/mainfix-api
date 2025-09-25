import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { SqliteTestingModule } from './utils/slqlite-testing.module';
import { ContractsService } from '../src/modules/contracts/services/contracts.service';
import { ContractVersionsService } from '../src/modules/contracts/services/contract-versions.service';
import { RoutingRulesService } from '../src/modules/routing/services/routing-rules.service';
import { Contract } from '../src/modules/contracts/models/contract.model';
import { ContractVersion } from '../src/modules/contracts/models/contract-version.model';
import { RoutingRule } from '../src/modules/routing/models/routing-rule.model';

describe('Contracts domain services', () => {
  describe('ContractsService', () => {
    let moduleRef: TestingModule;
    let service: ContractsService;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [SqliteTestingModule([Contract]), SequelizeModule.forFeature([Contract])],
        providers: [ContractsService],
      }).compile();

      service = moduleRef.get(ContractsService);
    });

    afterAll(async () => {
      await moduleRef.close();
    });

    it('creates and fetches a contract', async () => {
      const created = await service.create({
        siteId: '00000000-1111-2222-3333-444444444444',
        name: 'Cleaning',
      });
      const found = await service.findOne(created.get('id') as string);
      expect(found.get('name')).toBe('Cleaning');
    });

    it('filters contracts by site', async () => {
      await service.create({
        siteId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        name: 'Security',
      });
      await service.create({
        siteId: 'ffffffff-1111-2222-3333-444444444444',
        name: 'Landscaping',
      });

      const filtered = await service.findAll('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.get('name')).toBe('Security');
    });

    it('removes a contract', async () => {
      const created = await service.create({
        siteId: '99999999-1111-2222-3333-444444444444',
        name: 'Temporary',
      });
      const response = await service.remove(created.get('id') as string);
      expect(response).toEqual({ deleted: true });
      await expect(service.findOne(created.get('id') as string)).rejects.toThrow('Contract not found');
    });
  });

  describe('ContractVersionsService', () => {
    let moduleRef: TestingModule;
    let service: ContractVersionsService;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          SqliteTestingModule([ContractVersion]),
          SequelizeModule.forFeature([ContractVersion]),
        ],
        providers: [ContractVersionsService],
      }).compile();

      service = moduleRef.get(ContractVersionsService);
    });

    afterAll(async () => {
      await moduleRef.close();
    });

    it('creates and lists versions', async () => {
      const contractId = '12345678-1234-1234-1234-123456789012';
      await service.create(contractId, { version: 1, coverage: { scope: 'full' } });
      await service.create(contractId, { version: 2, coverage: { scope: 'extended' } });

      const versions = await service.findAll(contractId);
      expect(versions).toHaveLength(2);
      expect(versions[0]!.get('version')).toBe(2);
    });

    it('removes a contract version', async () => {
      const contractId = '87654321-4321-4321-4321-210987654321';
      const version = await service.create(contractId, { version: 1, coverage: { scope: 'base' } });
      const response = await service.remove(version.get('id') as string);
      expect(response).toEqual({ deleted: true });
      await expect(service.remove(version.get('id') as string)).rejects.toThrow(
        'Contract version not found',
      );
    });
  });

  describe('RoutingRulesService', () => {
    let moduleRef: TestingModule;
    let service: RoutingRulesService;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [SqliteTestingModule([RoutingRule]), SequelizeModule.forFeature([RoutingRule])],
        providers: [RoutingRulesService],
      }).compile();

      service = moduleRef.get(RoutingRulesService);
    });

    afterAll(async () => {
      await moduleRef.close();
    });

    it('creates and lists routing rules', async () => {
      const versionId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      await service.create({
        contractVersionId: versionId,
        priority: 10,
        condition: { site: 'A' },
        action: { assignTeam: 'TEAM_A' },
      });
      await service.create({
        contractVersionId: versionId,
        priority: 20,
        condition: { site: 'B' },
        action: { assignTeam: 'TEAM_B' },
      });

      const rules = await service.findAll(versionId);
      expect(rules).toHaveLength(2);
      expect(rules[0]!.get('priority')).toBe(10);
    });

    it('removes a routing rule', async () => {
      const rule = await service.create({
        contractVersionId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        priority: 5,
        condition: { priority: 'high' },
        action: { notify: true },
      });

      const response = await service.remove(rule.get('id') as string);
      expect(response).toEqual({ deleted: true });
      await expect(service.remove(rule.get('id') as string)).rejects.toThrow('Routing rule not found');
    });
  });
});
