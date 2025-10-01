import type { CompanyEntity } from '../domain/ports';
import { Company } from '../company.model';

export const toDomainCompany = (row: Company): CompanyEntity => ({
  id: row.id,
  name: row.name,
  createdAt: row.createdAt,
  active: true,
});

