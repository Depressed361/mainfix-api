import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Transaction } from 'sequelize';

import { Ticket } from '../models/ticket.model';

/**
 * Statuts considérés comme "ouverts" pour la charge.
 * ATTENTION: s'aligne avec les valeurs réellement stockées en DB.
 */
const OPEN_STATUSES = [
  'draft', // Temporarily disabled
  'open',
  'assigned',
  'in_progress',
  'awaiting_confirmation',
  'resolved',
  'closed',
  'cancelled',
] as const;

type OpenStatus = (typeof OPEN_STATUSES)[number];

/**
 * Contexte minimal nécessaire à l’assignation.
 * NB: contractId/contractVersion peuvent ne PAS être fournis (on les résout via siteId).
 */
export type TicketAssignmentContext = {
  readonly ticketId?: string; // ✅ nouveau: pour relire le ticket si besoin
  readonly siteId?: string; // peut manquer, on le résout
  readonly categoryId?: string;
  readonly buildingId?: string | null;
  readonly locationId?: string | null;
  readonly assetId?: string | null;
  readonly contractId?: string | null;
  readonly contractVersion?: number | null;
};
type TeamLoad = {
  assigneeTeamId: string;
  openCount: number;
};

type EligibleTeamRow = {
  teamId: string;
  level: 'primary' | 'backup';
  window: 'business_hours' | 'after_hours' | 'any';
  buildingId: string | null;
};

@Injectable()
export class TicketAssignmentService {
  /**
   * Garantit un siteId non-undefined :
   * - si ctx.siteId existe → on le retourne
   * - sinon, si ctx.buildingId existe → on le déduit via buildings.site_id
   * - sinon → erreur explicite
   */

  private async ensureSiteId(ctx: {
    ticketId?: string;
    siteId?: string;
    buildingId?: string | null;
    locationId?: string | null;
    assetId?: string | null;
    categoryId?: string;
  }): Promise<string> {
    console.log('ensureSiteId - ctx:', {
      ticketId: ctx.ticketId,
      siteId: ctx.siteId,
      buildingId: ctx.buildingId,
      locationId: ctx.locationId,
      assetId: ctx.assetId,
      categoryId: ctx.categoryId,
    });

    // 1) Déjà fourni
    if (ctx.siteId) return ctx.siteId;

    // 2) Depuis le ticket (id → tickets.site_id)
    if (ctx.ticketId) {
      const t = await this.sequelize.query<{ siteId: string }>(
        `
      SELECT t.site_id AS "siteId"
      FROM tickets t
      WHERE t.id = :ticketId
      LIMIT 1
      `,
        {
          type: QueryTypes.SELECT,
          replacements: { ticketId: ctx.ticketId },
        },
      );
      console.log('ensureSiteId: ticket rows =', t);
      if (t[0]?.siteId) return t[0].siteId;
    }

    // 3) Depuis un building
    if (ctx.buildingId) {
      const b = await this.sequelize.query<{ siteId: string }>(
        `
      SELECT b.site_id AS "siteId"
      FROM buildings b
      WHERE b.id = :buildingId
      LIMIT 1
      `,
        {
          type: QueryTypes.SELECT,
          replacements: { buildingId: ctx.buildingId },
        },
      );
      if (b[0]?.siteId) return b[0].siteId;
    }

    // 4) Depuis une location → building → site
    if (ctx.locationId) {
      const l = await this.sequelize.query<{ siteId: string }>(
        `
      SELECT b.site_id AS "siteId"
      FROM locations l
      JOIN buildings b ON b.id = l.building_id
      WHERE l.id = :locationId
      LIMIT 1
      `,
        {
          type: QueryTypes.SELECT,
          replacements: { locationId: ctx.locationId },
        },
      );
      if (l[0]?.siteId) return l[0].siteId;
    }

    // 5) Depuis un asset → location → building → site
    if (ctx.assetId) {
      const a = await this.sequelize.query<{ siteId: string }>(
        `
      SELECT b.site_id AS "siteId"
      FROM assets a
      LEFT JOIN locations l ON l.id = a.location_id
      LEFT JOIN buildings b ON b.id = l.building_id
      WHERE a.id = :assetId
      LIMIT 1
      `,
        {
          type: QueryTypes.SELECT,
          replacements: { assetId: ctx.assetId },
        },
      );
      if (a[0]?.siteId) return a[0].siteId;
    }

    throw new Error(
      'Cannot resolve siteId: provide siteId or one of (ticketId, buildingId, locationId, assetId) linked to a site',
    );
  }

  private readonly logger = new Logger(TicketAssignmentService.name);

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
  ) {}

  /**
   * Calcule la charge en cours par équipe (tickets ouverts).
   * Utilise une requête SQL brute typée pour éviter les casts dangereux & soucis TS.
   */
  private async getTeamOpenLoads(
    trx?: Transaction,
  ): Promise<Map<string, number>> {
    const rows = await this.sequelize.query<TeamLoad>(
      `
      SELECT
        assignee_team_id AS "assigneeTeamId",
        COUNT(*)::int     AS "openCount"
      FROM tickets
      WHERE assignee_team_id IS NOT NULL
        AND status IN (:openStatuses)
      GROUP BY assignee_team_id
      `,
      {
        type: QueryTypes.SELECT,
        // IMPORTANT: passer un tableau, Sequelize l'expanse correctement sur IN (...)
        replacements: {
          openStatuses: OPEN_STATUSES as ReadonlyArray<OpenStatus>,
        },
        transaction: trx,
      },
    );

    return new Map(rows.map((r) => [r.assigneeTeamId, r.openCount]));
  }

  /**
   * Résout (si besoin) le couple (contractId, contractVersion) actif pour un site donné.
   * - Hypothèse: 1 contrat actif par site, on prend la version la plus récente.
   * - Ne renvoie pas d'erreur silencieuse: si rien, on jette une Error explicite.
   */
  private async resolveActiveContractForSite(
    siteId: string,
    trx?: Transaction,
  ): Promise<{
    contractId: string;
    contractVersion: number;
    contractVersionId: string;
  }> {
    const rows = await this.sequelize.query<{
      contractId: string;
      contractVersion: number;
      contractVersionId: string;
    }>(
      `
      SELECT
        c.id       AS "contractId",
        cv.version AS "contractVersion",
        cv.id      AS "contractVersionId"
      FROM contracts c
      JOIN contract_versions cv
        ON cv.contract_id = c.id
      WHERE c.site_id = :siteId
        AND c.active = TRUE
      ORDER BY cv.version DESC
      LIMIT 1
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { siteId },
        transaction: trx,
      },
    );

    const row = rows[0];
    if (!row) {
      throw new Error(`No active contract for site ${siteId}`);
    }
    return row;
  }

  /**
   * Récupère les équipes éligibles via competency_matrix:
   * - JOIN sur contract_versions avec (contractId, contractVersion)
   * - Filtre par categoryId
   * - buildingId: accepte NULL (règle "toute zone du site") OU égalité stricte
   */
  private async resolveEligibleTeams(
    ctx: TicketAssignmentContext,
    trx?: Transaction,
  ): Promise<EligibleTeamRow[]> {
    // ✅ siteId non-undefined garanti
    const siteId = await this.ensureSiteId(ctx);

    // 1) S'assurer d'avoir contractId + contractVersion (depuis le site si manquants)
    let contractId = ctx.contractId ?? null;
    let contractVersion = ctx.contractVersion ?? null;

    if (!contractId || contractVersion == null) {
      const cv = await this.resolveActiveContractForSite(siteId, trx);
      contractId = cv.contractId;
      contractVersion = cv.contractVersion;
      this.logger.debug(
        `Resolved active contract for site=${siteId} → ${contractId} v${contractVersion}`,
      );
    }

    // 2) Éligibilité via competency_matrix + contract_versions
    const rows = await this.sequelize.query<EligibleTeamRow>(
      `
    SELECT
      cm.team_id     AS "teamId",
      cm.level       AS "level",
      cm.window      AS "window",
      cm.building_id AS "buildingId"
    FROM competency_matrix cm
    JOIN contract_versions cv
      ON cv.id = cm.contract_version_id
    WHERE
      cv.contract_id = :contractId
      AND cv.version = :contractVersion
      AND cm.category_id = :categoryId
      AND (
        cm.building_id IS NULL
        OR cm.building_id = :buildingId
      )
    `,
      {
        type: QueryTypes.SELECT,
        replacements: {
          contractId, // ✅ défini
          contractVersion, // ✅ défini
          categoryId: ctx.categoryId, // ✅ requis
          buildingId: ctx.buildingId ?? null, // ✅ null explicite si absent
        },
        transaction: trx,
      },
    );

    return rows;
  }

  /**
   * Choisit la "meilleure" team parmi les éligibles, selon:
   *  1) openCount croissant (least-load)
   *  2) level 'primary' avant 'backup'
   *  3) window 'business_hours' > 'any' > 'after_hours' (tie-break simple)
   */
  async chooseBestTeam(
    ctx: TicketAssignmentContext,
    trx?: Transaction,
  ): Promise<string | null> {
    const [eligible, loadByTeam] = await Promise.all([
      this.resolveEligibleTeams(ctx, trx),
      this.getTeamOpenLoads(trx),
    ]);

    if (eligible.length === 0) {
      this.logger.warn(
        `No eligible teams for category=${ctx.categoryId} site=${ctx.siteId} building=${ctx.buildingId ?? '∅'}`,
      );
      return null;
    }

    const windowRank = (w: EligibleTeamRow['window']): number => {
      switch (w) {
        case 'business_hours':
          return 0;
        case 'any':
          return 1;
        case 'after_hours':
          return 2;
        default:
          return 3;
      }
    };

    // On trie avec des tie-breakers déterministes
    const best = [...eligible].sort((a, b) => {
      const aLoad = loadByTeam.get(a.teamId) ?? 0;
      const bLoad = loadByTeam.get(b.teamId) ?? 0;
      if (aLoad !== bLoad) return aLoad - bLoad;

      if (a.level !== b.level) {
        // 'primary' < 'backup'
        return a.level === 'primary' ? -1 : 1;
      }

      return windowRank(a.window) - windowRank(b.window);
    })[0];

    return best?.teamId ?? null;
  }

  /**
   * Assigne une équipe à un ticket en base (via le modèle).
   * - Ne modifie PAS le statut ici (ça dépend de ta machine d’état).
   */
  async assignTicket(
    ticketId: string,
    assigneeTeamId: string | null,
    trx?: Transaction,
  ): Promise<void> {
    await this.ticketModel.update(
      { assigneeTeamId: assigneeTeamId ?? undefined },
      { where: { id: ticketId }, transaction: trx },
    );
  }

  /**
   * Flux complet d’auto-assignation pour un ticket existant:
   * - Construit le contexte minimal
   * - Choisit la meilleure équipe
   * - Écrit l’assignation (assigneeTeamId)
   *
   * NOTE: à appeler depuis ton service métier juste après la création du ticket.
   */
  async autoAssignExistingTicket(
    ticket: {
      readonly id: string;
      readonly siteId?: string; // peut être undefined selon le flux au moment T
      readonly categoryId: string;
      readonly buildingId?: string | null;
      readonly contractId?: string | null;
      readonly contractVersion?: number | null;
      readonly locationId?: string | null; // si dispo
      readonly assetId?: string | null; // si dispo
    },
    trx?: Transaction,
  ): Promise<string | null> {
    const ctx: TicketAssignmentContext = {
      ticketId: ticket.id, // ✅ pour fallback ensureSiteId
      siteId: ticket.siteId, // si présent, tant mieux
      categoryId: ticket.categoryId,
      buildingId: ticket.buildingId ?? null,
      contractId: ticket.contractId ?? null,
      contractVersion: ticket.contractVersion ?? null,
      locationId: ticket.locationId ?? null,
      assetId: ticket.assetId ?? null,
    };

    const teamId = await this.chooseBestTeam(ctx, trx);
    await this.assignTicket(ticket.id, teamId, trx);

    this.logger.log(
      `Ticket ${ticket.id} assigned to team=${teamId ?? '∅'} (category=${ctx.categoryId})`,
    );

    return teamId;
  }

  /** S'assure de l'eligibilité d'une équipe pour un ticket donné */ async ensureTeamEligibility(
    ticket: {
      readonly id: string;
      readonly siteId?: string; // peut être undefined selon le flux au moment T
      readonly categoryId: string;
      readonly buildingId?: string | null;
      readonly contractId?: string | null;
      readonly contractVersion?: number | null;
      readonly locationId?: string | null; // si dispo
      readonly assetId?: string | null; // si dispo
    },
    teamId: string,
    trx?: Transaction,
  ): Promise<boolean> {
    const ctx: TicketAssignmentContext = {
      ticketId: ticket.id, // ✅ pour fallback ensureSiteId
      siteId: ticket.siteId, // si présent, tant mieux
      categoryId: ticket.categoryId,
      buildingId: ticket.buildingId ?? null,
      contractId: ticket.contractId ?? null,
      contractVersion: ticket.contractVersion ?? null,
      locationId: ticket.locationId ?? null,
      assetId: ticket.assetId ?? null,
    };

    const eligibleTeams = await this.resolveEligibleTeams(ctx, trx);
    return eligibleTeams.some((et) => et.teamId === teamId);
  }
}
