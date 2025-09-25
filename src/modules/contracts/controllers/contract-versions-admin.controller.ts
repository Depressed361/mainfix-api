import { Controller, Delete, Param } from '@nestjs/common';
import { ContractVersionsService } from '../services/contract-versions.service';

@Controller('contract_versions')
export class ContractVersionsAdminController {
  constructor(private readonly versions: ContractVersionsService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versions.remove(id);
  }
}

