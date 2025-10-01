import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { UpsertSlaTargetsOnTicketCreated } from '../domain/use-cases/UpsertSlaTargetsOnTicketCreated';
import { GetSlaForTicket } from '../domain/use-cases/GetSlaForTicket';
import { ListBreachesQueryDto, PauseSlaDto, RecomputeSlaDto, ResumeSlaDto } from './dto';
import { TOKENS, type SlaBreachRepository } from '../domain/ports';

@Controller('sla')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class SlaController {
  constructor(
    private readonly upsertOnCreate: UpsertSlaTargetsOnTicketCreated,
    private readonly getForTicket: GetSlaForTicket,
    @Inject(TOKENS.SlaBreachRepository) private readonly breaches: SlaBreachRepository,
  ) {}

  @Post('tickets/:ticketId/recompute')
  @HttpCode(HttpStatus.OK)
  recompute(@Param('ticketId') ticketId: string, @Body() _dto: RecomputeSlaDto, @AdminContextDecorator() _actor: AuthenticatedActor) {
    // Minimal: reuse upsert (idempotent)
    return this.upsertOnCreate.execute(ticketId);
  }

  @Post('pause')
  pause(@Body() _dto: PauseSlaDto) { return { ok: true } }

  @Post('resume')
  resume(@Body() _dto: ResumeSlaDto) { return { ok: true } }

  @Get('breaches')
  list(@Query() q: ListBreachesQueryDto) {
    return this.breaches.list({ companyId: q.companyId, types: q.types, from: q.from ? new Date(q.from) : undefined, to: q.to ? new Date(q.to) : undefined, page: q.page, pageSize: q.pageSize });
  }

  @Get('tickets/:ticketId')
  getTicketSla(@Param('ticketId') ticketId: string) { return this.getForTicket.execute(ticketId) }
}
