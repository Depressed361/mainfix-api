import { InjectModel } from '@nestjs/sequelize';
import type { DirectoryQuery } from '../domain/ports';
import { User } from '../models/user.model';
import { Team } from '../models/team.model';
import { TeamMember } from '../models/team-member.model';

export class SequelizeDirectoryQuery implements DirectoryQuery {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Team) private readonly teams: typeof Team,
    @InjectModel(TeamMember) private readonly members: typeof TeamMember,
  ) {}
  async getUserMeta(userId: string) {
    const u = await this.users.findByPk(userId); if (!u) throw new Error('directory.user.not_found');
    return { companyId: u.companyId, role: u.role as any, active: u.active, siteId: (u as any).siteId ?? null };
  }
  async getTeamMeta(teamId: string) {
    const t = await this.teams.findByPk(teamId); if (!t) throw new Error('directory.team.not_found');
    return { companyId: t.companyId, type: t.type as any, active: t.active };
  }
  async isUserInTeam(userId: string, teamId: string): Promise<boolean> {
    return !!(await this.members.findOne({ where: { userId, teamId } as any }));
  }
}

