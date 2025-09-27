import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateLocation } from '../domain/use-cases/CreateLocation';
import { UpdateLocation } from '../domain/use-cases/UpdateLocation';
import { ListLocations } from '../domain/use-cases/ListLocations';
import { GetLocation } from '../domain/use-cases/GetLocation';
import { DeleteLocation } from '../domain/use-cases/DeleteLocation';
import {
  CreateLocationDto,
  ListLocationsQueryDto,
  UpdateLocationDto,
} from './dto';

import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../../auth/decorators/admin-scope.decorator';

@Controller('catalog/locations')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
export class LocationsController {
  constructor(
    private readonly createUC: CreateLocation,
    private readonly updateUC: UpdateLocation,
    private readonly listUC: ListLocations,
    private readonly getUC: GetLocation,
    private readonly deleteUC: DeleteLocation,
  ) {}

  @AdminScope({ type: 'building', param: 'buildingId' })
  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.createUC.exec(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getUC.exec(id);
  }

  @AdminScope(
    { type: 'building', param: 'buildingId', optional: true },
    { type: 'site', param: 'siteId', optional: true },
  )
  @Get()
  list(@Query() query: ListLocationsQueryDto) {
    return this.listUC.exec(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.updateUC.exec(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteUC.exec(id);
  }
}
