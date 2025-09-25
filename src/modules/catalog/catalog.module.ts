import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Site } from './models/site.model';
import { Building } from './models/buildings.model';
import { Location } from './models/location.model';
import { Asset } from './models/asset.model';
import { SitesController } from './controllers/sites.controller';
import { BuildingsController } from './controllers/buildings.controller';
import { LocationsController } from './controllers/locations.controller';
import { AssetsController } from './controllers/assets.controller';
import { SitesService } from './services/sites.service';
import { BuildingsService } from './services/buildings.service';
import { LocationsService } from './services/locations.service';
import { AssetsService } from './services/assets.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Site, Building, Location, Asset]),
    AuthModule,
  ],
  controllers: [
    SitesController,
    BuildingsController,
    LocationsController,
    AssetsController,
  ],
  providers: [SitesService, BuildingsService, LocationsService, AssetsService],
  exports: [SequelizeModule],
})
export class CatalogModule {}
