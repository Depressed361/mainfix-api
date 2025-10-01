import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoutingRule } from './models/routing-rule.model';
import { RoutingController } from './infra/routing.controller';
import { SequelizeRoutingRuleRepository } from './adapters/routing-rule.repository.sequelize';
import { TOKENS } from './domain/ports';
import { CreateRoutingRule } from './domain/use-cases/CreateRoutingRule';
import { UpdateRoutingRule } from './domain/use-cases/UpdateRoutingRule';
import { DeleteRoutingRule } from './domain/use-cases/DeleteRoutingRule';
import { ListRoutingRules } from './domain/use-cases/ListRoutingRules';
import { EvaluateRouting } from './domain/use-cases/EvaluateRouting';
import { SimulateRouting } from './domain/use-cases/SimulateRouting';
import { ConditionMatcher } from './domain/services/ConditionMatcher';
import { ActionResolver } from './domain/services/ActionResolver';
import { TiebreakerEngine } from './domain/services/TiebreakerEngine';
import { InfiniteGeoQuery, NullContractQuery, EmptyCompetencyQuery, PermissiveContractCategoryQuery, ZeroLoadQuery } from './adapters/null-queries';

@Module({
  imports: [SequelizeModule.forFeature([RoutingRule])],
  controllers: [RoutingController],
  providers: [
    // Repository adapter
    { provide: TOKENS.RoutingRuleRepository, useClass: SequelizeRoutingRuleRepository },
    // Default queries (should be overridden in app composition/tests)
    { provide: TOKENS.ContractQuery, useClass: NullContractQuery },
    { provide: TOKENS.ContractCategoryQuery, useClass: PermissiveContractCategoryQuery },
    { provide: TOKENS.CompetencyQuery, useClass: EmptyCompetencyQuery },
    { provide: TOKENS.LoadQuery, useClass: ZeroLoadQuery },
    { provide: TOKENS.GeoQuery, useClass: InfiniteGeoQuery },

    // Domain services
    ConditionMatcher,
    ActionResolver,
    {
      provide: TiebreakerEngine,
      useFactory: (load: ZeroLoadQuery, geo: InfiniteGeoQuery) => new TiebreakerEngine(load, geo),
      inject: [TOKENS.LoadQuery, TOKENS.GeoQuery],
    },

    // Use-cases
    {
      provide: CreateRoutingRule,
      useFactory: (repo, contracts) => new CreateRoutingRule(repo, contracts),
      inject: [TOKENS.RoutingRuleRepository, TOKENS.ContractQuery],
    },
    {
      provide: UpdateRoutingRule,
      useFactory: (repo, contracts) => new UpdateRoutingRule(repo, contracts),
      inject: [TOKENS.RoutingRuleRepository, TOKENS.ContractQuery],
    },
    {
      provide: DeleteRoutingRule,
      useFactory: (repo, contracts) => new DeleteRoutingRule(repo, contracts),
      inject: [TOKENS.RoutingRuleRepository, TOKENS.ContractQuery],
    },
    {
      provide: ListRoutingRules,
      useFactory: (repo, contracts) => new ListRoutingRules(repo, contracts),
      inject: [TOKENS.RoutingRuleRepository, TOKENS.ContractQuery],
    },
    {
      provide: EvaluateRouting,
      useFactory: (repo, contracts, categories, competency, matcher, actions, tiebreakers) =>
        new EvaluateRouting(repo, contracts, categories, competency, matcher, actions, tiebreakers),
      inject: [
        TOKENS.RoutingRuleRepository,
        TOKENS.ContractQuery,
        TOKENS.ContractCategoryQuery,
        TOKENS.CompetencyQuery,
        ConditionMatcher,
        ActionResolver,
        TiebreakerEngine,
      ],
    },
    {
      provide: SimulateRouting,
      useFactory: (evaluator: EvaluateRouting) => new SimulateRouting(evaluator),
      inject: [EvaluateRouting],
    },
  ],
  exports: [SequelizeModule, EvaluateRouting],
})
export class RoutingModule {}
