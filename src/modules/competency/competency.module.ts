import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompetencyMatrix } from './models/competency-matrix.model';
import { ContractVersion } from '../contracts/models/contract-version.model';
import { CompetencyController } from './controllers/competency.controller';
import { CompetencyService } from './services/competency.service';
import { AuthModule } from '../auth/auth.module';
import { TeamZone } from './models/team-zone.model';
import { TeamSkill } from './models/team-skills.model';
import { CompetencyAdminController } from './infra/competency.controller';
import { SequelizeTeamZoneRepository } from './adapters/team-zone.repository.sequelize';
import { SequelizeTeamSkillRepository } from './adapters/team-skill.repository.sequelize';
import { SequelizeCompetencyMatrixRepository } from './adapters/competency-matrix.repository.sequelize';
import { TOKENS } from './domain/ports';
import { GrantTeamZone } from './domain/use-cases/GrantTeamZone';
import { RevokeTeamZone } from './domain/use-cases/RevokeTeamZone';
import { GrantTeamSkill } from './domain/use-cases/GrantTeamSkill';
import { RevokeTeamSkill } from './domain/use-cases/RevokeTeamSkill';
import { UpsertCompetency } from './domain/use-cases/UpsertCompetency';
import { RemoveCompetency } from './domain/use-cases/RemoveCompetency';
import { ListCompetencies } from './domain/use-cases/ListCompetencies';
import { ListTeamSkills } from './domain/use-cases/ListTeamSkills';
import { ListTeamZones } from './domain/use-cases/ListTeamZones';
import { ResolveEligibleTeams } from './domain/use-cases/ResolveEligibleTeams';
import { ExportCompetencyDictionary } from './domain/use-cases/ExportCompetencyDictionary';

@Module({
  imports: [
    SequelizeModule.forFeature([CompetencyMatrix, ContractVersion, TeamZone, TeamSkill]),
    AuthModule,
  ],
  controllers: [CompetencyController, CompetencyAdminController],
  providers: [
    CompetencyService,
    { provide: TOKENS.TeamZoneRepository, useClass: SequelizeTeamZoneRepository },
    { provide: TOKENS.TeamSkillRepository, useClass: SequelizeTeamSkillRepository },
    { provide: TOKENS.CompetencyMatrixRepository, useClass: SequelizeCompetencyMatrixRepository },
    // External queries (default stubs, should be overridden in integration)
    { provide: TOKENS.TaxonomyQuery, useValue: { requiredSkillsForCategory: async (_: string) => [] as string[] } },
    { provide: TOKENS.ContractQuery, useValue: { getContractVersionMeta: async (id: string) => ({ contractId: 'c', siteId: 's', companyId: 'company-1' }) } },
    { provide: TOKENS.CatalogQuery, useValue: { getBuildingMeta: async (id: string) => ({ siteId: 's', companyId: 'company-1' }) } },
    { provide: TOKENS.TeamQuery, useValue: { getTeamMeta: async (id: string) => ({ companyId: 'company-1', active: true }) } },
    // Use-cases wiring
    {
      provide: GrantTeamZone,
      useFactory: (zones, contracts, catalog, teams) => new GrantTeamZone(zones, contracts, catalog, teams),
      inject: [TOKENS.TeamZoneRepository, TOKENS.ContractQuery, TOKENS.CatalogQuery, TOKENS.TeamQuery],
    },
    {
      provide: RevokeTeamZone,
      useFactory: (zones, contracts, catalog, teams) => new RevokeTeamZone(zones, contracts, catalog, teams),
      inject: [TOKENS.TeamZoneRepository, TOKENS.ContractQuery, TOKENS.CatalogQuery, TOKENS.TeamQuery],
    },
    {
      provide: GrantTeamSkill,
      useFactory: (skills, contracts, teams) => new GrantTeamSkill(skills, contracts, teams),
      inject: [TOKENS.TeamSkillRepository, TOKENS.ContractQuery, TOKENS.TeamQuery],
    },
    {
      provide: RevokeTeamSkill,
      useFactory: (skills, contracts, teams) => new RevokeTeamSkill(skills, contracts, teams),
      inject: [TOKENS.TeamSkillRepository, TOKENS.ContractQuery, TOKENS.TeamQuery],
    },
    {
      provide: UpsertCompetency,
      useFactory: (matrix, taxonomy, teamSkills, contracts, catalog, teams) => new UpsertCompetency(matrix, taxonomy, teamSkills, contracts, catalog, teams),
      inject: [TOKENS.CompetencyMatrixRepository, TOKENS.TaxonomyQuery, TOKENS.TeamSkillRepository, TOKENS.ContractQuery, TOKENS.CatalogQuery, TOKENS.TeamQuery],
    },
    {
      provide: RemoveCompetency,
      useFactory: (matrix, contracts, catalog, teams) => new RemoveCompetency(matrix, contracts, catalog, teams),
      inject: [TOKENS.CompetencyMatrixRepository, TOKENS.ContractQuery, TOKENS.CatalogQuery, TOKENS.TeamQuery],
    },
    { provide: ListCompetencies, useFactory: (matrix) => new ListCompetencies(matrix), inject: [TOKENS.CompetencyMatrixRepository] },
    { provide: ListTeamSkills, useFactory: (skills) => new ListTeamSkills(skills), inject: [TOKENS.TeamSkillRepository] },
    { provide: ListTeamZones, useFactory: (zones) => new ListTeamZones(zones), inject: [TOKENS.TeamZoneRepository] },
    {
      provide: ResolveEligibleTeams,
      useFactory: (matrix, zones, skills, teams, taxonomy) => new ResolveEligibleTeams(matrix, zones, skills, teams, taxonomy),
      inject: [TOKENS.CompetencyMatrixRepository, TOKENS.TeamZoneRepository, TOKENS.TeamSkillRepository, TOKENS.TeamQuery, TOKENS.TaxonomyQuery],
    },
    { provide: ExportCompetencyDictionary, useFactory: (matrix) => new ExportCompetencyDictionary(matrix), inject: [TOKENS.CompetencyMatrixRepository] },
  ],
  exports: [SequelizeModule, CompetencyService, ResolveEligibleTeams],
})
export class CompetencyModule {}
