import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { CreateTeam } from '../domain/use-cases/CreateTeam';
import { UpdateTeam } from '../domain/use-cases/UpdateTeam';
import { ToggleTeamActive } from '../domain/use-cases/ToggleTeamActive';
import { AddTeamMember } from '../domain/use-cases/AddTeamMember';
import { RemoveTeamMember } from '../domain/use-cases/RemoveTeamMember';
import { ListTeams } from '../domain/use-cases/ListTeams';
import { ListTeamMembers } from '../domain/use-cases/ListTeamMembers';
import { AddTeamMemberDto, CreateTeamDto, UpdateTeamDto } from './dto';

@Controller('directory/teams')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, CompanyScopeGuard)
export class TeamsControllerV2 {
  constructor(
    private readonly createTeam: CreateTeam,
    private readonly updateTeam: UpdateTeam,
    private readonly toggleTeam: ToggleTeamActive,
    private readonly addMember: AddTeamMember,
    private readonly removeMember: RemoveTeamMember,
    private readonly listTeams: ListTeams,
    private readonly listMembers: ListTeamMembers,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTeamDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.createTeam.execute(actor, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.updateTeam.execute(actor, id, dto);
  }

  @Patch(':id/active')
  toggle(@Param('id') id: string, @Body('active') active: boolean, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.toggleTeam.execute(actor, id, active);
  }

  @Post('members')
  add(@Body() dto: AddTeamMemberDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.addMember.execute(actor, dto.teamId, dto.userId);
  }

  @Delete('members/:teamId/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('teamId') teamId: string, @Param('userId') userId: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    await this.removeMember.execute(actor, teamId, userId);
  }

  @Get()
  list(@Query('companyId') companyId: string, @Query() q: any) {
    return this.listTeams.execute(companyId, q);
  }

  @Get(':id/members')
  members(@Param('id') id: string, @Query() q: any) {
    return this.listMembers.execute(id, q);
  }
}

