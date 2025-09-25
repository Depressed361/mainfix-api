import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Site } from '../catalog/models/site.model';
import { Building } from '../catalog/models/buildings.model';
import type { AuthenticatedActor } from './auth-actor.types';

interface SiteSnapshot {
  id: string;
  companyId: string | null;
}

interface BuildingSnapshot {
  id: string;
  siteId: string | null;
  companyId: string | null;
}

@Injectable()
export class AdminScopeEvaluatorService {
  constructor(
    @InjectModel(Site)
    private readonly siteModel: typeof Site,
    @InjectModel(Building)
    private readonly buildingModel: typeof Building,
  ) {}

  private siteCache = new Map<string, SiteSnapshot | null>();
  private buildingCache = new Map<string, BuildingSnapshot | null>();

  private isSuperAdmin(actor: AuthenticatedActor) {
    return (
      actor.role === 'admin' && actor.scopes.some((s) => s.scope === 'platform')
    );
  }

  hasPlatformScope(actor: AuthenticatedActor) {
    return this.isSuperAdmin(actor);
  }

  private isAdmin(actor: AuthenticatedActor) {
    return actor.role === 'admin';
  }

  async canAccessCompany(actor: AuthenticatedActor, companyId: string) {
    if (!this.isAdmin(actor)) return false;
    if (this.isSuperAdmin(actor)) return true;

    if (
      actor.scopes.some(
        (s) => s.scope === 'company' && s.companyId === companyId,
      )
    ) {
      return true;
    }

    const siteScopeIds = actor.scopes
      .filter((s) => s.scope === 'site' && s.siteId)
      .map((s) => s.siteId!)
      .filter(Boolean);

    if (siteScopeIds.length) {
      const belongs = await this.sitesBelongingToCompany(
        siteScopeIds,
        companyId,
      );
      if (belongs) return true;
    }

    const buildingScopeIds = actor.scopes
      .filter((s) => s.scope === 'building' && s.buildingId)
      .map((s) => s.buildingId!)
      .filter(Boolean);

    if (buildingScopeIds.length) {
      const belongs = await this.buildingsBelongingToCompany(
        buildingScopeIds,
        companyId,
      );
      if (belongs) return true;
    }

    return false;
  }

  async canAccessSite(actor: AuthenticatedActor, siteId: string) {
    if (!this.isAdmin(actor)) return false;
    if (this.isSuperAdmin(actor)) return true;

    if (actor.scopes.some((s) => s.scope === 'site' && s.siteId === siteId)) {
      return true;
    }

    const site = await this.getSite(siteId);
    if (!site) return false;

    if (
      actor.scopes.some(
        (s) => s.scope === 'company' && s.companyId === site.companyId,
      )
    ) {
      return true;
    }

    const buildingScopeIds = actor.scopes
      .filter((s) => s.scope === 'building' && s.buildingId)
      .map((s) => s.buildingId!)
      .filter(Boolean);

    if (buildingScopeIds.length) {
      const belongs = await this.buildingsBelongingToSite(
        buildingScopeIds,
        siteId,
      );
      if (belongs) return true;
    }

    return false;
  }

  async canAccessBuilding(actor: AuthenticatedActor, buildingId: string) {
    if (!this.isAdmin(actor)) return false;
    if (this.isSuperAdmin(actor)) return true;

    if (
      actor.scopes.some(
        (s) => s.scope === 'building' && s.buildingId === buildingId,
      )
    ) {
      return true;
    }

    const building = await this.getBuilding(buildingId);
    if (!building) return false;

    if (
      actor.scopes.some(
        (s) => s.scope === 'site' && s.siteId === building.siteId,
      )
    ) {
      return true;
    }

    if (
      actor.scopes.some(
        (s) => s.scope === 'company' && s.companyId === building.companyId,
      )
    ) {
      return true;
    }

    return false;
  }

  private async getSite(id: string): Promise<SiteSnapshot | null> {
    if (this.siteCache.has(id)) return this.siteCache.get(id) ?? null;
    const site = (await this.siteModel.findByPk(id, {
      attributes: ['id', ['company_id', 'companyId']],
      raw: true,
    })) as { id: string; companyId: string | null } | null;
    const snapshot = site
      ? {
          id: site.id,
          companyId: site.companyId ?? null,
        }
      : null;
    this.siteCache.set(id, snapshot);
    return snapshot;
  }

  private async getBuilding(id: string): Promise<BuildingSnapshot | null> {
    if (this.buildingCache.has(id)) return this.buildingCache.get(id) ?? null;
    const building = await this.buildingModel.findByPk(id, {
      attributes: ['id', ['site_id', 'siteId']],
      raw: true,
    });
    let snapshot: BuildingSnapshot | null = null;
    if (building) {
      const { siteId } = building as { id: string; siteId: string | null };
      const site = siteId ? await this.getSite(siteId) : null;
      snapshot = {
        id: building.id,
        siteId,
        companyId: site?.companyId ?? null,
      };
    }
    this.buildingCache.set(id, snapshot);
    return snapshot;
  }

  private async sitesBelongingToCompany(siteIds: string[], companyId: string) {
    const missing = siteIds.filter((id) => !this.siteCache.has(id));
    if (missing.length) await this.preloadSites(missing);
    return siteIds.some(
      (id) => this.siteCache.get(id)?.companyId === companyId,
    );
  }

  private async buildingsBelongingToCompany(
    buildingIds: string[],
    companyId: string,
  ) {
    const missing = buildingIds.filter((id) => !this.buildingCache.has(id));
    if (missing.length) await this.preloadBuildings(missing);
    return buildingIds.some(
      (id) => this.buildingCache.get(id)?.companyId === companyId,
    );
  }

  private async buildingsBelongingToSite(
    buildingIds: string[],
    siteId: string,
  ) {
    const missing = buildingIds.filter((id) => !this.buildingCache.has(id));
    if (missing.length) await this.preloadBuildings(missing);
    return buildingIds.some(
      (id) => this.buildingCache.get(id)?.siteId === siteId,
    );
  }

  private async preloadSites(siteIds: string[]) {
    if (!siteIds.length) return;
    const records = await this.siteModel.findAll({
      where: { id: { [Op.in]: siteIds } },
      attributes: ['id', ['company_id', 'companyId']],
      raw: true,
    });
    type SiteRecord = { id: string; companyId: string | null };
    for (const rec of records as SiteRecord[]) {
      this.siteCache.set(rec.id, {
        id: rec.id,
        companyId: rec.companyId ?? null,
      });
    }
    for (const id of siteIds) {
      if (!this.siteCache.has(id)) this.siteCache.set(id, null);
    }
  }

  private async preloadBuildings(buildingIds: string[]) {
    if (!buildingIds.length) return;
    const records = await this.buildingModel.findAll({
      where: { id: { [Op.in]: buildingIds } },
      attributes: ['id', ['site_id', 'siteId']],
      raw: true,
    });
    type BuildingRecord = { id: string; siteId: string | null };
    for (const rec of records as BuildingRecord[]) {
      const siteId = rec.siteId;
      const site = siteId ? await this.getSite(siteId) : null;
      this.buildingCache.set(rec.id, {
        id: rec.id,
        siteId,
        companyId: site?.companyId ?? null,
      });
    }
    for (const id of buildingIds) {
      if (!this.buildingCache.has(id)) this.buildingCache.set(id, null);
    }
  }
}


