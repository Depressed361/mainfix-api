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
import { CreateTeamDto } from '../dto/create-team.dto';
import {
  ManageTeamMemberDto,
  TeamMemberScopeDto,
} from '../dto/manage-team-member.dto';
import { TeamsService } from '../services/teams.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../auth/decorators/admin-scope.decorator';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teams: TeamsService) {}
  @UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
  @AdminScope({ type: 'company', param: 'companyId' })
  @Post()
  create(@Body() dto: CreateTeamDto) {
    return this.teams.create(dto);
  }

  @Get()
  list(@Query('company_id') companyId?: string) {
    return this.teams.findAll(companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teams.remove(id);
  }

  @UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
  @AdminScope({ type: 'company', param: 'companyId' })
  @Post(':id/members')
  addMember(@Param('id') teamId: string, @Body() dto: ManageTeamMemberDto) {
    return this.teams.addMember(teamId, dto.userId, dto.companyId);
  }

  @UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
  @AdminScope({ type: 'company', param: 'companyId' })
  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @Query() query: TeamMemberScopeDto,
  ) {
    return this.teams.removeMember(teamId, userId, query.companyId);
  }
}
