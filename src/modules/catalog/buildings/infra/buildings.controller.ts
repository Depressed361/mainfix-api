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
import { CreateBuilding } from '../domain/use-cases/CreateBuildings';
import { UpdateBuilding } from '../domain/use-cases/UpdateBuildings';
import { ListBuildings } from '../domain/use-cases/ListBuildings';
import { GetBuilding } from '../domain/use-cases/GetBuildings';
import { DeleteBuilding } from '../domain/use-cases/DeleteBuildings';
import {
  CreateBuildingDto,
  UpdateBuildingDto,
  ListBuildingsQueryDto,
} from './dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../../auth/decorators/admin-scope.decorator';

@Controller('catalog/buildings')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
export class BuildingsController {
  constructor(
    private readonly createUC: CreateBuilding,
    private readonly updateUC: UpdateBuilding,
    private readonly listUC: ListBuildings,
    private readonly getUC: GetBuilding,
    private readonly deleteUC: DeleteBuilding,
  ) {}

  @AdminScope({ type: 'site', param: 'siteId' })
  @Post()
  create(@Body() dto: CreateBuildingDto) {
    return this.createUC.exec(dto);
  }

  @AdminScope({ type: 'building', param: 'id' })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.getUC.exec(id);
  }

  @AdminScope({ type: 'site', param: 'siteId', optional: true })
  @Get()
  list(@Query() query: ListBuildingsQueryDto) {
    return this.listUC.exec(query);
  }

  @AdminScope({ type: 'building', param: 'id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBuildingDto) {
    return this.updateUC.exec(id, dto);
  }

  @AdminScope({ type: 'building', param: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteUC.exec(id);
  }
}
