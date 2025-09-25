import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateApprovalRequestDto } from '../dto/create-approval-request.dto';
import { ApprovalRequestsService } from '../services/approval-requests.service';

@Controller('tickets/:id/approvals')
export class ApprovalRequestsController {
  constructor(private readonly approvals: ApprovalRequestsService) {}

  @Post()
  create(@Param('id') ticketId: string, @Body() dto: CreateApprovalRequestDto) {
    return this.approvals.create(ticketId, dto);
  }

  @Get()
  list(@Param('id') ticketId: string) {
    return this.approvals.findAll(ticketId);
  }
}

@Controller('approval_requests')
export class ApprovalRequestsAdminController {
  constructor(private readonly approvals: ApprovalRequestsService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.approvals.remove(id);
  }
}
