import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule, getModelToken } from '@nestjs/sequelize';
import { SqliteTestingModule } from './utils/slqlite-testing.module';
import { SitesService } from '../src/modules/catalog/services/sites.service';
import { BuildingsService } from '../src/modules/catalog/services/buildings.service';
import { LocationsService } from '../src/modules/catalog/services/locations.service';
import { AssetsService } from '../src/modules/catalog/services/assets.service';
import { Site } from '../src/modules/catalog/models/site.model';
import { Building } from '../src/modules/catalog/models/buildings.model';
import { Location } from '../src/modules/catalog/models/location.model';
import { Asset } from '../src/modules/catalog/models/asset.model';

describe('Catalog Services', () => {
  describe('SitesService', () => {
    let moduleRef: TestingModule;
    let service: SitesService;
    let buildingModel: typeof Building;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          SqliteTestingModule([Site, Building]),
          SequelizeModule.forFeature([Site, Building]),
        ],
        providers: [SitesService],
      }).compile();

      service = moduleRef.get(SitesService);
      buildingModel = moduleRef.get(getModelToken(Building));
    });

    afterAll(async () => {
      await moduleRef.close();
    });

    it('creates and retrieves sites with optional filter', async () => {
      await service.create({
        companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        code: 'PARIS',
        name: 'Paris HQ',
        timezone: 'Europe/Paris',
      });
      await service.create({
        companyId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        code: 'LYON',
        name: 'Lyon Hub',
        timezone: 'Europe/Paris',
      });

      const all = await service.findAll();
      expect(all).toHaveLength(2);

      const filtered = await service.findAll('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.get('code')).toBe('PARIS');
    });

    it('returns site with buildings', async () => {
      const site = await service.create({
        companyId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        code: 'MARSE',
        name: 'Marseille',
        timezone: 'Europe/Paris',
      });

      await buildingModel.create({
        siteId: site.get('id') as string,
        code: 'B1',
        name: 'Main',
      } as any);

      const result = await service.findOneWithBuildings(site.get('id') as string);
      expect(result.site.get('id')).toBe(site.get('id'));
      expect(result.buildings).toHaveLength(1);
    });

    it('removes a site', async () => {
      const site = await service.create({
        companyId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        code: 'DELETE',
        name: 'To delete',
        timezone: 'Europe/Paris',
      });

      const response = await service.remove(site.get('id') as string);
      expect(response).toEqual({ deleted: true });
      await expect(service.findOneWithBuildings(site.get('id') as string)).rejects.toThrow(
        'Site not found',
      );
    });
  });

  describe('BuildingsService', () => {
    let moduleRef: TestingModule;
    let service: BuildingsService;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [SqliteTestingModule([Building]), SequelizeModule.forFeature([Building])],
        providers: [BuildingsService],
      }).compile();

      service = moduleRef.get(BuildingsService);
    });

    afterAll(async () => {
      await moduleRef.close();
    });

    it('creates and fetches a building', async () => {
      const created = await service.create({
        siteId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        code: 'T1',
        name: 'Tower 1',
      });
      const found = await service.findOne(created.get('id') as string);
      expect(found.get('name')).toBe('Tower 1');
    });

    it('removes a building', async () => {
      const toRemove = await service.create({
        siteId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        code: 'TMP',
        name: 'Temporary',
      });
      const response = await service.remove(toRemove.get('id') as string);
      expect(response).toEqual({ deleted: true });
      await expect(service.findOne(toRemove.get('id') as string)).rejects.toThrow('Building not found');
    });
  });

  describe('LocationsService', () => {
    let moduleRef: TestingModule;
    let service: LocationsService;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [SqliteTestingModule([Location]), SequelizeModule.forFeature([Location])],
        providers: [LocationsService],
      }).compile();

      service = moduleRef.get(LocationsService);
    });

    afterAll(async () => {
      await moduleRef.close();
    });

    it('creates, fetches and removes a location', async () => {
      const created = await service.create({
        buildingId: '11111111-2222-3333-4444-555555555555',
        code: 'F1-101',
        description: 'Floor 1 Room 101',
      });

      const fetched = await service.findOne(created.get('id') as string);
      expect(fetched.get('code')).toBe('F1-101');

      const response = await service.remove(created.get('id') as string);
      expect(response).toEqual({ deleted: true });
      await expect(service.findOne(created.get('id') as string)).rejects.toThrow('Location not found');
    });
  });

  describe('AssetsService', () => {
    let moduleRef: TestingModule;
    let service: AssetsService;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [SqliteTestingModule([Asset]), SequelizeModule.forFeature([Asset])],
        providers: [AssetsService],
      }).compile();

      service = moduleRef.get(AssetsService);
    });

    afterAll(async () => {
      await moduleRef.close();
    });

    it('creates, fetches and removes an asset', async () => {
      const created = await service.create({
        companyId: '99999999-8888-7777-6666-555555555555',
        code: 'HVAC-001',
        kind: 'HVAC',
      });

      const fetched = await service.findOne(created.get('id') as string);
      expect(fetched.get('code')).toBe('HVAC-001');

      const response = await service.remove(created.get('id') as string);
      expect(response).toEqual({ deleted: true });
      await expect(service.findOne(created.get('id') as string)).rejects.toThrow('Asset not found');
    });
  });
});
