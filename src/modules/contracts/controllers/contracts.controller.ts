import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CreateContractDto } from '../dto/create-contract.dto';
import { ListContractsQueryDto } from '../dto/list-contracts.query.dto';
import { ContractsService } from '../services/contracts.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard, CompanyScopeGuard)
export class ContractsController {
  constructor(private readonly contracts: ContractsService) {}

  @Post()
  create(@Body() dto: CreateContractDto) {
    return this.contracts.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.contracts.findOne(id);
  }

  @Get()
  list(@Query() query: ListContractsQueryDto) {
    return this.contracts.findAll(query.siteId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contracts.remove(id);
  }
}
