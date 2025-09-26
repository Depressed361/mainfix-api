import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { Scopes } from '../../auth/decorators/scopes.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { ListTicketsQueryDto } from '../dto/list-tickets.query.dto';
import { UpdateTicketStatusDto } from '../dto/update-ticket-status.dto';
import { AssignTicketDto } from '../dto/assign-ticket.dto';
import { TicketsService } from '../services/tickets.service';

@Controller('tickets')
@UseGuards(
  JwtAuthGuard,
  RequireAdminRoleGuard,
  RequireAdminScopeGuard,
  ScopesGuard,
)
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Scopes('ticket:write')
  @Post()
  create(
    @Req() req: Request & { actor?: AuthenticatedActor },
    @Body() dto: CreateTicketDto,
  ) {
    this.ensureScopeForContext(
      req.actor,
      dto.companyId,
      dto.siteId,
      dto.buildingId,
    );
    return this.tickets.create(dto, req.actor);
  }

  @Scopes('ticket:read')
  @Get(':id')
  async get(
    @Req() req: Request & { actor?: AuthenticatedActor },
    @Param('id') id: string,
  ) {
    const result = await this.tickets.getWithTimeline(id);
    this.ensureTicketAccess(req.actor, result.ticket);
    return result;
  }

  @Scopes('ticket:read')
  @Get()
  list(
    @Req() req: Request & { actor?: AuthenticatedActor },
    @Query() query: ListTicketsQueryDto,
  ) {
    return this.tickets.findAll(req.actor!, query);
  }

  @Scopes('ticket:write')
  @Patch(':id/status')
  async updateStatus(
    @Req() req: Request & { actor?: AuthenticatedActor },
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    const ticket = await this.tickets.updateStatus(id, dto, req.actor);
    this.ensureTicketAccess(req.actor, ticket);
    return ticket;
  }

  @Scopes('ticket:write')
  @Patch(':id/assign')
  async assign(
    @Req() req: Request & { actor?: AuthenticatedActor },
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
  ) {
    const ticket = await this.tickets.assign(id, dto, req.actor);
    this.ensureTicketAccess(req.actor, ticket);
    return ticket;
  }

  private ensureScopeForContext(
    // debug
    actor: AuthenticatedActor | undefined,
    companyId?: string,
    siteId?: string,
    buildingId?: string,
  ) {
    if (!actor) return;
    if (actor.scopeStrings.includes('admin:super')) return;
    if (companyId) {
      if (
        actor.companyScopeIds.includes(companyId) ||
        actor.companyId === companyId
      ) {
        return;
      }
    }
    if (siteId && actor.siteScopeIds.includes(siteId)) return;
    if (buildingId && actor.buildingScopeIds.includes(buildingId)) return;
    throw new ForbiddenException('Scope mismatch for ticket operation');
  }

  private ensureTicketAccess(
    actor: AuthenticatedActor | undefined,
    ticket: {
      companyId?: string;
      siteId?: string;
      buildingId?: string | null;
    } & { get?: (key: string | { plain?: boolean }) => any },
  ) {
    const source =
      typeof ticket.get === 'function'
        ? (ticket.get({ plain: true }) as {
            companyId?: string;
            siteId?: string;
            buildingId?: string | null;
          })
        : ticket;
    this.ensureScopeForContext(
      actor,
      source.companyId,
      source.siteId,
      source.buildingId ?? undefined,
    );
  }
}
