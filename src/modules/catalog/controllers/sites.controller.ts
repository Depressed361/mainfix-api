import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateSiteDto } from '../dto/create-site.dto';
import { ListSitesQueryDto } from '../dto/list-sites.query.dto';
import { SitesService } from '../services/sites.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../auth/decorators/admin-scope.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';

@Controller('sites')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @AdminScope({ type: 'company', param: 'companyId' })
  @Post()
  create(@Body() dto: CreateSiteDto) {
    return this.sites.create(dto);
  }

  @AdminScope({ type: 'site', param: 'id' })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.sites.findOneWithBuildings(id);
  }

  @AdminScope({ type: 'company', param: 'companyId', optional: true })
  @Get()
  list(
    @Req() req: Request & { actor?: AuthenticatedActor },
    @Query() query: ListSitesQueryDto,
  ) {
    const actor = req.actor;
    const isPlatformAdmin = actor?.scopes?.some(
      (scope) => scope.scope === 'platform',
    );

    let companyId = query.companyId;
    if (!companyId && !isPlatformAdmin && actor?.companyId) {
      companyId = actor.companyId;
    }

    return this.sites.findAll(companyId);
  }

  @AdminScope({ type: 'site', param: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sites.remove(id);
  }
}
