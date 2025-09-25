import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoutingRule } from './models/routing-rule.model';
import { RoutingRulesController } from './controllers/routing-rules.controller';
import { RoutingRulesService } from './services/routing-rules.service';

@Module({
  imports: [SequelizeModule.forFeature([RoutingRule])],
  controllers: [RoutingRulesController],
  providers: [RoutingRulesService],
  exports: [SequelizeModule],
})
export class RoutingModule {}
