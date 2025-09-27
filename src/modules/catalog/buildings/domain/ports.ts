export interface BuildingDTO {
  id: string;
  name: string;
  siteId: string;
  code: string;
}

export type BuildingId = string;

export interface ListBuildingsQuery {
  siteId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListBuildingsResult {
  rows: BuildingDTO[];
  count: number;
}

/** Repository de persistance des bâtiments */
export interface BuildingRepository {
  create(input: Omit<BuildingDTO, 'id'>): Promise<BuildingDTO>;
  findById(id: BuildingId): Promise<BuildingDTO | null>;
  list(query: ListBuildingsQuery): Promise<ListBuildingsResult>;
  update(
    id: BuildingId,
    patch: Partial<Omit<BuildingDTO, 'id'>>,
  ): Promise<BuildingDTO>;
  delete(id: BuildingId): Promise<void>;
}

/** Port de garde pour vérifier l’appartenance au site / existence du site */
export interface SiteGuard {
  ensureSiteExists(siteId: string): Promise<void>;
  /** Optionnel: vérifier qu’un building appartient déjà au site attendu */
  ensureBuildingBelongsToSite(building: BuildingDTO, siteId?: string): void;
}
