import { InjectModel } from '@nestjs/sequelize';
import type { WhereOptions, Op } from 'sequelize';
import { Op as SequelizeOp } from 'sequelize';
import type { CompanyRepository, CompanyEntity } from '../domain/ports';
import { Company } from '../company.model';
import { Site } from '../../catalog/models/site.model';
import { Team } from '../../directory/models/team.model';
import { User } from '../../directory/models/user.model';
import { Contract } from '../../contracts/models/contract.model';
import { Ticket } from '../../tickets/models/ticket.model';
import { toDomainCompany } from './mappers';

export class SequelizeCompanyRepository implements CompanyRepository {
  constructor(
    @InjectModel(Company) private readonly companies: typeof Company,
    @InjectModel(Site) private readonly sites: typeof Site,
    @InjectModel(Team) private readonly teams: typeof Team,
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(Contract) private readonly contracts: typeof Contract,
    @InjectModel(Ticket) private readonly tickets: typeof Ticket,
  ) {}

  async create(p: { name: string }): Promise<CompanyEntity> {
    const row = await this.companies.create({ name: p.name } as any);
    return toDomainCompany(row);
  }
  async update(id: string, patch: { name?: string }): Promise<CompanyEntity> {
    const row = await this.companies.findByPk(id);
    if (!row) throw new Error('companies.company.not_found');
    if (patch.name !== undefined) row.name = patch.name;
    await row.save();
    return toDomainCompany(row);
  }
  async archive(_id: string): Promise<void> {
    // No column in DB; implement later if a shadow table exists.
  }
  async deleteById(id: string): Promise<void> {
    await this.companies.destroy({ where: { id } as any });
  }
  async findById(id: string): Promise<CompanyEntity | null> {
    const row = await this.companies.findByPk(id);
    return row ? toDomainCompany(row) : null;
  }
  async list(q?: { search?: string } & { page?: number; pageSize?: number }): Promise<CompanyEntity[]> {
    const where: WhereOptions<Company> = q?.search ? ({ name: { [SequelizeOp.iLike]: `%${q.search}%` } } as any) : ({} as any);
    const limit = q?.pageSize;
    const offset = q?.page && q?.pageSize ? (q.page - 1) * q.pageSize : undefined;
    const rows = await this.companies.findAll({ where, order: [['name', 'ASC']], limit, offset });
    return rows.map(toDomainCompany);
  }
  async hasSites(id: string): Promise<boolean> {
    const count = await this.sites.count({ where: { companyId: id } as any });
    return count > 0;
  }
  async hasUsers(id: string): Promise<boolean> {
    const count = await this.users.count({ where: { companyId: id } as any });
    return count > 0;
  }
  async hasTeams(id: string): Promise<boolean> {
    const count = await this.teams.count({ where: { companyId: id } as any });
    return count > 0;
  }
  async hasContracts(id: string): Promise<boolean> {
    const siteIds = await this.sites.findAll({ attributes: ['id'], where: { companyId: id } as any });
    if (siteIds.length === 0) return false;
    const ids = siteIds.map((s) => s.id);
    const count = await this.contracts.count({ where: { siteId: { [SequelizeOp.in]: ids } } as any });
    return count > 0;
  }
  async hasTickets(id: string): Promise<boolean> {
    const count = await this.tickets.count({ where: { companyId: id } as any });
    return count > 0;
  }
}

