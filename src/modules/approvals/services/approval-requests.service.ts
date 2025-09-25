import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateApprovalRequestDto } from '../dto/create-approval-request.dto';
import { ApprovalRequest } from '../approval-request.model';

@Injectable()
export class ApprovalRequestsService {
  constructor(
    @InjectModel(ApprovalRequest)
    private readonly model: typeof ApprovalRequest,
  ) {}

  create(ticketId: string, dto: CreateApprovalRequestDto) {
    return this.model.create({ ...(dto as any), ticketId } as any);
  }

  findAll(ticketId: string) {
    return this.model.findAll({
      where: { ticketId } as any,
      order: [['created_at', 'ASC']],
    });
  }

  async remove(id: string) {
    const r = await this.model.findByPk(id);
    if (!r) throw new NotFoundException('Approval request not found');
    await r.destroy();
    return { deleted: true };
  }
}
