import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SlaTarget } from './sla-target.model';
import { SlaBreach } from './sla-breach.model';
import { SlaController } from './infra/sla.controller';
import { TOKENS } from './domain/ports';
import { SequelizeSlaTargetRepository } from './adapters/sla-target.repository.sequelize';
import { SequelizeSlaBreachRepository } from './adapters/sla-breach.repository.sequelize';
import { UpsertSlaTargetsOnTicketCreated } from './domain/use-cases/UpsertSlaTargetsOnTicketCreated';
import { GetSlaForTicket } from './domain/use-cases/GetSlaForTicket';
import { BasicCalendarService } from './adapters/calendar.service.basic';
import { NoopNotifier } from './adapters/notifier.stub';
import { Ticket } from '../tickets/models/ticket.model';
import { StubContractsQuery, SequelizeTicketsQuery } from './adapters/queries.stubs';
@Module({
  imports: [SequelizeModule.forFeature([SlaTarget, SlaBreach, Ticket])],
  controllers: [SlaController],
  providers: [
    { provide: TOKENS.SlaTargetRepository, useClass: SequelizeSlaTargetRepository },
    { provide: TOKENS.SlaBreachRepository, useClass: SequelizeSlaBreachRepository },
    { provide: TOKENS.CalendarService, useClass: BasicCalendarService },
    { provide: TOKENS.Notifier, useClass: NoopNotifier },
    // Stubs for queries; replace with real bindings in composition
    { provide: TOKENS.ContractsQuery, useClass: StubContractsQuery },
    { provide: TOKENS.TicketsQuery, useClass: SequelizeTicketsQuery },
    // Use-cases
    { provide: UpsertSlaTargetsOnTicketCreated, useFactory: (contracts, tickets, targets, cal) => new UpsertSlaTargetsOnTicketCreated(contracts, tickets, targets, cal), inject: [TOKENS.ContractsQuery, TOKENS.TicketsQuery, TOKENS.SlaTargetRepository, TOKENS.CalendarService] },
    { provide: GetSlaForTicket, useFactory: (targets) => new GetSlaForTicket(targets), inject: [TOKENS.SlaTargetRepository] },
  ],
  exports: [SequelizeModule],
})
export class SlaModule {}
