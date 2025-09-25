import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompetencyMatrix } from './models/competency-matrix.model';
import { ContractVersion } from '../contracts/models/contract-version.model';
import { CompetencyController } from './controllers/competency.controller';
import { CompetencyService } from './services/competency.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([CompetencyMatrix, ContractVersion]),
    AuthModule,
  ],
  controllers: [CompetencyController],
  providers: [CompetencyService],
  exports: [SequelizeModule, CompetencyService],
})
export class CompetencyModule {}
