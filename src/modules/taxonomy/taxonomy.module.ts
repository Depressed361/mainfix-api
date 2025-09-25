import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { Category } from './models/category.model';
import { Skill } from './models/skill.model';
import { CategorySkill } from './models/category-skill.model';
import { TaxonomyController } from './controllers/taxonomy.controller';
import { TaxonomyService } from './services/taxonomy.service';

@Module({
  imports: [SequelizeModule.forFeature([Category, Skill, CategorySkill]), AuthModule],
  controllers: [TaxonomyController],
  providers: [TaxonomyService],
  exports: [SequelizeModule, TaxonomyService],
})
export class TaxonomyModule {}
