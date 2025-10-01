import type { CompetencyMatrixRepository, UUID, Pagination } from '../ports';

export class ListCompetencies {
  constructor(private readonly matrix: CompetencyMatrixRepository) {}
  execute(contractVersionId: UUID, p?: Pagination) {
    return this.matrix.listByContractVersion(contractVersionId, p);
  }
}

