import { Inject, Injectable } from '@nestjs/common';
import type { TaxonomyQuery } from '../ports';
import { TAXONOMY_QUERY } from '../ports';

@Injectable()
export class ResolveSkillsForCategory {
  constructor(@Inject(TAXONOMY_QUERY) private readonly query: TaxonomyQuery) {}

  execute(categoryId: string): Promise<string[]> {
    return this.query.resolveSkillsForCategory(categoryId);
  }
}
