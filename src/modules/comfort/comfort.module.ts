import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ComfortIndicator } from './services/controllers/models/comfort-indicator.model';
import { ComfortIndicatorsController } from './controllers/comfort-indicators.controller';
import { ComfortIndicatorsService } from './services/comfort-indicators.service';

@Module({
  imports: [SequelizeModule.forFeature([ComfortIndicator])],
  controllers: [ComfortIndicatorsController],
  providers: [ComfortIndicatorsService],
  exports: [SequelizeModule],
})
export class ComfortModule {}

