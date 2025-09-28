import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Site } from './models/site.model';
import { Building } from './models/buildings.model';
import { Location } from './models/location.model';
import { Asset } from './models/asset.model';

import { AuthModule } from '../auth/auth.module';
import { SitesController } from './sites/infra/sites.controller';
import { SequelizeSiteRepository } from './sites/adapters/site.repository.sequelize';
import { CreateSite } from './sites/domain/use-cases/CreateSite';
import { GetSite } from './sites/domain/use-cases/GetSite';
import { ListSites } from './sites/domain/use-cases/ListSites';
import { UpdateSite } from './sites/domain/use-cases/UpdateSite';
import { DeleteSite } from './sites/domain/use-cases/DeleteSite';
import type { SiteRepository } from './sites/domain/ports';
import { BuildingsController } from './buildings/infra/buildings.controller';
import { SequelizeBuildingRepository } from './buildings/adapters/building.repository.sequelize';
import { SequelizeSiteGuard } from './buildings/adapters/site-guard.sequelize';
import { CreateBuilding } from './buildings/domain/use-cases/CreateBuildings';
import { GetBuilding } from './buildings/domain/use-cases/GetBuildings';
import { ListBuildings } from './buildings/domain/use-cases/ListBuildings';
import { UpdateBuilding } from './buildings/domain/use-cases/UpdateBuildings';
import { DeleteBuilding } from './buildings/domain/use-cases/DeleteBuildings';
import type {
  BuildingRepository,
  SiteGuard as BuildingSiteGuard,
} from './buildings/domain/ports';
import { AssetsController } from './assets/infra/assets.controller';
import { SequelizeAssetRepository } from './assets/adapters/asset.repository.sequelize';
import { SequelizeLocationGuard } from './assets/adapters/location-guard.sequelize';
import { SequelizeUniqueCodeGuard } from './assets/adapters/unique-code.guard.sequelize';
import { CreateAsset } from './assets/domain/use-cases/CreateAsset';
import { GetAsset } from './assets/domain/use-cases/GetAsset';
import { ListAssets } from './assets/domain/use-cases/ListAssets';
import { UpdateAsset } from './assets/domain/use-cases/UpdateAsset';
import { DeleteAsset } from './assets/domain/use-cases/DeleteAsset';
import type {
  AssetRepository,
  LocationGuard,
  UniqueCodeGuard,
} from './assets/domain/ports';

const assetUseCaseProviders = [
  {
    provide: CreateAsset,
    useFactory: (
      repo: AssetRepository,
      locGuard: LocationGuard,
      uniqGuard: UniqueCodeGuard,
    ) => new CreateAsset(repo, locGuard, uniqGuard),
    inject: ['AssetRepository', 'LocationGuard', 'UniqueCodeGuard'],
  },
  {
    provide: GetAsset,
    useFactory: (repo: AssetRepository) => new GetAsset(repo),
    inject: ['AssetRepository'],
  },
  {
    provide: ListAssets,
    useFactory: (repo: AssetRepository) => new ListAssets(repo),
    inject: ['AssetRepository'],
  },
  {
    provide: UpdateAsset,
    useFactory: (
      repo: AssetRepository,
      locGuard: LocationGuard,
      uniqGuard: UniqueCodeGuard,
    ) => new UpdateAsset(repo, locGuard, uniqGuard),
    inject: ['AssetRepository', 'LocationGuard', 'UniqueCodeGuard'],
  },
  {
    provide: DeleteAsset,
    useFactory: (repo: AssetRepository) => new DeleteAsset(repo),
    inject: ['AssetRepository'],
  },
];
const siteUseCaseProviders = [
  {
    provide: CreateSite,
    useFactory: (repo: SiteRepository) => new CreateSite(repo),
    inject: ['SiteRepository'],
  },
  {
    provide: GetSite,
    useFactory: (repo: SiteRepository) => new GetSite(repo),
    inject: ['SiteRepository'],
  },
  {
    provide: ListSites,
    useFactory: (repo: SiteRepository) => new ListSites(repo),
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
];
const buildingUseCaseProviders = [
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
];

@Module({
  imports: [
    SequelizeModule.forFeature([Site, Building, Location, Asset]),
    AuthModule,
  ],
  controllers: [SitesController, BuildingsController, AssetsController],
  providers: [
    { provide: 'SiteRepository', useClass: SequelizeSiteRepository },
    { provide: 'BuildingRepository', useClass: SequelizeBuildingRepository },
    { provide: 'SiteGuard', useClass: SequelizeSiteGuard },
    { provide: 'AssetRepository', useClass: SequelizeAssetRepository },
    { provide: 'LocationGuard', useClass: SequelizeLocationGuard },
    { provide: 'UniqueCodeGuard', useClass: SequelizeUniqueCodeGuard },
    ...assetUseCaseProviders,
    ...siteUseCaseProviders,
    ...buildingUseCaseProviders,
  ],
  exports: [SequelizeModule],
})
export class CatalogModule {}
