import { ListLocationsQuery, LocationRepository } from '../ports';

export class ListLocations {
  constructor(private readonly repo: LocationRepository) {}

  async exec(q: ListLocationsQuery) {
    return this.repo.list(q);
  }
}
