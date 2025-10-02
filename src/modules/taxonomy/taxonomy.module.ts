import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { Category } from './models/category.model';
import { Skill } from './models/skill.model';
import { CategorySkill } from './models/category-skill.model';
import { TaxonomyController } from './infra/taxonomy.controller';
import { TaxonomySelfController } from './infra/taxonomy-self.controller';
import { CompanyScopeGuard } from '../auth/guards/company-scope.guard';
import { SequelizeCategoryRepository } from './adapters/category.repository.sequelize';
import { SequelizeSkillRepository } from './adapters/skill.repository.sequelize';
import { SequelizeCategorySkillRepository } from './adapters/category-skill.repository.sequeilze';
import { SequelizeTaxonomyQuery } from './adapters/taxonomy.query.sequelize';
import {
  CATEGORY_REPOSITORY,
  CATEGORY_SKILL_REPOSITORY,
  SKILL_REPOSITORY,
  TAXONOMY_QUERY,
} from './domain/ports';
import { CreateCategory } from './domain/use-cases/CreateCategory';
import { UpdateCategory } from './domain/use-cases/UpdateCategory';
import { DeleteCategory } from './domain/use-cases/DeleteCategory';
import { CreateSkill } from './domain/use-cases/CreateSkill';
import { UpdateSkill } from './domain/use-cases/UpdateSkill';
import { DeleteSkill } from './domain/use-cases/DeleteSkill';
import { MapCategorySkill } from './domain/use-cases/MapCategorySkill';
import { UnmapCategorySkill } from './domain/use-cases/UnmapCategorySkill';
import { ListCategories } from './domain/use-cases/ListCategories';
import { ListSkills } from './domain/use-cases/ListSkills';
import { ResolveSkillsForCategory } from './domain/use-cases/ResolveSkillsForCategory';
import { ExportTaxonomyDictionary } from './domain/use-cases/ExportTaxonomyDictionnary';
import { Ticket } from '../tickets/models/ticket.model';
import { ContractCategory } from '../contracts/models/contract-category.model';
import { TeamSkill } from '../competency/models/team-skills.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Category,
      Skill,
      CategorySkill,
      Ticket,
      ContractCategory,
      TeamSkill,
    ]),
    AuthModule,
  ],
  controllers: [TaxonomyController, TaxonomySelfController],
  providers: [
    { provide: CATEGORY_REPOSITORY, useClass: SequelizeCategoryRepository },
    { provide: SKILL_REPOSITORY, useClass: SequelizeSkillRepository },
    {
      provide: CATEGORY_SKILL_REPOSITORY,
      useClass: SequelizeCategorySkillRepository,
    },
    { provide: TAXONOMY_QUERY, useClass: SequelizeTaxonomyQuery },
    CreateCategory,
    UpdateCategory,
    DeleteCategory,
    CreateSkill,
    UpdateSkill,
    DeleteSkill,
    MapCategorySkill,
    UnmapCategorySkill,
    ListCategories,
    ListSkills,
    ResolveSkillsForCategory,
    ExportTaxonomyDictionary,
    CompanyScopeGuard,
  ],
  exports: [SequelizeModule],
})
export class TaxonomyModule {}
