import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TicketCost } from './models/ticket-cost.model';
import { TicketPart } from './models/ticket-part.model';
import {
  TicketCostsController,
  TicketCostsAdminController,
} from './controllers/ticket-costs.controller';
import { TicketCostsService } from './services/ticket-costs.service';

@Module({
  imports: [SequelizeModule.forFeature([TicketCost, TicketPart])],
  controllers: [TicketCostsController, TicketCostsAdminController],
  providers: [TicketCostsService],
  exports: [SequelizeModule],
})
export class CostModule {}
