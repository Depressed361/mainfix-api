export interface SiteDTO {
  id: string;
  companyId: string;
  code: string;
  name: string;
  timezone: string;
}

export type SiteId = string;

export interface BuildingDTO {
  id: string;
  siteId: string;
  code: string;
  name: string;
}

export interface SiteWithBuildings {
  site: SiteDTO;
  buildings: BuildingDTO[];
}

export interface ListSitesQuery {
  companyId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListSitesContext {
  actorCompanyId?: string;
  isPlatformAdmin?: boolean;
}

export interface ListSitesResult {
  rows: SiteDTO[];
  count: number;
}
