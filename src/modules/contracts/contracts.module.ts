import { Module } from '@nestjs/common';
import { SequelizeModule, getModelToken } from '@nestjs/sequelize';
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
    // New domain-driven controllers first (to avoid path collisions)
    ContractsControllerV2,
    ContractVersionsControllerV2,
    ContractCategoriesControllerV2,
    // Legacy controllers (kept for backward compatibility)
    ContractsController,
    ContractVersionsController,
    ContractVersionsAdminController,
  ],
  providers: [
    ContractsService,
    ContractVersionsService,
    { provide: TOKENS.ContractRepository, useClass: SequelizeContractRepository },
    { provide: TOKENS.ContractVersionRepository, useClass: SequelizeContractVersionRepository },
    { provide: TOKENS.ContractCategoryRepository, useClass: SequelizeContractCategoryRepository },
    { provide: TOKENS.ContractQuery, useClass: SequelizeContractQuery },

    { provide: CreateContract, useFactory: (repo) => new CreateContract(repo), inject: [TOKENS.ContractRepository] },
    { provide: UpdateContract, useFactory: (repo) => new UpdateContract(repo), inject: [TOKENS.ContractRepository] },
    { provide: ArchiveContract, useFactory: (repo) => new ArchiveContract(repo), inject: [TOKENS.ContractRepository] },
    { provide: ListContracts, useFactory: (repo, siteModel) => new ListContracts(repo, siteModel), inject: [TOKENS.ContractRepository, getModelToken(Site)] },
    { provide: CreateContractVersion, useFactory: (repo) => new CreateContractVersion(repo), inject: [TOKENS.ContractVersionRepository] },
    { provide: UpdateContractVersion, useFactory: (repo) => new UpdateContractVersion(repo), inject: [TOKENS.ContractVersionRepository] },
    { provide: DeleteContractVersion, useFactory: (repo) => new DeleteContractVersion(repo), inject: [TOKENS.ContractVersionRepository] },
    { provide: ListContractVersions, useFactory: (repo, contractModel, siteModel) => new ListContractVersions(repo, contractModel, siteModel), inject: [TOKENS.ContractVersionRepository, getModelToken(Contract), getModelToken(Site)] },
    UpsertContractCategory,
    RemoveContractCategory,
    ListContractCategories,
  ],
  exports: [SequelizeModule, TOKENS.ContractQuery],
})
export class ContractsModule {}
