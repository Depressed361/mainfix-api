import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SlaTarget } from './sla-target.model';
import { SlaBreach } from './sla-breach.model';
@Module({
  imports: [SequelizeModule.forFeature([SlaTarget, SlaBreach])],
  exports: [SequelizeModule],
})
export class SlaModule {}
