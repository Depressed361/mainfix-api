import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { CreateCompany } from '../domain/use-cases/CreateCompany';
import { UpdateCompany } from '../domain/use-cases/UpdateCompany';
import { DeleteCompany } from '../domain/use-cases/DeleteCompany';
import { GetCompanyBoundary } from '../domain/use-cases/GetCompanyBoundary';
import { OnboardVendorForSite } from '../domain/use-cases/OnboardVendorForSite';
import { CreateCompanyDto, OnboardVendorForSiteDto, UpdateCompanyDto } from './dto';

@Controller('companies')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard, CompanyScopeGuard)
export class CompaniesControllerV2 {
  constructor(
    private readonly createCompany: CreateCompany,
    private readonly updateCompany: UpdateCompany,
    private readonly deleteCompany: DeleteCompany,
    private readonly getBoundary: GetCompanyBoundary,
    private readonly onboarding: OnboardVendorForSite,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCompanyDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.createCompany.execute(actor, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.updateCompany.execute(actor, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    await this.deleteCompany.execute(actor, id);
  }

  @Get(':id/boundary')
  boundary(@Param('id') id: string) {
    return this.getBoundary.execute(id);
  }

  @Post(':companyId/vendor-onboarding')
  vendorOnboarding(@Param('companyId') companyId: string, @Body() dto: OnboardVendorForSiteDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.onboarding.execute(actor, companyId, dto);
  }
}

