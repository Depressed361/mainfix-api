export interface LocationDTO {
  id: string;
  name: string;
  buildingId: string;
  description?: string | null;
}

export type LocationId = string;

export interface ListLocationsQuery {
  buildingId?: string;
  siteId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LocationRepository {
  create(input: Omit<LocationDTO, 'id'>): Promise<LocationDTO>;
  findById(id: LocationId): Promise<LocationDTO | null>;
  list(
    query: ListLocationsQuery,
  ): Promise<{ rows: LocationDTO[]; count: number }>;
  update(
    id: LocationId,
    patch: Partial<Omit<LocationDTO, 'id'>>,
  ): Promise<LocationDTO>;
  delete(id: LocationId): Promise<void>;
}

export interface BuildingGuard {
  ensureBuildingExists(buildingId: string): Promise<void>;
  ensureLocationBelongsToBuilding(loc: LocationDTO, buildingId?: string): void;
  ensureBuildingBelongsToSite?(
    buildingId: string,
    siteId: string,
  ): Promise<void>;
}
