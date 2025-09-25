import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateContractDto } from '../dto/create-contract.dto';
import { Contract } from '../models/contract.model';

@Injectable()
export class ContractsService {
  constructor(@InjectModel(Contract) private readonly model: typeof Contract) {}

  create(dto: CreateContractDto) {
    return this.model.create(dto as any);
  }

  async findOne(id: string) {
    const c = await this.model.findByPk(id);
    if (!c) throw new NotFoundException('Contract not found');
    return c;
  }

  findAll(siteId?: string) {
    return this.model.findAll({
      where: siteId ? ({ siteId } as any) : undefined,
      order: [['id', 'ASC']],
    });
  }

  async remove(id: string) {
    const c = await this.findOne(id);
    await c.destroy();
    return { deleted: true };
  }
}
