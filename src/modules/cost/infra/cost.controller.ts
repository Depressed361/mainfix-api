import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import type { Request } from 'express';
import { UpsertLaborCost } from '../domain/use-cases/UpsertLaborCost';
import { AddOrUpdatePart } from '../domain/use-cases/AddOrUpdatePart';
import { RemovePart } from '../domain/use-cases/RemovePart';
import { RecalculateFromParts } from '../domain/use-cases/RecalculateFromParts';
import { GetTicketCostSummary } from '../domain/use-cases/GetTicketCostSummary';
import { UpsertLaborCostDto, UpsertPartDto, RemovePartDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class CostController {
  constructor(
    private readonly upsertLabor: UpsertLaborCost,
    private readonly addOrUpdate: AddOrUpdatePart,
    private readonly removePart: RemovePart,
    private readonly recalc: RecalculateFromParts,
    private readonly getSummary: GetTicketCostSummary,
  ) {}

  private actor(req: Request & { actor?: AuthenticatedActor }) { if (!req.actor) throw new Error('cost.auth.missing_actor'); return req.actor; }

  @Post('cost/labor')
  upsertLaborCost(@Body() dto: UpsertLaborCostDto, req: Request & { actor?: AuthenticatedActor }) {
    const actor = this.actor(req);
    return this.upsertLabor.execute(actor.id, dto);
  }

  @Post('cost/parts')
  upsertPart(@Body() dto: UpsertPartDto, req: Request & { actor?: AuthenticatedActor }) {
    const actor = this.actor(req);
    return this.addOrUpdate.execute(actor.id, dto);
  }

  @Delete('cost/parts')
  deletePart(@Body() dto: RemovePartDto, req: Request & { actor?: AuthenticatedActor }) {
    const actor = this.actor(req);
    return this.removePart.execute(actor.id, dto);
  }

  @Post('cost/recalculate')
  recalculate(@Body() dto: { ticketId: string }, req: Request & { actor?: AuthenticatedActor }) {
    const actor = this.actor(req);
    return this.recalc.execute(actor.id, dto);
  }

  @Get('cost/tickets/:ticketId')
  summary(@Param('ticketId') ticketId: string) {
    return this.getSummary.execute({ ticketId });
  }
}

