import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Transaction, Op, WhereOptions } from 'sequelize';
import { randomUUID } from 'crypto';
import { isUUID } from 'class-validator';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketStatusDto } from '../dto/update-ticket-status.dto';
import { AssignTicketDto } from '../dto/assign-ticket.dto';
import { ListTicketsQueryDto } from '../dto/list-tickets.query.dto';
import { Ticket } from '../models/ticket.model';
import { TicketEvent } from '../models/ticket-event.model';
import { TicketComment } from '../ticket-comment.model';
import { TicketAttachment } from '../ticket-attachment.model';
import {
  TicketAssignmentService,
  type TicketAssignmentContext,
} from './ticket-assignment.service';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { Building } from '../../catalog/models/buildings.model';
import { Location } from '../../catalog/models/location.model';
import { Asset } from '../../catalog/models/asset.model';

export type TicketStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_confirmation'
  | 'resolved'
  | 'closed'
  | 'cancelled'
  | 'draft';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['open', 'cancelled'],
  open: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['awaiting_confirmation', 'resolved', 'cancelled'],
  awaiting_confirmation: ['in_progress', 'resolved', 'closed', 'cancelled'],
  resolved: ['closed', 'in_progress', 'awaiting_confirmation'],
  closed: [],
  cancelled: [],
};

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
    @InjectModel(TicketEvent)
    private readonly eventModel: typeof TicketEvent,
    @InjectModel(TicketComment)
    private readonly commentModel: typeof TicketComment,
    @InjectModel(TicketAttachment)
    private readonly attachmentModel: typeof TicketAttachment,
    private readonly assignmentService: TicketAssignmentService,
    @InjectModel(Building) private readonly buildingModel: typeof Building,
    @InjectModel(Location) private readonly locationModel: typeof Location,
    @InjectModel(Asset) private readonly assetModel: typeof Asset,
  ) {}

  private sequelize() {
    const sequelize = this.ticketModel.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance not available');
    }
    return sequelize;
  }

  // tickets.service.ts (extrait)
  private async deriveSiteIdFromDto(dto: {
    siteId?: string | null;
    buildingId?: string | null;
    locationId?: string | null;
    assetId?: string | null;
  }): Promise<string> {
    if (dto.siteId) return dto.siteId;

    if (dto.buildingId) {
      const building = await this.buildingModel.findByPk(dto.buildingId);
      if (!building) {
        throw new BadRequestException('Unknown buildingId');
      }
      return building.getDataValue('siteId');
    }

    if (dto.locationId) {
      const location = await this.locationModel.findByPk(dto.locationId);
      if (!location) {
        throw new BadRequestException('Unknown locationId');
      }
      const buildingId = location.getDataValue('buildingId');
      if (!buildingId) {
        throw new BadRequestException(
          'Location is not linked to a known building',
        );
      }
      const building = await this.buildingModel.findByPk(buildingId);
      if (!building) {
        throw new BadRequestException(
          'Location is not linked to a known building',
        );
      }
      return building.getDataValue('siteId');
    }

    if (dto.assetId) {
      const asset = await this.assetModel.findByPk(dto.assetId);
      if (!asset) {
        throw new BadRequestException('Unknown assetId');
      }
      const locationId = asset.getDataValue('locationId');
      if (!locationId) {
        throw new BadRequestException(
          'Asset is not linked to a location. Provide siteId, buildingId or locationId.',
        );
      }
      const location = await this.locationModel.findByPk(locationId);
      if (!location) {
        throw new BadRequestException(
          'Asset location is not linked to a building',
        );
      }
      const buildingId = location.getDataValue('buildingId');
      if (!buildingId) {
        throw new BadRequestException(
          'Asset location is not linked to a building',
        );
      }
      const building = await this.buildingModel.findByPk(buildingId);
      if (!building) {
        throw new BadRequestException('Asset building is unknown');
      }
      return building.getDataValue('siteId');
    }

    if (dto.siteId) {
      return dto.siteId;
    }

    throw new BadRequestException(
      'Provide siteId or one of (buildingId, locationId, assetId)',
    );
  }

  private buildAssignmentContext(ticket: Ticket) {
    return {
      ticketId: ticket.id,
      siteId: ticket.siteId ?? undefined,
      categoryId: ticket.categoryId,
      buildingId: ticket.buildingId ?? null,
      locationId: ticket.locationId ?? null,
      assetId: ticket.assetId ?? null,
      contractId: ticket.contractId ?? null,
      contractVersion: ticket.contractVersion ?? null,
    };
  }

  private ensureActorCanAccess(
    actor: AuthenticatedActor | undefined,
    context: { companyId: string; siteId: string; buildingId?: string | null },
  ) {
    if (!actor) return;
    if (actor.scopeStrings.includes('admin:super')) return;
    if (
      actor.companyScopeIds.includes(context.companyId) ||
      actor.companyId === context.companyId
    ) {
      return;
    }
    if (actor.siteScopeIds.includes(context.siteId)) return;
    if (
      context.buildingId &&
      actor.buildingScopeIds.includes(context.buildingId)
    ) {
      return;
    }
    throw new ForbiddenException('Ticket outside of granted scopes');
  }

  private async generateTicketNumber(
    companyId: string,
    transaction?: Transaction,
  ) {
    const prefix = companyId.replace(/-/g, '').slice(0, 6).toUpperCase();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `TK-${prefix}-${randomUUID().slice(0, 6).toUpperCase()}`;
      const existing = await this.ticketModel.findOne({
        where: { number: candidate },
        transaction,
      });
      if (!existing) return candidate;
    }
    throw new Error('Unable to generate ticket number');
  }

  private async recordEvent(
    type: string,
    ticketId: string,
    actorUserId?: string,
    payload?: Record<string, unknown>,
    transaction?: Transaction,
  ) {
    await this.eventModel.create(
      {
        ticketId,
        actorUserId:
          actorUserId && isUUID(actorUserId) ? actorUserId : undefined,
        type,
        payload,
      },
      { transaction },
    );
  }

  async create(dto: CreateTicketDto, actor?: AuthenticatedActor) {
    const resolvedSiteId = await this.deriveSiteIdFromDto({
      siteId: dto.siteId,
      buildingId: dto.buildingId,
      locationId: dto.locationId,
      assetId: dto.assetId,
    });
    this.ensureActorCanAccess(actor, {
      companyId: dto.companyId,
      siteId: resolvedSiteId,
      buildingId: dto.buildingId,
    });

    const sequelize = this.sequelize();
    return sequelize.transaction(async (transaction) => {
      const number = await this.generateTicketNumber(
        dto.companyId,
        transaction,
      );
      const now = new Date();
      const status = dto.draft ? 'draft' : 'open';

      const ticket = await this.ticketModel.create(
        {
          ...dto,
          siteId: resolvedSiteId,
          status,
          number,
          statusUpdatedAt: now,
        } as Ticket,
        { transaction },
      );

      await this.recordEvent(
        'ticket.created',
        ticket.id,
        actor?.id ?? dto.reporterId,
        { status },
        transaction,
      );

      if (!dto.draft) {
        if (dto.assigneeTeamId) {
          await this.applyAssignment(
            ticket,
            dto.assigneeTeamId,
            actor?.id,
            transaction,
            {
              manual: true,
            },
          );
        } else if (dto.autoAssign === true) {
          const ctx = this.buildAssignmentContext(ticket);
          const teamId = await this.assignmentService.chooseBestTeam(
            ctx,
            transaction,
          );
          if (teamId) {
            await this.applyAssignment(ticket, teamId, undefined, transaction, {
              auto: true,
            });
          }
        }
      }

      await ticket.reload({ transaction });
      return ticket;
    });
  }

  async getWithTimeline(id: string) {
    const ticket = await this.ticketModel.findByPk(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    const [events, comments, attachments] = await Promise.all([
      this.eventModel.findAll({
        where: { ticketId: id },
        order: [['created_at', 'ASC']],
      }),
      this.commentModel.findAll({
        where: { ticketId: id },
        order: [['created_at', 'ASC']],
      }),
      this.attachmentModel.findAll({
        where: { ticketId: id },
        order: [['created_at', 'ASC']],
      }),
    ]);
    return { ticket, events, comments, attachments };
  }

  async findAll(actor: AuthenticatedActor, filters: ListTicketsQueryDto) {
    const where: WhereOptions = {};

    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.siteId) where.siteId = filters.siteId;
    if (filters.buildingId) where.buildingId = filters.buildingId;
    if (filters.assigneeTeamId) where.assigneeTeamId = filters.assigneeTeamId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    if (!actor.scopeStrings.includes('admin:super')) {
      const allowedCompanies = new Set<string>(actor.companyScopeIds ?? []);
      if (actor.companyId) allowedCompanies.add(actor.companyId);

      const allowedSites = new Set<string>(actor.siteScopeIds ?? []);
      if (actor.siteId) allowedSites.add(actor.siteId);

      const allowedBuildings = new Set<string>(actor.buildingScopeIds ?? []);

      const scopeFilters: WhereOptions[] = [];
      if (allowedCompanies.size > 0) {
        scopeFilters.push({
          companyId: { [Op.in]: Array.from(allowedCompanies) },
        });
      }
      if (allowedSites.size > 0) {
        scopeFilters.push({ siteId: { [Op.in]: Array.from(allowedSites) } });
      }
      if (allowedBuildings.size > 0) {
        scopeFilters.push({
          buildingId: { [Op.in]: Array.from(allowedBuildings) },
        });
      }

      if (scopeFilters.length === 0) {
        return [];
      }

      where[Op.or] = scopeFilters;
    }

    return this.ticketModel.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  }

  private assertTransition(current: string, next: string) {
    const allowed = STATUS_TRANSITIONS[current] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid status transition ${current} -> ${next}`,
      );
    }
  }

  async updateStatus(
    id: string,
    dto: UpdateTicketStatusDto,
    actor?: AuthenticatedActor,
  ) {
    const ticket = await this.ticketModel.findByPk(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    this.ensureActorCanAccess(actor, {
      companyId: ticket.companyId ?? ticket.getDataValue('companyId'),
      siteId: ticket.siteId ?? ticket.getDataValue('siteId'),
      buildingId: ticket.buildingId ?? ticket.getDataValue('buildingId'),
    });

    const currentStatus = ticket.getDataValue('status');

    if (currentStatus === dto.status) {
      return ticket;
    }

    this.assertTransition(currentStatus, dto.status);

    const transaction = await this.sequelize().transaction();
    try {
      const previousStatus = currentStatus;
      ticket.setDataValue('status', dto.status as Ticket['status']);
      ticket.setDataValue('statusUpdatedAt', new Date());

      if (dto.status === 'resolved') {
        ticket.setDataValue('resolvedAt', new Date());
      }
      if (previousStatus === 'resolved' && dto.status !== 'resolved') {
        const scopeFilters: WhereOptions[] = [];
      }

      if (dto.status === 'cancelled') {
        ticket.setDataValue(
          'assignedAt',
          ticket.getDataValue('assignedAt') ?? undefined,
        );
      }

      await ticket.save({ transaction });
      await this.recordEvent(
        'ticket.status_changed',
        ticket.id,
        actor?.id,
        {
          from: previousStatus,
          to: dto.status,
          note: dto.note,
        },
        transaction,
      );

      await transaction.commit();
      await ticket.reload();
      return ticket;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async assign(id: string, dto: AssignTicketDto, actor?: AuthenticatedActor) {
    const ticket = await this.ticketModel.findByPk(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    this.ensureActorCanAccess(actor, {
      companyId: ticket.companyId ?? ticket.getDataValue('companyId'),
      siteId: ticket.siteId ?? ticket.getDataValue('siteId'),
      buildingId: ticket.buildingId ?? ticket.getDataValue('buildingId'),
    });

    let teamId: string | null = dto.teamId ?? null;
    if (teamId) {
      const eligible = await this.assignmentService.ensureTeamEligibility(
        ticket,
        teamId,
      );
      if (!eligible) {
        throw new BadRequestException('Team is not eligible for this ticket');
      }
    } else if (dto.auto !== false) {
      const assignmentCtx = this.buildAssignmentContext(ticket);
      const chosenTeamId =
        await this.assignmentService.chooseBestTeam(assignmentCtx);
      if (!chosenTeamId) {
        this.logger.warn(`No eligible team found for ticket ${ticket.id}`);
        return ticket;
      }
      teamId = chosenTeamId;
    } else {
      throw new BadRequestException('teamId must be provided when auto=false');
    }
    if (!teamId) {
      throw new BadRequestException('Unable to determine assignee team');
    }

    await this.sequelize().transaction(async (transaction) => {
      await this.applyAssignment(ticket, teamId, actor?.id, transaction, {
        manual: !!dto.teamId,
        auto: !dto.teamId,
      });
    });

    await ticket.reload();
    return ticket;
  }

  private async applyAssignment(
    ticket: Ticket,
    teamId: string,
    actorId?: string,
    transaction?: Transaction,
    meta?: { manual?: boolean; auto?: boolean },
  ) {
    const previousTeam = ticket.getDataValue('assigneeTeamId');
    const previousStatus = ticket.getDataValue('status');

    ticket.setDataValue('assigneeTeamId', teamId);
    ticket.setDataValue('assignedAt', new Date());

    let statusChanged = false;
    if (['draft', 'open'].includes(ticket.getDataValue('status'))) {
      ticket.setDataValue('status', 'assigned');
      statusChanged = true;
    }
    if (statusChanged) {
      ticket.setDataValue('statusUpdatedAt', new Date());
    }

    await ticket.save({ transaction });

    await this.recordEvent(
      'ticket.assigned',
      ticket.id,
      actorId,
      {
        previousTeam,
        teamId,
        method: meta?.manual ? 'manual' : meta?.auto ? 'auto' : 'system',
      },
      transaction,
    );

    if (statusChanged) {
      await this.recordEvent(
        'ticket.status_changed',
        ticket.id,
        actorId,
        { from: previousStatus, to: 'assigned' },
        transaction,
      );
    }
  }

  async remove(id: string) {
    const t = await this.ticketModel.findByPk(id);
    if (!t) throw new NotFoundException('Ticket not found');
    await t.destroy();
    return { deleted: true };
  }
}
