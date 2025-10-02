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
import { CompaniesModule } from '../companies/companies.module';
import { TOKENS as CONTRACTS_TOKENS } from '../contracts/domain/ports';
import { TOKENS as COMPANIES_TOKENS } from '../companies/domain/ports';
import { TOKENS as DIRECTORY_TOKENS } from '../directory/domain/ports';

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
    CompaniesModule,
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
    // Bridge Tokens: reuse existing providers from other modules
    { provide: TOKENS.ContractsQuery, useExisting: CONTRACTS_TOKENS.ContractQuery },
    { provide: TOKENS.CatalogQuery, useExisting: COMPANIES_TOKENS.CatalogQuery },
    { provide: TOKENS.DirectoryQuery, useExisting: DIRECTORY_TOKENS.DirectoryQuery },

    // Use-cases wired with explicit dependencies (no change to domain logic)
    { provide: CreateTicket, useFactory: (t, ev, cat, con, dir) => new CreateTicket(t, ev, cat, con, dir), inject: [TOKENS.TicketRepository, TOKENS.TicketEventRepository, TOKENS.CatalogQuery, TOKENS.ContractsQuery, TOKENS.DirectoryQuery] },
    { provide: AssignTicket, useFactory: (t, ev, dir) => new AssignTicket(t, ev, dir), inject: [TOKENS.TicketRepository, TOKENS.TicketEventRepository, TOKENS.DirectoryQuery] },
    { provide: ChangeStatus, useFactory: (t, ev) => new ChangeStatus(t, ev), inject: [TOKENS.TicketRepository, TOKENS.TicketEventRepository] },
    { provide: AddComment, useFactory: (c, ev) => new AddComment(c, ev), inject: [TOKENS.TicketCommentRepository, TOKENS.TicketEventRepository] },
    { provide: LinkTickets, useFactory: (l, ev) => new LinkTickets(l, ev), inject: [TOKENS.TicketLinkRepository, TOKENS.TicketEventRepository] },
    { provide: ListTickets, useFactory: (t) => new ListTickets(t), inject: [TOKENS.TicketRepository] },
    { provide: GetTicketDetail, useFactory: (t, ev, c, l) => new GetTicketDetail(t, ev, c, l), inject: [TOKENS.TicketRepository, TOKENS.TicketEventRepository, TOKENS.TicketCommentRepository, TOKENS.TicketLinkRepository] },
  ],
  exports: [SequelizeModule],
})
export class TicketsModuleV2 {}
