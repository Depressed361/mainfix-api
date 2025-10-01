import { InjectModel } from '@nestjs/sequelize';
import type { CompanyQuery } from '../domain/ports';
import { Site } from '../../catalog/models/site.model';
import { Team } from '../../directory/models/team.model';
import { User } from '../../directory/models/user.model';

export class SequelizeCompanyQuery implements CompanyQuery {
  constructor(
    @InjectModel(Site) private readonly sites: typeof Site,
    @InjectModel(Team) private readonly teams: typeof Team,
    @InjectModel(User) private readonly users: typeof User,
  ) {}

  async getBoundary(id: string): Promise<{ companyId: string; sites: string[]; teams: string[]; users: string[] }> {
    const [sites, teams, users] = await Promise.all([
      this.sites.findAll({ attributes: ['id'], where: { companyId: id } as any }),
      this.teams.findAll({ attributes: ['id'], where: { companyId: id } as any }),
      this.users.findAll({ attributes: ['id'], where: { companyId: id } as any }),
    ]);
    return {
      companyId: id,
      sites: sites.map((s) => s.id),
      teams: teams.map((t) => t.id),
      users: users.map((u) => u.id),
    };
  }

  async ownsSite(companyId: string, siteId: string): Promise<boolean> {
    return !!(await this.sites.findOne({ where: { id: siteId, companyId } as any }));
  }
  async ownsTeam(companyId: string, teamId: string): Promise<boolean> {
    return !!(await this.teams.findOne({ where: { id: teamId, companyId } as any }));
  }
  async ownsUser(companyId: string, userId: string): Promise<boolean> {
    return !!(await this.users.findOne({ where: { id: userId, companyId } as any }));
  }
}

