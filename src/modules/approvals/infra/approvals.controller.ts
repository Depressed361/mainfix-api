import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { CreateApprovalRequest } from '../domain/use-cases/CreateApprovalRequest';
import { EvaluateApprovalNeed } from '../domain/use-cases/EvaluateApprovalNeed';
import { DecideApproval } from '../domain/use-cases/DecideApproval';
import { GetApprovalStatusForTicket } from '../domain/use-cases/GetApprovalStatusForTicket';
import { ListApprovalRequests } from '../domain/use-cases/ListApprovalRequests';
import { CreateApprovalRequestDto, DecideApprovalDto, ListApprovalRequestsQueryDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ApprovalsController {
  constructor(
    private readonly createApproval: CreateApprovalRequest,
    private readonly evaluateNeed: EvaluateApprovalNeed,
    private readonly decideApproval: DecideApproval,
    private readonly listApprovals: ListApprovalRequests,
    private readonly getStatusForTicket: GetApprovalStatusForTicket,
  ) {}

  private actor(req: Request & { actor?: AuthenticatedActor }) { if (!req.actor) throw new Error('approvals.auth.missing_actor'); return req.actor; }

  // POST /approvals/requests → Create explicitly if amount is provided; otherwise evaluate policy and maybe create
  @Post('approvals/requests')
  async requestApproval(@Body() dto: CreateApprovalRequestDto, @Req() req: Request & { actor?: AuthenticatedActor }) {
    const actor = this.actor(req);
    if (dto.amountEstimate) {
      return this.createApproval.execute(actor.id, { ticketId: dto.ticketId, reason: dto.reason, amountEstimate: dto.amountEstimate, currency: dto.currency ?? 'EUR' });
    }
    return this.evaluateNeed.execute(actor.id, { ticketId: dto.ticketId, reason: dto.reason });
  }

  @Post('approvals/requests/:id/decision')
  async decide(@Param('id') id: string, @Body() dto: DecideApprovalDto, @Req() req: Request & { actor?: AuthenticatedActor }) {
    const actor = this.actor(req);
    await this.decideApproval.execute(actor.id, { approvalRequestId: id, decision: dto.decision, note: dto.note });
    return { ok: true };
  }

  @Get('approvals/requests')
  async list(@Query() q: ListApprovalRequestsQueryDto, req: Request & { actor?: AuthenticatedActor }) {
    const actor = this.actor(req);
    const filters = {
      companyId: q.companyId,
      siteIds: q.siteIds,
      buildingIds: q.buildingIds,
      status: q.status,
      from: q.from ? new Date(q.from) : undefined,
      to: q.to ? new Date(q.to) : undefined,
      page: q.page,
      pageSize: q.pageSize,
    };
    return this.listApprovals.execute(actor.id, filters);
  }

  @Get('tickets/:ticketId/approvals/status')
  async getStatus(@Param('ticketId') ticketId: string) {
    const status = await this.getStatusForTicket.execute(ticketId);
    return { ticketId, status };
  }
}
