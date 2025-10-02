import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateContractVersionDto } from '../dto/create-contract-version.dto';
import { ContractVersionsService } from '../services/contract-versions.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';

@Controller('contracts/:id/versions')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard, CompanyScopeGuard)
export class ContractVersionsController {
  constructor(private readonly versions: ContractVersionsService) {}

  @Post()
  create(@Param('id') contractId: string, @Body() dto: CreateContractVersionDto) {
    return this.versions.create(contractId, dto);
  }

  @Get()
  list(@Param('id') contractId: string) {
    return this.versions.findAll(contractId);
  }
}

@Controller('contract_versions')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard, CompanyScopeGuard)
export class ContractVersionsAdminController {
  constructor(private readonly versions: ContractVersionsService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versions.remove(id);
  }
}
