import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateContractVersionDto } from '../dto/create-contract-version.dto';
import { ContractVersion } from '../models/contract-version.model';

@Injectable()
export class ContractVersionsService {
  constructor(
    @InjectModel(ContractVersion) private readonly model: typeof ContractVersion,
  ) {}

  create(contractId: string, dto: CreateContractVersionDto) {
    return this.model.create({ ...(dto as any), contractId } as any);
  }

  findAll(contractId: string) {
    return this.model.findAll({
      where: { contractId } as any,
      order: [['version', 'DESC']],
    });
  }

  async remove(id: string) {
    const v = await this.model.findByPk(id);
    if (!v) throw new NotFoundException('Contract version not found');
    await v.destroy();
    return { deleted: true };
  }
}
