import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contract } from './models/contract.model';
import { ContractVersion } from './models/contract-version.model';
import { ContractCategory } from './models/contract-category.model';
import { ContractsController } from './controllers/contracts.controller';
import { ContractVersionsController } from './controllers/contract-versions.controller';
import { ContractVersionsAdminController } from './controllers/contract-versions-admin.controller';
import { ContractsService } from './services/contracts.service';
import { ContractVersionsService } from './services/contract-versions.service';
import { ContractsControllerV2 } from './infra/contracts.controller';
import { ContractVersionsControllerV2 } from './infra/contract-versions.controller';
import { ContractCategoriesControllerV2 } from './infra/contract-categories.controller';
import { SequelizeContractRepository } from './adapters/contract.repository.sequelize';
import { SequelizeContractVersionRepository } from './adapters/contract-version.repository.sequelize';
import { SequelizeContractCategoryRepository } from './adapters/contract-category.repository.sequelize';
import { CreateContract } from './domain/use-cases/CreateContract';
import { UpdateContract } from './domain/use-cases/UpdateContract';
import { ArchiveContract } from './domain/use-cases/ArchiveContract';
import { ListContracts } from './domain/use-cases/ListContracts';
import { CreateContractVersion } from './domain/use-cases/CreateContractVersion';
import { UpdateContractVersion } from './domain/use-cases/UpdateContractVersion';
import { DeleteContractVersion } from './domain/use-cases/DeleteContractVersion';
import { ListContractVersions } from './domain/use-cases/ListContractVersions';
import { UpsertContractCategory } from './domain/use-cases/UpsertContractCategory';
import { RemoveContractCategory } from './domain/use-cases/RemoveContractCategory';
import { ListContractCategories } from './domain/use-cases/ListContractCategories';
import { TOKENS } from './domain/ports';
import { SequelizeContractQuery } from './adapters/contract.query.sequelize';
import { Site } from '../catalog/models/site.model';

@Module({
  imports: [SequelizeModule.forFeature([Contract, ContractVersion, ContractCategory, Site])],
  controllers: [
    // Legacy controllers kept for backward compatibility
    ContractsController,
    ContractVersionsController,
    ContractVersionsAdminController,
    // New domain-driven controllers
    ContractsControllerV2,
    ContractVersionsControllerV2,
    ContractCategoriesControllerV2,
  ],
  providers: [
    ContractsService,
    ContractVersionsService,
    { provide: TOKENS.ContractRepository, useClass: SequelizeContractRepository },
    { provide: TOKENS.ContractVersionRepository, useClass: SequelizeContractVersionRepository },
    { provide: TOKENS.ContractCategoryRepository, useClass: SequelizeContractCategoryRepository },
    { provide: TOKENS.ContractQuery, useClass: SequelizeContractQuery },

    CreateContract,
    UpdateContract,
    ArchiveContract,
    ListContracts,
    CreateContractVersion,
    UpdateContractVersion,
    DeleteContractVersion,
    ListContractVersions,
    UpsertContractCategory,
    RemoveContractCategory,
    ListContractCategories,
  ],
  exports: [SequelizeModule, TOKENS.ContractQuery],
})
export class ContractsModule {}
