export interface AssetDTO {
  id: string;
  companyId: string;
  code: string;
  locationId?: string | null;
  kind?: string | null;
  metadata?: Record<string, unknown> | null;
}

export type AssetId = string;

export interface ListAssetsQuery {
  companyId?: string;
  locationId?: string;
  buildingId?: string;
  siteId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AssetRepository {
  create(input: Omit<AssetDTO, 'id'>): Promise<AssetDTO>;
  findById(id: AssetId): Promise<AssetDTO | null>;
  list(query: ListAssetsQuery): Promise<{ rows: AssetDTO[]; count: number }>;
  update(id: AssetId, patch: Partial<Omit<AssetDTO, 'id'>>): Promise<AssetDTO>;
  delete(id: AssetId): Promise<void>;
}

export interface LocationGuard {
  ensureLocationExists(locationId: string): Promise<void>;
}

export interface UniqueCodeGuard {
  ensureCompanyCodeIsUnique(
    companyId: string,
    code: string,
    excludeId?: string,
  ): Promise<void>;
}
