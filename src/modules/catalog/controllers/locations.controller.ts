import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateLocationDto } from '../dto/create-location.dto';
import { LocationsService } from '../services/locations.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../auth/decorators/admin-scope.decorator';
import { LocationScopeDto } from '../dto/manage-location.scope.dto';

@Controller('locations')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @AdminScope({ type: 'building', param: 'buildingId' })
  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.locations.create(dto);
  }

  @AdminScope({ type: 'building', param: 'buildingId' })
  @Get(':id')
  get(@Param('id') id: string, @Query() scope: LocationScopeDto) {
    return this.locations.findOne(id, scope.buildingId);
  }

  @AdminScope({ type: 'building', param: 'buildingId' })
  @Delete(':id')
  remove(@Param('id') id: string, @Query() scope: LocationScopeDto) {
    return this.locations.remove(id, scope.buildingId);
  }
}
