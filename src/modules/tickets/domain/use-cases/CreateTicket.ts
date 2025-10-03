import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type {
  CatalogQuery,
  ContractsQuery,
  DirectoryQuery,
  TicketEntity,
  TicketEventRepository,
  TicketRepository,
  TicketPriority,
} from '../ports';
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

  async execute(
    actor: AuthenticatedActor,
    p: {
      siteId: string;
      buildingId?: string;
      locationId?: string;
      assetId?: string;
      categoryId: string;
      priority: TicketPriority;
      title: string;
      description?: string;
      contractVersionId: string;
    },
  ): Promise<TicketEntity> {
    const reporterId = (actor as any).id ?? (actor as any).userId;
    if (!reporterId) {
      throw new InvalidInputError('tickets.actor.missing');
    }
    const actorMeta = await this.directory.getUserMeta(reporterId);
    if (!actorMeta.active)
      throw new InvalidInputError('tickets.actor.inactive');
    const site = await this.catalog.getSiteMeta(p.siteId);
    const included = await this.contracts.isCategoryIncluded(
      p.contractVersionId,
      p.categoryId,
    );
    if (!included)
      throw new InvalidInputError('tickets.contract.category_excluded');
    const contractMeta = await this.contracts.getContractVersionMeta(
      p.contractVersionId,
    );
    if (contractMeta.siteId !== p.siteId) {
      throw new InvalidInputError('tickets.contract.site_mismatch');
    }
    if (contractMeta.companyId && contractMeta.companyId !== site.companyId) {
      throw new InvalidInputError('tickets.contract.company_mismatch');
    }
    const sla = await this.contracts.getCategorySla(
      p.contractVersionId,
      p.categoryId,
    );
    if (!sla) throw new InvalidInputError('tickets.contract.sla_missing');
    const createdAt = new Date();
    const { ackDueAt, resolveDueAt } = computeSlaTargets(
      createdAt,
      p.priority,
      sla,
    );
    const snapshotCategories = contractMeta.categories.map((cat) => ({
      categoryId: cat.categoryId,
      included: cat.included,
      sla: cat.sla,
    }));
    if (!snapshotCategories.some((cat) => cat.categoryId === p.categoryId)) {
      snapshotCategories.push({
        categoryId: p.categoryId,
        included: included,
        sla,
      });
    }
    const ticket = await this.tickets.create({
      companyId: site.companyId,
      siteId: p.siteId,
      buildingId: p.buildingId ?? null,
      locationId: p.locationId ?? null,
      assetId: p.assetId ?? null,
      categoryId: p.categoryId,
      reporterId,
      assigneeTeamId: null,
      status: 'open',
      priority: p.priority,
      title: p.title,
      description: p.description ?? null,
      contractId: contractMeta.contractId,
      contractVersion: contractMeta.version,
      contractSnapshot: {
        contractVersionId: p.contractVersionId,
        contractId: contractMeta.contractId,
        version: contractMeta.version,
        siteId: contractMeta.siteId,
        coverage: contractMeta.coverage,
        escalation: contractMeta.escalation ?? null,
        approvals: contractMeta.approvals ?? null,
        categories: snapshotCategories,
      },
      ackDueAt,
      resolveDueAt,
    });
    await this.events.append({
      ticketId: ticket.id,
      actorUserId: reporterId,
      type: 'STATUS_CHANGED',
      payload: { to: 'open' },
    });
    return ticket;
  }
}
