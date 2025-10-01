import type { UUID, CoverageJson, EscalationJson, ApprovalsJson } from '../types';

export interface ContractVersionEntity {
  id: UUID;
  contractId: UUID;
  version: number;
  createdAt: Date;
  coverage: CoverageJson;
  escalation?: EscalationJson;
  approvals?: ApprovalsJson;
}

