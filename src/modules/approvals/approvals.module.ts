import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ApprovalRequest } from './approval-request.model';
import { ApprovalsController } from './infra/approvals.controller';
import { TOKENS } from './domain/ports';
import { SequelizeApprovalRequestRepository } from './adapters/approval-request.repository.sequelize';
import { SequelizeTicketsQuery, SequelizeContractsQuery, SequelizeDirectoryQueryForApprovals, SequelizeTicketEventCommandForApprovals, NullCostQuery, AdminScopeGuardAdapter } from './adapters/queries.sequelize';
import { NoopTicketCommand } from './adapters/commands.stubs';
import { EvaluateApprovalNeed } from './domain/use-cases/EvaluateApprovalNeed';
import { CreateApprovalRequest } from './domain/use-cases/CreateApprovalRequest';
import { DecideApproval } from './domain/use-cases/DecideApproval';
import { ListApprovalRequests } from './domain/use-cases/ListApprovalRequests';
import { GetApprovalStatusForTicket } from './domain/use-cases/GetApprovalStatusForTicket';
import { Ticket } from '../tickets/models/ticket.model';
import { TicketEvent } from '../tickets/models/ticket-event.model';
import { ContractVersion } from '../contracts/models/contract-version.model';
import { User } from '../directory/models/user.model';
import { AuthActorService } from '../auth/auth-actor.service';
import { UsersModule } from '../directory/users/users.module';
import { AdminScope } from '../directory/models/admin-scope.model';
import { AdminScopeEvaluatorService } from '../auth/admin-scope-evaluator.service';
import { Site } from '../catalog/models/site.model';
import { Building } from '../catalog/models/buildings.model';

@Module({
  imports: [SequelizeModule.forFeature([ApprovalRequest, Ticket, TicketEvent, ContractVersion, User, Site, Building, AdminScope]), UsersModule],
  controllers: [ApprovalsController],
  providers: [
    // Ports
    { provide: TOKENS.ApprovalRequestRepository, useClass: SequelizeApprovalRequestRepository },
    { provide: TOKENS.TicketsQuery, useClass: SequelizeTicketsQuery },
    { provide: TOKENS.ContractsQuery, useClass: SequelizeContractsQuery },
    { provide: TOKENS.DirectoryQuery, useClass: SequelizeDirectoryQueryForApprovals },
    { provide: TOKENS.TicketEventCommand, useClass: SequelizeTicketEventCommandForApprovals },
    { provide: TOKENS.CostQuery, useClass: NullCostQuery },
    { provide: TOKENS.AdminScopeGuard, useFactory: (actors, evaluator) => new AdminScopeGuardAdapter(actors, evaluator), inject: [AuthActorService, AdminScopeEvaluatorService] },
    { provide: TOKENS.TicketCommand, useClass: NoopTicketCommand },
    // Use-cases
    { provide: EvaluateApprovalNeed, useFactory: (repo, tq, cq, cost, ev) => new EvaluateApprovalNeed(repo, tq, cq, cost, ev), inject: [TOKENS.ApprovalRequestRepository, TOKENS.TicketsQuery, TOKENS.ContractsQuery, TOKENS.CostQuery, TOKENS.TicketEventCommand] },
    { provide: CreateApprovalRequest, useFactory: (repo, ev) => new CreateApprovalRequest(repo, ev), inject: [TOKENS.ApprovalRequestRepository, TOKENS.TicketEventCommand] },
    { provide: DecideApproval, useFactory: (repo, tq, dirs, guard, cq, ev, cmd) => new DecideApproval(repo, tq, dirs, guard, cq, ev, cmd), inject: [TOKENS.ApprovalRequestRepository, TOKENS.TicketsQuery, TOKENS.DirectoryQuery, TOKENS.AdminScopeGuard, TOKENS.ContractsQuery, TOKENS.TicketEventCommand, TOKENS.TicketCommand] },
    { provide: ListApprovalRequests, useFactory: (repo, guard) => new ListApprovalRequests(repo, guard), inject: [TOKENS.ApprovalRequestRepository, TOKENS.AdminScopeGuard] },
    { provide: GetApprovalStatusForTicket, useFactory: (repo) => new GetApprovalStatusForTicket(repo), inject: [TOKENS.ApprovalRequestRepository] },
    // Cross-module services
    AuthActorService,
    AdminScopeEvaluatorService,
  ],
  exports: [
    SequelizeModule,
    EvaluateApprovalNeed,
    CreateApprovalRequest,
    DecideApproval,
    ListApprovalRequests,
    GetApprovalStatusForTicket,
    TOKENS.TicketEventCommand,
    TOKENS.TicketsQuery,
    TOKENS.ContractsQuery,
    TOKENS.CostQuery,
  ],
})
export class ApprovalsModule {}
