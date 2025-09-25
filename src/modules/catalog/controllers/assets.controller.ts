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
import { CreateAssetDto } from '../dto/create-asset.dto';
import { AssetsService } from '../services/assets.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../auth/decorators/admin-scope.decorator';
import { AssetScopeDto } from '../dto/manage-asset.scope.dto';

@Controller('assets')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @AdminScope({ type: 'company', param: 'companyId' })
  @Post()
  create(@Body() dto: CreateAssetDto) {
    return this.assets.create(dto);
  }

  @AdminScope({ type: 'company', param: 'companyId' })
  @Get(':id')
  get(@Param('id') id: string, @Query() scope: AssetScopeDto) {
    return this.assets.findOne(id, scope.companyId);
  }

  @AdminScope({ type: 'company', param: 'companyId' })
  @Delete(':id')
  remove(@Param('id') id: string, @Query() scope: AssetScopeDto) {
    return this.assets.remove(id, scope.companyId);
  }
}
