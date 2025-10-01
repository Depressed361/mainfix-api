import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { CatalogQuery, ContractsQuery, DirectoryQuery, TicketEntity, TicketEventRepository, TicketRepository, TicketPriority } from '../ports';
import { computeSlaTargets } from '../policies';
import { InvalidInputError } from '../errors';

export class CreateTicket {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly events: TicketEventRepository,
    private readonly catalog: CatalogQuery,
    private readonly contracts: ContractsQuery,
    private readonly directory: DirectoryQuery,
  ) {}

  async execute(actor: AuthenticatedActor, p: { siteId: string; buildingId?: string; locationId?: string; assetId?: string; categoryId: string; priority: TicketPriority; title: string; description?: string; contractVersionId: string }): Promise<TicketEntity> {
    const actorMeta = await this.directory.getUserMeta(actor.id);
    if (!actorMeta.active) throw new InvalidInputError('tickets.actor.inactive');
    const site = await this.catalog.getSiteMeta(p.siteId);
    const included = await this.contracts.isCategoryIncluded(p.contractVersionId, p.categoryId);
    if (!included) throw new InvalidInputError('tickets.contract.category_excluded');
    const sla = await this.contracts.getCategorySla(p.contractVersionId, p.categoryId);
    if (!sla) throw new InvalidInputError('tickets.contract.sla_missing');
    const createdAt = new Date();
    const { ackDueAt, resolveDueAt } = computeSlaTargets(createdAt, p.priority, sla);
    const ticket = await this.tickets.create({
      companyId: site.companyId,
      siteId: p.siteId,
      buildingId: p.buildingId ?? null,
      locationId: p.locationId ?? null,
      assetId: p.assetId ?? null,
      categoryId: p.categoryId,
      reporterId: actor.id,
      assigneeTeamId: null,
      status: 'open',
      priority: p.priority,
      title: p.title,
      description: p.description ?? null,
      contractSnapshot: { contractVersionId: p.contractVersionId, siteId: p.siteId, sla },
      ackDueAt,
      resolveDueAt,
    });
    await this.events.append({ ticketId: ticket.id, actorUserId: actor.id, type: 'STATUS_CHANGED', payload: { to: 'open' } });
    return ticket;
  }
}

