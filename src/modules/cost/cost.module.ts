import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TicketCost } from './models/ticket-cost.model';
import { TicketPart } from './models/ticket-part.model';
import { Ticket } from '../tickets/models/ticket.model';
import { TicketEvent } from '../tickets/models/ticket-event.model';
import { Team } from '../directory/models/team.model';
import { TeamMember } from '../directory/models/team-member.model';
import { User } from '../directory/models/user.model';
import { ContractVersion } from '../contracts/models/contract-version.model';
import { CostController } from './infra/cost.controller';
import { TOKENS } from './domain/ports';
import { SequelizeTicketCostRepository } from './adapters/ticket-cost.repository.sequelize';
import { SequelizeTicketPartRepository } from './adapters/ticket-part.repository.sequelize';
import { SequelizeTicketsQueryForCost, SequelizeTeamsQueryForCost, SequelizeDirectoryQueryForCost, AdminScopeGuardAdapter, SequelizeTicketEventCommandForCost, SequelizeContractsQueryForCost, ApprovalsCommandAdapter, ApprovalsQueryAdapter } from './adapters/queries.sequelize';
import { UpsertLaborCost } from './domain/use-cases/UpsertLaborCost';
import { AddOrUpdatePart } from './domain/use-cases/AddOrUpdatePart';
import { RemovePart } from './domain/use-cases/RemovePart';
import { RecalculateFromParts } from './domain/use-cases/RecalculateFromParts';
import { GetTicketCostSummary } from './domain/use-cases/GetTicketCostSummary';
import { EnsureApprovalForCharge } from './domain/use-cases/EnsureApprovalForCharge';
import { AuthModule } from '../auth/auth.module';
import { AuthActorService } from '../auth/auth-actor.service';
import { AdminScopeEvaluatorService } from '../auth/admin-scope-evaluator.service';
import { ApprovalsModule } from '../approvals/approvals.module';
import { EvaluateApprovalNeed } from '../approvals/domain/use-cases/EvaluateApprovalNeed';
import { GetApprovalStatusForTicket } from '../approvals/domain/use-cases/GetApprovalStatusForTicket';

@Module({
  imports: [SequelizeModule.forFeature([TicketCost, TicketPart, Ticket, TicketEvent, Team, TeamMember, User, ContractVersion]), ApprovalsModule, AuthModule],
  controllers: [CostController],
  providers: [
    { provide: TOKENS.TicketCostRepository, useClass: SequelizeTicketCostRepository },
    { provide: TOKENS.TicketPartRepository, useClass: SequelizeTicketPartRepository },
    { provide: TOKENS.TicketsQuery, useClass: SequelizeTicketsQueryForCost },
    { provide: TOKENS.TeamsQuery, useClass: SequelizeTeamsQueryForCost },
    { provide: TOKENS.DirectoryQuery, useClass: SequelizeDirectoryQueryForCost },
    { provide: TOKENS.AdminScopeGuard, useFactory: (actors, evaluator) => new AdminScopeGuardAdapter(actors, evaluator), inject: [AuthActorService, AdminScopeEvaluatorService] },
    { provide: TOKENS.TicketEventCommand, useClass: SequelizeTicketEventCommandForCost },
    { provide: TOKENS.ContractsQuery, useClass: SequelizeContractsQueryForCost },
    { provide: TOKENS.ApprovalsQuery, useFactory: (uc) => new ApprovalsQueryAdapter(uc), inject: [GetApprovalStatusForTicket] },
    { provide: TOKENS.ApprovalsCommand, useFactory: (uc) => new ApprovalsCommandAdapter(uc), inject: [EvaluateApprovalNeed] },
    // Use-cases
    { provide: UpsertLaborCost, useFactory: (costs, ev, tq, guard, dirs, teams, cq, ac) => new UpsertLaborCost(costs, ev, tq, guard, dirs, teams, cq, ac), inject: [TOKENS.TicketCostRepository, TOKENS.TicketEventCommand, TOKENS.TicketsQuery, TOKENS.AdminScopeGuard, TOKENS.DirectoryQuery, TOKENS.TeamsQuery, TOKENS.ContractsQuery, TOKENS.ApprovalsCommand] },
    { provide: AddOrUpdatePart, useFactory: (parts, costs, ev, tq, guard, dirs, teams, aq, ac) => new AddOrUpdatePart(parts, costs, ev, tq, guard, dirs, teams, aq, ac), inject: [TOKENS.TicketPartRepository, TOKENS.TicketCostRepository, TOKENS.TicketEventCommand, TOKENS.TicketsQuery, TOKENS.AdminScopeGuard, TOKENS.DirectoryQuery, TOKENS.TeamsQuery, TOKENS.ApprovalsQuery, TOKENS.ApprovalsCommand] },
    { provide: RemovePart, useFactory: (parts, costs, ev, tq, guard, dirs, teams) => new RemovePart(parts, costs, ev, tq, guard, dirs, teams), inject: [TOKENS.TicketPartRepository, TOKENS.TicketCostRepository, TOKENS.TicketEventCommand, TOKENS.TicketsQuery, TOKENS.AdminScopeGuard, TOKENS.DirectoryQuery, TOKENS.TeamsQuery] },
    { provide: RecalculateFromParts, useFactory: (parts, costs, ev) => new RecalculateFromParts(parts, costs, ev), inject: [TOKENS.TicketPartRepository, TOKENS.TicketCostRepository, TOKENS.TicketEventCommand] },
    { provide: GetTicketCostSummary, useFactory: (costs, parts) => new GetTicketCostSummary(costs, parts), inject: [TOKENS.TicketCostRepository, TOKENS.TicketPartRepository] },
    { provide: EnsureApprovalForCharge, useFactory: (tq, cq, aq, ac) => new EnsureApprovalForCharge(tq, cq, aq, ac), inject: [TOKENS.TicketsQuery, TOKENS.ContractsQuery, TOKENS.ApprovalsQuery, TOKENS.ApprovalsCommand] },
    // Cross services
  ],
  exports: [SequelizeModule],
})
export class CostModule {}
