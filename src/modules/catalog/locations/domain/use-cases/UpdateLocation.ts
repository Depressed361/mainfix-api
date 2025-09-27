import {
  BuildingGuard,
  LocationDTO,
  LocationId,
  LocationRepository,
} from '../ports';

export class UpdateLocation {
  constructor(
    private readonly repo: LocationRepository,
    private readonly guard: BuildingGuard,
  ) {}

  async exec(
    id: LocationId,
    patch: Partial<Omit<LocationDTO, 'id'>>,
  ): Promise<LocationDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error('LOCATION_NOT_FOUND');

    // validations regroupées
    const validators: Array<() => void> = [
      () => {
        if (patch.buildingId && patch.buildingId !== existing.buildingId) {
          throw new Error('BUILDING_CHANGE_FORBIDDEN');
        }
      },
      () => {
        // guard peut lancer une erreur si l'appartenance n'est pas valide
        this.guard.ensureLocationBelongsToBuilding(existing, patch.buildingId);
      },
      () => {
        if (patch.name !== undefined && !patch.name.trim()) {
          throw new Error('INVALID_NAME');
        }
      },
    ];

    for (const validate of validators) {
      validate();
    }

    return this.repo.update(id, {
      ...patch,
      name: patch.name?.trim() ?? patch.name,
      description: patch.description?.trim() ?? patch.description,
    });
  }
}
