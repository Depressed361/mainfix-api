import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TicketAttachment } from '../tickets/ticket-attachment.model';
import { Ticket } from '../tickets/models/ticket.model';
import { User } from '../directory/models/user.model';
import { TeamMember } from '../directory/models/team-member.model';
import { TicketEvent } from '../tickets/models/ticket-event.model';
import { AttachmentsController } from './infra/attachments.controller';
import { TOKENS } from './domain/ports';
import { SequelizeAttachmentRepository } from './adapters/attachment.repository.sequelize';
import { LocalObjectStorage, NoopAntiVirusScanner, SimpleMimeSniffer, NoopImageProcessor } from './adapters/storage.stubs';
import { SequelizeTicketQuery, SequelizeDirectoryQueryForAttachments, SequelizeTicketEventCommand } from './adapters/queries.sequelize';
import { InitiateUpload } from './domain/use-cases/InitiateUpload';
import { CompleteUpload } from './domain/use-cases/CompleteUpload';
import { ListTicketAttachments } from './domain/use-cases/ListTicketAttachments';
import { GetDownloadUrl } from './domain/use-cases/GetDownloadUrl';
import { DeleteAttachment } from './domain/use-cases/DeleteAttachment';

@Module({
  imports: [SequelizeModule.forFeature([TicketAttachment, Ticket, User, TeamMember, TicketEvent])],
  controllers: [AttachmentsController],
  providers: [
    { provide: TOKENS.AttachmentRepository, useClass: SequelizeAttachmentRepository },
    { provide: TOKENS.ObjectStorage, useClass: LocalObjectStorage },
    { provide: TOKENS.AntiVirusScanner, useClass: NoopAntiVirusScanner },
    { provide: TOKENS.MimeSniffer, useClass: SimpleMimeSniffer },
    { provide: TOKENS.ImageProcessor, useClass: NoopImageProcessor },
    { provide: TOKENS.TicketQuery, useClass: SequelizeTicketQuery },
    { provide: TOKENS.DirectoryQuery, useClass: SequelizeDirectoryQueryForAttachments },
    { provide: TOKENS.TicketEventCommand, useClass: SequelizeTicketEventCommand },
    // Use-cases
    { provide: InitiateUpload, useFactory: (st, dq, tq) => new InitiateUpload(st, dq, tq), inject: [TOKENS.ObjectStorage, TOKENS.DirectoryQuery, TOKENS.TicketQuery] },
    { provide: CompleteUpload, useFactory: (repo, st, av, sn, dq, tq, ev) => new CompleteUpload(repo, st, av, sn, dq, tq, ev), inject: [TOKENS.AttachmentRepository, TOKENS.ObjectStorage, TOKENS.AntiVirusScanner, TOKENS.MimeSniffer, TOKENS.DirectoryQuery, TOKENS.TicketQuery, TOKENS.TicketEventCommand] },
    { provide: ListTicketAttachments, useFactory: (repo, dq, tq) => new ListTicketAttachments(repo, dq, tq), inject: [TOKENS.AttachmentRepository, TOKENS.DirectoryQuery, TOKENS.TicketQuery] },
    { provide: GetDownloadUrl, useFactory: (repo, st, dq, tq) => new GetDownloadUrl(repo, st, dq, tq), inject: [TOKENS.AttachmentRepository, TOKENS.ObjectStorage, TOKENS.DirectoryQuery, TOKENS.TicketQuery] },
    { provide: DeleteAttachment, useFactory: (repo, st, dq, tq, ev) => new DeleteAttachment(repo, st, dq, tq, ev), inject: [TOKENS.AttachmentRepository, TOKENS.ObjectStorage, TOKENS.DirectoryQuery, TOKENS.TicketQuery, TOKENS.TicketEventCommand] },
  ],
  exports: [SequelizeModule],
})
export class AttachmentsModule {}

