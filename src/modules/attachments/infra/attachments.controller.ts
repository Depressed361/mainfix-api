import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { InitiateUpload } from '../domain/use-cases/InitiateUpload';
import { CompleteUpload } from '../domain/use-cases/CompleteUpload';
import { ListTicketAttachments } from '../domain/use-cases/ListTicketAttachments';
import { GetDownloadUrl } from '../domain/use-cases/GetDownloadUrl';
import { DeleteAttachment } from '../domain/use-cases/DeleteAttachment';
import { CompleteUploadDto, InitiateUploadDto, ListAttachmentsQueryDto } from './dto';

@Controller('attachments')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class AttachmentsController {
  constructor(
    private readonly initiate: InitiateUpload,
    private readonly complete: CompleteUpload,
    private readonly list: ListTicketAttachments,
    private readonly download: GetDownloadUrl,
    private readonly removeUc: DeleteAttachment,
  ) {}

  @Post('tickets/initiate')
  @HttpCode(HttpStatus.CREATED)
  initiateUpload(@Body() dto: InitiateUploadDto, @AdminContextDecorator() actor: AuthenticatedActor) { return this.initiate.execute(actor, dto) }

  @Post('tickets/complete')
  completeUpload(@Body() dto: CompleteUploadDto, @AdminContextDecorator() actor: AuthenticatedActor) { return this.complete.execute(actor, dto) }

  @Get('tickets')
  listByTicket(@Query() q: ListAttachmentsQueryDto, @AdminContextDecorator() actor: AuthenticatedActor) { return this.list.execute(actor, q) }

  @Get(':id/download')
  getDownload(@Param('id') id: string, @AdminContextDecorator() actor: AuthenticatedActor) { return this.download.execute(actor, id) }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @AdminContextDecorator() actor: AuthenticatedActor) { await this.removeUc.execute(actor, id) }
}

