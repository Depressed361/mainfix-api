import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from './models/ticket.model';
import { TicketEvent } from './models/ticket-event.model';
import { TicketComment } from './ticket-comment.model';
import { TicketLink } from './models/ticket-link.model';
import { TicketsControllerV2 } from './infra/tickets.controller';
import { TOKENS } from './domain/ports';
import { SequelizeTicketRepository } from './adapters/ticket.repository.sequelize';
import { SequelizeTicketEventRepository } from './adapters/ticket-event.repository.sequelize';
import { SequelizeTicketCommentRepository } from './adapters/ticket-comment.repository.sequelize';
import { SequelizeTicketLinkRepository } from './adapters/ticket-link.repository.sequelize';
import { CreateTicket } from './domain/use-cases/CreateTicket';
import { AssignTicket } from './domain/use-cases/AssignTicket';
import { ChangeStatus } from './domain/use-cases/ChangeStatus';
import { AddComment } from './domain/use-cases/AddComment';
import { LinkTickets } from './domain/use-cases/LinkTickets';
import { ListTickets } from './domain/use-cases/ListTickets';
import { GetTicketDetail } from './domain/use-cases/GetTicketDetail';
import { ContractsModule } from '../contracts/contracts.module';
import { CatalogModule } from '../catalog/catalog.module';
import { DirectoryModule } from '../directory/directory.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Ticket,
      TicketEvent,
      TicketComment,
      TicketLink,
    ]),
    ContractsModule,
    CatalogModule,
    DirectoryModule,
  ],
  controllers: [TicketsControllerV2],
  providers: [
    { provide: TOKENS.TicketRepository, useClass: SequelizeTicketRepository },
    {
      provide: TOKENS.TicketEventRepository,
      useClass: SequelizeTicketEventRepository,
    },
    {
      provide: TOKENS.TicketCommentRepository,
      useClass: SequelizeTicketCommentRepository,
    },
    {
      provide: TOKENS.TicketLinkRepository,
      useClass: SequelizeTicketLinkRepository,
    },
    // Adapters for Contracts/Catalog/Directory are provided by their modules; injection should bind via useExisting in composition if needed.
    CreateTicket,
    AssignTicket,
    ChangeStatus,
    AddComment,
    LinkTickets,
    ListTickets,
    GetTicketDetail,
  ],
  exports: [SequelizeModule],
})
export class TicketsModuleV2 {}
