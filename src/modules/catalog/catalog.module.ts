import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Site } from './models/site.model';
import { Building } from './models/buildings.model';
import { Location } from './models/location.model';
import { Asset } from './models/asset.model';

import { BuildingsController } from './controllers/buildings.controller';
import { LocationsController } from './controllers/locations.controller';
import { AssetsController } from './controllers/assets.controller';

import { BuildingsService } from './services/buildings.service';
import { LocationsService } from './services/locations.service';
import { AssetsService } from './services/assets.service';
import { AuthModule } from '../auth/auth.module';
import { SitesController } from './sites/infra/sites.controller';
import { SequelizeSiteRepository } from './sites/adapters/site.repository.sequelize';
import { CreateSite } from './sites/domain/use-cases/CreateSite';
import { GetSite } from './sites/domain/use-cases/GetSite';
import { ListSites } from './sites/domain/use-cases/ListSites';
import { UpdateSite } from './sites/domain/use-cases/UpdateSite';
import { DeleteSite } from './sites/domain/use-cases/DeleteSite';
import type { SiteRepository } from './sites/domain/ports';

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

@Module({
  imports: [
    SequelizeModule.forFeature([Site, Building, Location, Asset]),
    AuthModule,
  ],
  controllers: [
    BuildingsController,
    LocationsController,
    AssetsController,
    SitesController,
  ],
  providers: [
    { provide: 'SiteRepository', useClass: SequelizeSiteRepository },
    ...siteUseCaseProviders,
    BuildingsService,
    LocationsService,
    AssetsService,
  ],
  exports: [SequelizeModule],
})
export class CatalogModule {}
