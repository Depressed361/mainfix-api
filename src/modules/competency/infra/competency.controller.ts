import { Body, Controller, Delete, Param, Post, UseGuards, HttpCode, HttpStatus, ForbiddenException, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
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
import { ConflictError, DomainError, ForbiddenError, InvalidInputError, NotFoundError } from '../domain/errors';

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
  @HttpCode(HttpStatus.OK)
  upsertZone(@Body() dto: UpsertTeamZoneDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.execute(() => this.grantZone.execute(actor, dto.teamId, dto.buildingId, dto.contractVersionId));
  }

  @Delete('team-zones/:teamId/:buildingId')
  deleteZone(
    @Param('teamId') teamId: string,
    @Param('buildingId') buildingId: string,
    @Body('contractVersionId') contractVersionId: string,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.execute(() => this.revokeZone.execute(actor, teamId, buildingId, contractVersionId));
  }

  @Post('team-skills')
  @HttpCode(HttpStatus.OK)
  upsertSkill(@Body() dto: UpsertTeamSkillDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.execute(() => this.grantSkill.execute(actor, dto.teamId, dto.skillId, dto.contractVersionId));
  }

  @Delete('team-skills/:teamId/:skillId')
  deleteSkill(
    @Param('teamId') teamId: string,
    @Param('skillId') skillId: string,
    @Body('contractVersionId') contractVersionId: string,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.execute(() => this.revokeSkill.execute(actor, teamId, skillId, contractVersionId));
  }

  @Post('matrix')
  @HttpCode(HttpStatus.OK)
  putCompetency(@Body() dto: UpsertCompetencyDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    const okLevels = new Set(['primary', 'backup']);
    const okWindows = new Set(['business_hours', 'after_hours', 'any']);
    if (!okLevels.has((dto as any).level)) {
      throw new UnprocessableEntityException('level invalid');
    }
    if (!okWindows.has((dto as any).window)) {
      throw new UnprocessableEntityException('window invalid');
    }
    return this.execute(() => this.upsertCompetency.execute(actor, {
      contractVersionId: dto.contractVersionId,
      teamId: dto.teamId,
      categoryId: dto.categoryId,
      buildingId: dto.buildingId ?? null,
      level: dto.level,
      window: dto.window,
    }));
  }

  @Delete('matrix')
  deleteCompetency(@Body() dto: DeleteCompetencyDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.execute(() => this.removeCompetency.execute(actor, {
      contractVersionId: dto.contractVersionId,
      teamId: dto.teamId,
      categoryId: dto.categoryId,
      buildingId: dto.buildingId ?? null,
      window: dto.window,
    }));
  }

  @Post('eligible-teams')
  @HttpCode(HttpStatus.OK)
  eligible(@Body() dto: EligibilityQueryDto) {
    return this.execute(() => this.resolver.eligibleTeams({
      contractVersionId: dto.contractVersionId,
      categoryId: dto.categoryId,
      buildingId: dto.buildingId ?? null,
      timeWindow: dto.timeWindow,
      preferLevel: dto.preferLevel ?? 'primary',
    }));
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof DomainError) {
        if (error instanceof ForbiddenError) throw new ForbiddenException(error.message);
        if (error instanceof InvalidInputError) throw new UnprocessableEntityException(error.message);
        if (error instanceof NotFoundError) throw new NotFoundException(error.message);
        if (error instanceof ConflictError) throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }
  }
}
