import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from './models/ticket.model';
import { TicketEvent } from './models/ticket-event.model';
import { TicketLink } from './models/ticket-link.model';
import { TicketComment } from './ticket-comment.model';
import { TicketAttachment } from './ticket-attachment.model';
import { CompetencyMatrix } from '../competency/models/competency-matrix.model';
import { ContractVersion } from '../contracts/models/contract-version.model';
import { TicketsController } from './controllers/tickets.controller';
import { Team } from '../directory/models/team.model';
import {
  TicketCommentsController,
  TicketCommentsAdminController,
} from './controllers/ticket-comments.controller';
import {
  TicketAttachmentsController,
  TicketAttachmentsAdminController,
} from './controllers/ticket-attachments.controller';
import { TicketsService } from './services/tickets.service';
import { TicketAssignmentService } from './services/ticket-assignment.service';
import { TicketCommentsService } from './services/ticket-comments.service';
import { TicketAttachmentsService } from './services/ticket-attachments.service';
import { Building } from '../catalog/models/buildings.model';
import { Location } from '../catalog/models/location.model';
import { Asset } from '../catalog/models/asset.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Ticket,
      TicketEvent,
      TicketLink,
      TicketComment,
      TicketAttachment,
      CompetencyMatrix,
      ContractVersion,
      Team,
      Building,
      Location,
      Asset,
    ]),
  ],
  controllers: [
    TicketsController,
    TicketCommentsController,
    TicketCommentsAdminController,
    TicketAttachmentsController,
    TicketAttachmentsAdminController,
  ],
  providers: [
    TicketsService,
    TicketAssignmentService,
    TicketCommentsService,
    TicketAttachmentsService,
  ],
  exports: [SequelizeModule, TicketsService],
})
export class TicketsModule {}
