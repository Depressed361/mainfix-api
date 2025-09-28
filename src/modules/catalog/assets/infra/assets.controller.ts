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
import { CreateAsset } from '../domain/use-cases/CreateAsset';
import { UpdateAsset } from '../domain/use-cases/UpdateAsset';
import { ListAssets } from '../domain/use-cases/ListAssets';
import { GetAsset } from '../domain/use-cases/GetAsset';
import { DeleteAsset } from '../domain/use-cases/DeleteAsset';
import { CreateAssetDto, UpdateAssetDto, ListAssetsQueryDto } from './dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../../auth/decorators/admin-scope.decorator';

@Controller('catalog/assets')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
export class AssetsController {
  constructor(
    private readonly createUC: CreateAsset,
    private readonly updateUC: UpdateAsset,
    private readonly listUC: ListAssets,
    private readonly getUC: GetAsset,
    private readonly deleteUC: DeleteAsset,
  ) {}

  @AdminScope({ type: 'company', param: 'companyId' })
  @Post()
  create(@Body() dto: CreateAssetDto) {
    return this.createUC.exec(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getUC.exec(id);
  }

  @AdminScope(
    { type: 'company', param: 'companyId', optional: true },
    { type: 'site', param: 'siteId', optional: true },
    { type: 'building', param: 'buildingId', optional: true },
  )
  @Get()
  list(@Query() q: ListAssetsQueryDto) {
    return this.listUC.exec(q);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.updateUC.exec(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteUC.exec(id);
  }
}
