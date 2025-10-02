import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Company } from './company.model';
import { AuthModule } from '../auth/auth.module';
import { Site } from '../catalog/models/site.model';
import { Team } from '../directory/models/team.model';
import { User } from '../directory/models/user.model';
import { Contract } from '../contracts/models/contract.model';
import { Ticket } from '../tickets/models/ticket.model';
import { CompaniesControllerV2 } from './infra/companies.controller';
import { TOKENS } from './domain/ports';
import { SequelizeCompanyRepository } from './adapters/company.repository.sequelize';
import { SequelizeCompanyQuery } from './adapters/company.query.sequelize';
import { DirectoryCommandStub } from './adapters/directory.command.stub';
import { SequelizeCatalogQuery } from './adapters/catalog.query.sequelize';
import { CreateCompany } from './domain/use-cases/CreateCompany';
import { UpdateCompany } from './domain/use-cases/UpdateCompany';
import { DeleteCompany } from './domain/use-cases/DeleteCompany';
import { ArchiveCompany } from './domain/use-cases/ArchiveCompany';
import { GetCompanyBoundary } from './domain/use-cases/GetCompanyBoundary';
import { OnboardVendorForSite } from './domain/use-cases/OnboardVendorForSite';

@Module({
  imports: [SequelizeModule.forFeature([Company, Site, Team, User, Contract, Ticket]), AuthModule],
  controllers: [CompaniesControllerV2],
  providers: [
    { provide: TOKENS.CompanyRepository, useClass: SequelizeCompanyRepository },
    { provide: TOKENS.CompanyQuery, useClass: SequelizeCompanyQuery },
    { provide: TOKENS.DirectoryCommand, useClass: DirectoryCommandStub },
    { provide: TOKENS.CatalogQuery, useClass: SequelizeCatalogQuery },
    // Use-cases
    CreateCompany,
    UpdateCompany,
    DeleteCompany,
    ArchiveCompany,
    { provide: GetCompanyBoundary, useFactory: (cq) => new GetCompanyBoundary(cq), inject: [TOKENS.CompanyQuery] },
    {
      provide: OnboardVendorForSite,
      useFactory: (catalog, cquery, directory) => new OnboardVendorForSite(catalog, cquery, directory),
      inject: [TOKENS.CatalogQuery, TOKENS.CompanyQuery, TOKENS.DirectoryCommand],
    },
  ],
  exports: [SequelizeModule, TOKENS.CompanyQuery, TOKENS.CatalogQuery],
})
export class CompaniesModule {}
