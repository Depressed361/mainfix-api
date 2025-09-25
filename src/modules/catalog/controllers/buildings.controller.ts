import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateBuildingDto } from '../dto/create-building.dto';
import { BuildingsService } from '../services/buildings.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../auth/decorators/admin-scope.decorator';

@Controller('buildings')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
export class BuildingsController {
  constructor(private readonly buildings: BuildingsService) {}

  @AdminScope({ type: 'site', param: 'siteId' })
  @Post()
  create(@Body() dto: CreateBuildingDto) {
    return this.buildings.create(dto);
  }

  @AdminScope({ type: 'building', param: 'id' })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.buildings.findOne(id);
  }

  @AdminScope({ type: 'building', param: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buildings.remove(id);
  }
}
