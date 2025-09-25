import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WellBeingScore } from './models/well-being-score.model';
import { WellBeingController } from './controllers/well-being.controller';
import { WellBeingService } from './services/well-being.service';

@Module({
  imports: [SequelizeModule.forFeature([WellBeingScore])],
  controllers: [WellBeingController],
  providers: [WellBeingService],
  exports: [SequelizeModule],
})
export class WellBeingModule {}

