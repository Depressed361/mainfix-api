import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule, getModelToken } from '@nestjs/sequelize';
import { SqliteTestingModule } from './utils/slqlite-testing.module';
import { CreateSite } from '../src/modules/catalog/sites/domain/use-cases/CreateSite';
import { ListSites } from '../src/modules/catalog/sites/domain/use-cases/ListSites';
import { GetSite } from '../src/modules/catalog/sites/domain/use-cases/GetSite';
import { UpdateSite } from '../src/modules/catalog/sites/domain/use-cases/UpdateSite';
import { DeleteSite } from '../src/modules/catalog/sites/domain/use-cases/DeleteSite';
import { SequelizeSiteRepository } from '../src/modules/catalog/sites/adapters/site.repository.sequelize';
import type { SiteRepository } from '../src/modules/catalog/sites/domain/ports';
import { CreateBuilding } from '../src/modules/catalog/buildings/domain/use-cases/CreateBuilding';
import { GetBuilding } from '../src/modules/catalog/buildings/domain/use-cases/GetBuilding';
import { ListBuildings } from '../src/modules/catalog/buildings/domain/use-cases/ListBuildings';
import { UpdateBuilding } from '../src/modules/catalog/buildings/domain/use-cases/UpdateBuilding';
import { DeleteBuilding } from '../src/modules/catalog/buildings/domain/use-cases/DeleteBuilding';
import { SequelizeBuildingRepository } from '../src/modules/catalog/buildings/adapters/building.repository.sequelize';
import { SequelizeSiteGuard } from '../src/modules/catalog/buildings/adapters/site-guard.sequelize';
import type {
  BuildingRepository,
  SiteGuard as BuildingSiteGuard,
} from '../src/modules/catalog/buildings/domain/ports';
import { LocationsService } from '../src/modules/catalog/services/locations.service';
import { AssetsService } from '../src/modules/catalog/services/assets.service';
import { Site } from '../src/modules/catalog/models/site.model';
import { Building } from '../src/modules/catalog/models/buildings.model';
import { Location } from '../src/modules/catalog/models/location.model';
import { Asset } from '../src/modules/catalog/models/asset.model';

describe('Catalog Services', () => {
  describe('Sites use cases', () => {
    let moduleRef: TestingModule;
    let createSite: CreateSite;
    let listSites: ListSites;
    let getSite: GetSite;
    let updateSite: UpdateSite;
    let deleteSite: DeleteSite;
    let buildingModel: typeof Building;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          SqliteTestingModule([Site, Building]),
          SequelizeModule.forFeature([Site, Building]),
        ],
        providers: [
          { provide: 'SiteRepository', useClass: SequelizeSiteRepository },
          {
            provide: CreateSite,
            useFactory: (repo: SiteRepository) => new CreateSite(repo),
            inject: ['SiteRepository'],
          },
          {
            provide: ListSites,
            useFactory: (repo: SiteRepository) => new ListSites(repo),
            inject: ['SiteRepository'],
          },
          {
            provide: GetSite,
            useFactory: (repo: SiteRepository) => new GetSite(repo),
            inject: ['SiteRepository'],
          },
          {
            provide: UpdateSite,
            useFactory: (repo: SiteRepository) => new UpdateSite(repo),
            inject: ['SiteRepository'],
          },
          {
            provide: DeleteSite,
            useFactory: (repo: SiteRepository) => new DeleteSite(repo),
            inject: ['SiteRepository'],
          },
        ],
      }).compile();

      createSite = moduleRef.get(CreateSite);
      listSites = moduleRef.get(ListSites);
      getSite = moduleRef.get(GetSite);
      updateSite = moduleRef.get(UpdateSite);
      deleteSite = moduleRef.get(DeleteSite);
      buildingModel = moduleRef.get(getModelToken(Building));
    });

    afterAll(async () => {
      await moduleRef.close();
    });

    it('creates and retrieves sites with optional filter', async () => {
      await createSite.exec({
        companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        code: 'PARIS',
        name: 'Paris HQ',
        timezone: 'Europe/Paris',
      });
      await createSite.exec({
        companyId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        code: 'LYON',
        name: 'Lyon Hub',
        timezone: 'Europe/Paris',
      });

      const all = await listSites.exec();
      expect(all.count).toBe(2);
      expect(all.rows).toHaveLength(2);

      const filtered = await listSites.exec({
        companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      });
      expect(filtered.count).toBe(1);
      expect(filtered.rows[0].code).toBe('PARIS');
    });

    it('returns site with buildings', async () => {
      const site = await createSite.exec({
        companyId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        code: 'MARSE',
        name: 'Marseille',
        timezone: 'Europe/Paris',
      });

      await buildingModel.create({
        siteId: site.id,
        code: 'B1',
        name: 'Main',
      } as any);

      const result = await getSite.exec(site.id);
      expect(result.site.id).toBe(site.id);
      expect(result.buildings).toHaveLength(1);
    });

    it('removes a site', async () => {
      const site = await createSite.exec({
        companyId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        code: 'DELETE',
        name: 'To delete',
        timezone: 'Europe/Paris',
      });

      const updated = await updateSite.exec(site.id, { name: 'Updated Name' });
      expect(updated.name).toBe('Updated Name');

      const response = await deleteSite.exec(site.id);
      expect(response).toEqual({ deleted: true });
      await expect(getSite.exec(site.id)).rejects.toThrow('SITE_NOT_FOUND');
    });
  });

  describe('Buildings use cases', () => {
    let moduleRef: TestingModule;
    let createBuilding: CreateBuilding;
    let getBuilding: GetBuilding;
    let listBuildings: ListBuildings;
    let updateBuilding: UpdateBuilding;
    let deleteBuilding: DeleteBuilding;
    let siteModel: typeof Site;
    let buildingModel: typeof Building;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          SqliteTestingModule([Site, Building]),
          SequelizeModule.forFeature([Site, Building]),
        ],
        providers: [
          {
            provide: 'BuildingRepository',
            useClass: SequelizeBuildingRepository,
          },
          { provide: 'SiteGuard', useClass: SequelizeSiteGuard },
          {
            provide: CreateBuilding,
            useFactory: (repo: BuildingRepository, guard: BuildingSiteGuard) =>
              new CreateBuilding(repo, guard),
            inject: ['BuildingRepository', 'SiteGuard'],
          },
          {
            provide: GetBuilding,
            useFactory: (repo: BuildingRepository) => new GetBuilding(repo),
            inject: ['BuildingRepository'],
          },
          {
            provide: ListBuildings,
            useFactory: (repo: BuildingRepository) => new ListBuildings(repo),
            inject: ['BuildingRepository'],
          },
          {
            provide: UpdateBuilding,
            useFactory: (repo: BuildingRepository, guard: BuildingSiteGuard) =>
              new UpdateBuilding(repo, guard),
            inject: ['BuildingRepository', 'SiteGuard'],
          },
          {
            provide: DeleteBuilding,
            useFactory: (repo: BuildingRepository) => new DeleteBuilding(repo),
            inject: ['BuildingRepository'],
          },
        ],
        providers: [BuildingsService],
      }).compile();

      createBuilding = moduleRef.get(CreateBuilding);
      getBuilding = moduleRef.get(GetBuilding);
      listBuildings = moduleRef.get(ListBuildings);
      updateBuilding = moduleRef.get(UpdateBuilding);
      deleteBuilding = moduleRef.get(DeleteBuilding);
      siteModel = moduleRef.get(getModelToken(Site));
      buildingModel = moduleRef.get(getModelToken(Building));
    });

    afterAll(async () => {
      await moduleRef.close();
    });

    beforeEach(async () => {
      await buildingModel.destroy({ where: {} });
      await siteModel.destroy({ where: {} });
    });

    it('creates, lists and retrieves a building', async () => {
      const site = await siteModel.create({
        companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        code: 'SITE-A',
        name: 'Site A',
        timezone: 'Europe/Paris',
      } as any);

      const created = await createBuilding.exec({
        siteId: site.getDataValue('id'),
        name: ' Tower One ',
        code: ' BLD-A ',
      });
      c;
      expect(created.name).toBe('Tower One');
      expect(created.code).toBe('BLD-A');

      const fetched = await getBuilding.exec(created.id);
      expect(fetched.id).toBe(created.id);

      const list = await listBuildings.exec({
        siteId: site.getDataValue('id'),
      });
      expect(list.count).toBe(1);
      expect(list.rows).toHaveLength(1);
      expect(list.rows[0].id).toBe(created.id);
    });

    it('updates and deletes a building', async () => {
      const site = await siteModel.create({
        companyId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        code: 'SITE-B',
        name: 'Site B',
        timezone: 'Europe/Paris',
      } as any);

      const building = await createBuilding.exec({
        siteId: site.getDataValue('id'),
        name: 'Main',
        code: 'MAIN',
      });
      const updated = await updateBuilding.exec(building.id, {
        name: 'Main Updated',
        code: 'MAIN-2',
      });
      expect(updated.name).toBe('Main Updated');
      expect(updated.code).toBe('MAIN-2');

      await deleteBuilding.exec(building.id);

      await expect(getBuilding.exec(building.id)).rejects.toThrow(
        'BUILDING_NOT_FOUND',
      );
    });
    it('prevents site reassignment', async () => {
      const site = await siteModel.create({
        companyId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        code: 'SITE-C',
        name: 'Site C',
        timezone: 'Europe/Paris',
      } as any);

      const otherSite = await siteModel.create({
        companyId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        code: 'SITE-D',
        name: 'Site D',
        timezone: 'Europe/Paris',
      } as any);

      const building = await createBuilding.exec({
        siteId: site.getDataValue('id'),
        name: 'Annex',
        code: 'ANNEX',
      });

      await expect(
        updateBuilding.exec(building.id, {
          siteId: otherSite.getDataValue('id'),
        }),
      ).rejects.toThrow('SITE_CHANGE_FORBIDDEN');
    });
  });

  describe('LocationsService', () => {
    let moduleRef: TestingModule;
    let service: LocationsService;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          SqliteTestingModule([Location]),
          SequelizeModule.forFeature([Location]),
        ],
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

      const fetched = await service.findOne(created.get('id'));
      expect(fetched.get('code')).toBe('F1-101');

      const response = await service.remove(created.get('id'));
      expect(response).toEqual({ deleted: true });
      await expect(service.findOne(created.get('id'))).rejects.toThrow(
        'Location not found',
      );
    });
  });

  describe('AssetsService', () => {
    let moduleRef: TestingModule;
    let service: AssetsService;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          SqliteTestingModule([Asset]),
          SequelizeModule.forFeature([Asset]),
        ],
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

      const fetched = await service.findOne(created.get('id'));
      expect(fetched.get('code')).toBe('HVAC-001');

      const response = await service.remove(created.get('id'));
      expect(response).toEqual({ deleted: true });
      await expect(service.findOne(created.get('id'))).rejects.toThrow(
        'Asset not found',
      );
    });
  });
});
