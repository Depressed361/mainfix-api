import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateContractVersionDto } from '../dto/create-contract-version.dto';
import { ContractVersionsService } from '../services/contract-versions.service';

@Controller('contracts/:id/versions')
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
export class ContractVersionsAdminController {
  constructor(private readonly versions: ContractVersionsService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versions.remove(id);
  }
}
