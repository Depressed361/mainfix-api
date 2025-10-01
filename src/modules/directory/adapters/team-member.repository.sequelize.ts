import { InjectModel } from '@nestjs/sequelize';
import type { TeamMemberRepository, TeamMemberEntity, Pagination, TeamEntity, UserEntity } from '../domain/ports';
import { TeamMember } from '../models/team-member.model';
import { Team } from '../models/team.model';
import { User } from '../models/user.model';
import { toDomainTeam, toDomainUser } from './mappers';

export class SequelizeTeamMemberRepository implements TeamMemberRepository {
  constructor(
    @InjectModel(TeamMember) private readonly model: typeof TeamMember,
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Team) private readonly teams: typeof Team,
  ) {}

  async upsert(m: TeamMemberEntity): Promise<void> { await this.model.upsert({ teamId: m.teamId, userId: m.userId } as any) }
  async delete(teamId: string, userId: string): Promise<void> { await this.model.destroy({ where: { teamId, userId } as any }) }
  async listMembers(teamId: string, p?: Pagination): Promise<UserEntity[]> {
    const rows = await this.model.findAll({ where: { teamId } as any, limit: p?.pageSize, offset: p?.page && p?.pageSize ? (p.page - 1) * p.pageSize : undefined });
    const ids = rows.map((r) => r.userId);
    if (ids.length === 0) return [];
    const users = await this.users.findAll({ where: { id: ids as any } });
    return users.map(toDomainUser);
  }
  async listTeamsOfUser(userId: string, p?: Pagination): Promise<TeamEntity[]> {
    const rows = await this.model.findAll({ where: { userId } as any, limit: p?.pageSize, offset: p?.page && p?.pageSize ? (p.page - 1) * p.pageSize : undefined });
    const ids = rows.map((r) => r.teamId); if (ids.length === 0) return [];
    const teams = await this.teams.findAll({ where: { id: ids as any } });
    return teams.map(toDomainTeam);
  }
  async exists(teamId: string, userId: string): Promise<boolean> { return !!(await this.model.findOne({ where: { teamId, userId } as any })) }
}

