import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateTeamDto } from '../dto/create-team.dto';
import { Team } from '../models/team.model';
import { TeamMember } from '../models/team-member.model';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectModel(Team) private readonly model: typeof Team,
    @InjectModel(TeamMember) private readonly memberModel: typeof TeamMember,
  ) {}

  create(dto: CreateTeamDto) {
    return this.model.create(dto as any);
  }

  findAll(companyId?: string) {
    return this.model.findAll({
      where: companyId ? ({ companyId } as any) : undefined,
      order: [['name', 'ASC']],
    });
  }

  async remove(id: string) {
    const t = await this.model.findByPk(id);
    if (!t) throw new NotFoundException('Team not found');
    await t.destroy();
    return { deleted: true };
  }

  private async assertTeamInCompany(teamId: string, companyId: string) {
    const team = await this.model.findByPk(teamId);
    if (!team) throw new NotFoundException('Team not found');
    const teamCompanyId = team.get('companyId') as string | undefined;
    if (teamCompanyId !== companyId) {
      throw new ForbiddenException('Team does not belong to specified company');
    }
    return team;
  }

  async addMember(teamId: string, userId: string, companyId: string) {
    await this.assertTeamInCompany(teamId, companyId);
    const [member, created] = await this.memberModel.findOrCreate({
      where: { teamId, userId },
      defaults: { teamId, userId },
    });

    if (created) {
      this.logger.log(
        `Added user ${userId} to team ${teamId} (company ${companyId})`,
      );
    } else {
      this.logger.log(
        `User ${userId} already member of team ${teamId} (company ${companyId})`,
      );
    }

    return { teamId, userId, created, member };
  }

  async removeMember(teamId: string, userId: string, companyId: string) {
    await this.assertTeamInCompany(teamId, companyId);
    const member = await this.memberModel.findOne({ where: { teamId, userId } });
    if (!member) throw new NotFoundException('Team member not found');

    await member.destroy();
    this.logger.log(
      `Removed user ${userId} from team ${teamId} (company ${companyId})`,
    );
    return { deleted: true };
  }
}
