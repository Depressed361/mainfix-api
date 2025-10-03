import type {
  CompetencyMatrixRepository,
  TeamZoneRepository,
  TeamSkillRepository,
  TeamQuery,
  TaxonomyQuery,
  UUID,
  CompetencyLevel,
} from '../ports';

export interface EligibilityCtx {
  contractVersionId: UUID;
  categoryId: UUID;
  buildingId?: UUID | null;
  timeWindow: 'business_hours' | 'after_hours';
  preferLevel?: CompetencyLevel | 'any';
}

export class ResolveEligibleTeams {
  constructor(
    private readonly matrix: CompetencyMatrixRepository,
    private readonly zones: TeamZoneRepository,
    private readonly skills: TeamSkillRepository,
    private readonly teams: TeamQuery,
    private readonly taxonomy: TaxonomyQuery,
  ) {}

  async eligibleTeams(ctx: EligibilityCtx): Promise<UUID[]> {
    // Load competency matrix lines for contract+category
    const rows = await this.matrix.listByCategory(
      ctx.contractVersionId,
      ctx.categoryId,
    );
    // eslint-disable-next-line no-console
    console.log('[EligibleTeams] rows', rows.length);
    // eslint-disable-next-line no-console
    console.log(
      '[EligibleTeams] rows detail',
      rows.map((r) => ({
        teamId: r.teamId,
        level: r.level,
        window: r.window,
        buildingId: r.buildingId ?? null,
      })),
    );

    // Filter by window
    const winRows = rows.filter(
      (r) => r.window === 'any' || r.window === ctx.timeWindow,
    );
    // eslint-disable-next-line no-console
    console.log('[EligibleTeams] winRows', winRows.length, 'timeWindow=', ctx.timeWindow);
    // eslint-disable-next-line no-console
    console.log(
      '[EligibleTeams] winRows detail',
      winRows.map((r) => ({
        teamId: r.teamId,
        level: r.level,
        window: r.window,
        buildingId: r.buildingId ?? null,
      })),
    );

    // Filter by building
    const buildingId = ctx.buildingId ?? null;
    const specific = buildingId
      ? winRows.filter((r) => r.buildingId === buildingId)
      : [];
    const generic = winRows.filter((r) => r.buildingId === null);
    const chosen = buildingId
      ? specific.length > 0
        ? specific
        : generic
      : generic;
    // eslint-disable-next-line no-console
    console.log('[EligibleTeams] chosen', chosen.length, 'specific=', specific.length, 'generic=', generic.length, 'buildingId=', buildingId);

    // Team active
    const actives = await Promise.all(
      chosen.map(async (r) => ({
        r,
        meta: await this.teams.getTeamMeta(r.teamId),
      })),
    );
    const activeRows = actives.filter((x) => x.meta.active).map((x) => x.r);
    // eslint-disable-next-line no-console
    console.log('[EligibleTeams] activeRows', activeRows.length);

    // Zones
    let zoneRows = activeRows;
    if (buildingId) {
      const checks = await Promise.all(
        zoneRows.map((r) => this.zones.exists(r.teamId, buildingId)),
      );
      zoneRows = zoneRows.filter((_r, i) => checks[i]);
      // eslint-disable-next-line no-console
      console.log('[EligibleTeams] zoneRows', zoneRows.length);
      // eslint-disable-next-line no-console
      console.log(
        '[EligibleTeams] zoneRows detail',
        zoneRows.map((r) => ({ teamId: r.teamId, level: r.level })),
      );
    }

    // Skills check for primary (ensure team has all required skills)
    const required = await this.taxonomy.requiredSkillsForCategory(
      ctx.categoryId,
    );
    let teamSkillsMap: Map<string, Set<string>> | undefined;
    if (required.length > 0) {
      const grouped: Record<string, { level: CompetencyLevel }[]> = {};
      for (const r of zoneRows) {
        if (!grouped[r.teamId]) grouped[r.teamId] = [];
        grouped[r.teamId].push({ level: r.level });
      }
      const teamSkillList = await Promise.all(
        Object.keys(grouped).map((t) => this.skills.listByTeam(t)),
      );
      teamSkillsMap = new Map<string, Set<string>>();
      Object.keys(grouped).forEach((t, idx) =>
        teamSkillsMap!.set(t, new Set(teamSkillList[idx].map((s) => s.skillId))),
      );

      zoneRows = zoneRows.filter((r) => {
        if (r.level === 'backup') return true; // relaxed; routing can deprioritize later
        const have = (teamSkillsMap!.get(r.teamId)) ?? new Set<string>();
        return required.every((sk) => have.has(sk));
      });
      // eslint-disable-next-line no-console
      console.log('[EligibleTeams] requiredSkills', required);
      // eslint-disable-next-line no-console
      console.log(
        '[EligibleTeams] zoneRows after skill check',
        zoneRows.map((r) => ({ teamId: r.teamId, level: r.level })),
      );
    }

    // Level preference
    const prefer: CompetencyLevel | 'any' = ctx.preferLevel ?? 'primary';
    const primary = zoneRows.filter((r) => r.level === 'primary');
    const backup = zoneRows.filter((r) => r.level === 'backup');
    const ordered =
      prefer === 'backup'
        ? [...backup, ...primary]
        : prefer === 'any'
          ? [...primary, ...backup]
          : [...primary, ...backup];
    // eslint-disable-next-line no-console
    console.log(
      '[EligibleTeams] ordered detail (pre-dedupe)',
      ordered.map((r) => ({ teamId: r.teamId, level: r.level })),
      'prefer=', prefer,
    );

    // Deterministic order: by level (already), then teamId asc
    const orderedTeamIds = Array.from(new Set(ordered.map((r) => r.teamId)));
    // eslint-disable-next-line no-console
    console.log('[EligibleTeams] ordered teamIds (pre-sort)', orderedTeamIds);
    let teamIds = orderedTeamIds.sort(
      (a, b) => a.localeCompare(b),
    );
    // eslint-disable-next-line no-console
    console.log('[EligibleTeams] final teamIds (sorted asc)', teamIds);

    // If primary is preferred, ensure teams meet required skills overall
    if (ctx.preferLevel === 'primary' && required.length > 0) {
      const hasAllSkills = (tid: string) => {
        const have = teamSkillsMap?.get(tid) ?? new Set<string>();
        return required.every((sk) => have.has(sk));
      };
      teamIds = teamIds.filter(hasAllSkills);
      // eslint-disable-next-line no-console
      console.log('[EligibleTeams] final teamIds after primary-skill filter', teamIds);
    }
    return teamIds;
  }
}
