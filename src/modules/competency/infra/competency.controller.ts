import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { UpsertTeamZoneDto, UpsertTeamSkillDto, UpsertCompetencyDto, DeleteCompetencyDto, EligibilityQueryDto } from './dto';
import { GrantTeamZone } from '../domain/use-cases/GrantTeamZone';
import { RevokeTeamZone } from '../domain/use-cases/RevokeTeamZone';
import { GrantTeamSkill } from '../domain/use-cases/GrantTeamSkill';
import { RevokeTeamSkill } from '../domain/use-cases/RevokeTeamSkill';
import { UpsertCompetency } from '../domain/use-cases/UpsertCompetency';
import { RemoveCompetency } from '../domain/use-cases/RemoveCompetency';
import { ResolveEligibleTeams } from '../domain/use-cases/ResolveEligibleTeams';

@Controller('companies/:companyId/competency')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard, CompanyScopeGuard)
export class CompetencyAdminController {
  constructor(
    private readonly grantZone: GrantTeamZone,
    private readonly revokeZone: RevokeTeamZone,
    private readonly grantSkill: GrantTeamSkill,
    private readonly revokeSkill: RevokeTeamSkill,
    private readonly upsertCompetency: UpsertCompetency,
    private readonly removeCompetency: RemoveCompetency,
    private readonly resolver: ResolveEligibleTeams,
  ) {}

  @Post('team-zones')
  upsertZone(@Body() dto: UpsertTeamZoneDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.grantZone.execute(actor, dto.teamId, dto.buildingId, dto.contractVersionId);
  }

  @Delete('team-zones/:teamId/:buildingId')
  deleteZone(
    @Param('teamId') teamId: string,
    @Param('buildingId') buildingId: string,
    @Body('contractVersionId') contractVersionId: string,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.revokeZone.execute(actor, teamId, buildingId, contractVersionId);
  }

  @Post('team-skills')
  upsertSkill(@Body() dto: UpsertTeamSkillDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.grantSkill.execute(actor, dto.teamId, dto.skillId, dto.contractVersionId);
  }

  @Delete('team-skills/:teamId/:skillId')
  deleteSkill(
    @Param('teamId') teamId: string,
    @Param('skillId') skillId: string,
    @Body('contractVersionId') contractVersionId: string,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.revokeSkill.execute(actor, teamId, skillId, contractVersionId);
  }

  @Post('matrix')
  putCompetency(@Body() dto: UpsertCompetencyDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.upsertCompetency.execute(actor, {
      contractVersionId: dto.contractVersionId,
      teamId: dto.teamId,
      categoryId: dto.categoryId,
      buildingId: dto.buildingId ?? null,
      level: dto.level,
      window: dto.window,
    });
  }

  @Delete('matrix')
  deleteCompetency(@Body() dto: DeleteCompetencyDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.removeCompetency.execute(actor, {
      contractVersionId: dto.contractVersionId,
      teamId: dto.teamId,
      categoryId: dto.categoryId,
      buildingId: dto.buildingId ?? null,
      window: dto.window,
    });
  }

  @Post('eligible-teams')
  eligible(@Body() dto: EligibilityQueryDto) {
    return this.resolver.eligibleTeams({
      contractVersionId: dto.contractVersionId,
      categoryId: dto.categoryId,
      buildingId: dto.buildingId ?? null,
      timeWindow: dto.timeWindow,
      preferLevel: dto.preferLevel ?? 'primary',
    });
  }
}

