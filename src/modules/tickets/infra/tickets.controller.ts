import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { CreateTicket } from '../domain/use-cases/CreateTicket';
import { AssignTicket } from '../domain/use-cases/AssignTicket';
import { ChangeStatus } from '../domain/use-cases/ChangeStatus';
import { AddComment } from '../domain/use-cases/AddComment';
import { LinkTickets } from '../domain/use-cases/LinkTickets';
import { ListTickets } from '../domain/use-cases/ListTickets';
import { GetTicketDetail } from '../domain/use-cases/GetTicketDetail';
import { AddCommentDto, AssignTicketDto, ChangeStatusDto, CreateTicketDto, LinkTicketsDto, ListTicketsQueryDto } from './dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class TicketsControllerV2 {
  constructor(
    private readonly create: CreateTicket,
    private readonly assign: AssignTicket,
    private readonly changeStatus: ChangeStatus,
    private readonly addComment: AddComment,
    private readonly linkTickets: LinkTickets,
    private readonly listTickets: ListTickets,
    private readonly getDetail: GetTicketDetail,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTicket(@Body() dto: CreateTicketDto, @AdminContextDecorator() actor: AuthenticatedActor) { return this.create.execute(actor, dto) }

  @Post(':id/assign')
  assignTicket(@Param('id') id: string, @Body() dto: AssignTicketDto, @AdminContextDecorator() actor: AuthenticatedActor) { return this.assign.execute(actor, { ticketId: id, teamId: dto.teamId ?? null }) }

  @Post(':id/status')
  changeTicketStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @AdminContextDecorator() actor: AuthenticatedActor) { return this.changeStatus.execute(actor, { ticketId: id, to: dto.to }) }

  @Post(':id/comments')
  addTicketComment(@Param('id') id: string, @Body() dto: AddCommentDto, @AdminContextDecorator() actor: AuthenticatedActor) { return this.addComment.execute(actor, { ticketId: id, body: dto.body }) }

  @Post(':id/links')
  link(@Param('id') id: string, @Body() dto: LinkTicketsDto, @AdminContextDecorator() actor: AuthenticatedActor) { return this.linkTickets.execute(actor, { sourceTicketId: id, targetTicketId: dto.targetTicketId, type: dto.type }) }

  @Get()
  list(@Query() q: ListTicketsQueryDto, @AdminContextDecorator() actor: AuthenticatedActor) { return this.listTickets.execute(actor, { ...q, createdFrom: q.createdFrom ? new Date(q.createdFrom) : undefined, createdTo: q.createdTo ? new Date(q.createdTo) : undefined }) }

  @Get(':id')
  detail(@Param('id') id: string, @AdminContextDecorator() actor: AuthenticatedActor) { return this.getDetail.execute(actor, id) }
}

