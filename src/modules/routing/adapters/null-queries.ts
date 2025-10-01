import type {
  CompetencyEligibilityInput,
  CompetencyQuery,
  ContractCategoryQuery,
  ContractQuery,
  ContractVersionInfo,
  GeoQuery,
  LoadQuery,
} from '../domain/ports';

export class NullContractQuery implements ContractQuery {
  async getContractVersion(_id: string): Promise<ContractVersionInfo | null> {
    // By default, unknown — force explicit override in tests or wiring
    return null;
  }
}

export class PermissiveContractCategoryQuery implements ContractCategoryQuery {
  async isCategoryIncluded(
    _contractVersionId: string,
    _categoryId: string,
  ): Promise<boolean> {
    return true;
  }
}

export class EmptyCompetencyQuery implements CompetencyQuery {
  async eligibleTeams(_input: CompetencyEligibilityInput): Promise<string[]> {
    return [];
  }
}

export class ZeroLoadQuery implements LoadQuery {
  async currentOpenLoad(_teamId: string): Promise<number> {
    return 0;
  }
}

export class InfiniteGeoQuery implements GeoQuery {
  async distance(
    _teamId: string,
    _target: {
      locationId?: string | undefined;
      lat?: number | undefined;
      lng?: number | undefined;
    },
  ): Promise<number> {
    return Number.MAX_SAFE_INTEGER / 2;
  }
}
