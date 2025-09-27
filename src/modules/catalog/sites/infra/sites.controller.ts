import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateSite } from '../domain/use-cases/CreateSite';
import { UpdateSite } from '../domain/use-cases/UpdateSite';
import { ListSites } from '../domain/use-cases/ListSites';
import { GetSite } from '../domain/use-cases/GetSite';
import { DeleteSite } from '../domain/use-cases/DeleteSite';
import { CreateSiteDto, ListSitesQueryDto, UpdateSiteDto } from './dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../../auth/decorators/admin-scope.decorator';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

@Controller('catalog/sites')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
export class SitesController {
  constructor(
    private readonly createSiteUC: CreateSite,
    private readonly updateSiteUC: UpdateSite,
    private readonly listSitesUC: ListSites,
    private readonly getSiteUC: GetSite,
    private readonly deleteSiteUC: DeleteSite,
  ) {}

  @AdminScope({ type: 'company', param: 'companyId' })
  @Post()
  create(@Body() dto: CreateSiteDto) {
    return this.createSiteUC.exec(dto);
  }

  @AdminScope({ type: 'site', param: 'id' })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.getSiteUC.exec(id);
  }

  @AdminScope({ type: 'company', param: 'companyId', optional: true })
  @Get()
  list(
    @Req() req: Request & { actor?: AuthenticatedActor },
    @Query() query: ListSitesQueryDto,
  ) {
    const actor = req.actor;
    const isPlatformAdmin = !!actor?.scopes?.some(
      (scope) => scope.scope === 'platform',
    );

    return this.listSitesUC.exec(query, {
      actorCompanyId: actor?.companyId,
      isPlatformAdmin,
    });
  }

  @AdminScope({ type: 'site', param: 'id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return this.updateSiteUC.exec(id, dto);
  }

  @AdminScope({ type: 'site', param: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteSiteUC.exec(id);
  }
}
