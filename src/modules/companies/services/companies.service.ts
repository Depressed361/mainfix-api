import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from '../company.model';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company) private readonly companyModel: typeof Company,
  ) {}

  findAll() {
    return this.companyModel.findAll({ order: [['created_at', 'DESC']] });
  }

  async findOne(id: string) {
    const company = await this.companyModel.findByPk(id);
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  create(dto: CreateCompanyDto) {
    return this.companyModel.create({ name: dto.name } as any);
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const company = await this.findOne(id);
    await company.update(dto as any);
    return company;
  }

  async remove(id: string) {
    const company = await this.findOne(id);
    await company.destroy();
    return { deleted: true };
  }
}
