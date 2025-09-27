import {
  ListSitesQuery,
  ListSitesResult,
  SiteDTO,
  SiteId,
  SiteWithBuildings,
} from './types';

export interface SiteRepository {
  create(input: Omit<SiteDTO, 'id'>): Promise<SiteDTO>;
  findById(id: SiteId): Promise<SiteDTO | null>;
  findWithBuildings(id: SiteId): Promise<SiteWithBuildings | null>;
  list(query: ListSitesQuery): Promise<ListSitesResult>;
  update(id: SiteId, patch: Partial<Omit<SiteDTO, 'id'>>): Promise<SiteDTO>;
  delete(id: SiteId): Promise<void>;
}
