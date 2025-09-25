import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ApprovalRequest } from './approval-request.model';
import { ApprovalRequestsController, ApprovalRequestsAdminController } from './controllers/approval-requests.controller';
import { ApprovalRequestsService } from './services/approval-requests.service';

@Module({
  imports: [SequelizeModule.forFeature([ApprovalRequest])],
  controllers: [ApprovalRequestsController, ApprovalRequestsAdminController],
  providers: [ApprovalRequestsService],
  exports: [SequelizeModule],
})
export class ApprovalsModule {}
