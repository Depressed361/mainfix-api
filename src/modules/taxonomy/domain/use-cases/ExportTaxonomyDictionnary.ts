import { Inject, Injectable } from '@nestjs/common';
import type { TaxonomyQuery } from '../ports';
import { TAXONOMY_QUERY } from '../ports';

@Injectable()
export class ExportTaxonomyDictionary {
  constructor(@Inject(TAXONOMY_QUERY) private readonly query: TaxonomyQuery) {}

  execute(companyId: string): Promise<Record<string, string[]>> {
    return this.query.dictionaryByCompany(companyId);
  }
}
