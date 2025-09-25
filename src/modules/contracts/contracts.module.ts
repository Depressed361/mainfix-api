import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contract } from './models/contract.model';
import { ContractVersion } from './models/contract-version.model';
import { ContractsController } from './controllers/contracts.controller';
import { ContractVersionsController } from './controllers/contract-versions.controller';
import { ContractVersionsAdminController } from './controllers/contract-versions-admin.controller';
import { ContractsService } from './services/contracts.service';
import { ContractVersionsService } from './services/contract-versions.service';

@Module({
  imports: [SequelizeModule.forFeature([Contract, ContractVersion])],
  controllers: [
    ContractsController,
    ContractVersionsController,
    ContractVersionsAdminController,
  ],
  providers: [ContractsService, ContractVersionsService],
  exports: [SequelizeModule],
})
export class ContractsModule {}
