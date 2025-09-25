import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../auth/decorators/admin-scope.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @AdminScope({ type: 'platform' })
  @Get()
  list() {
    return this.companiesService.findAll();
  }

  @AdminScope({ type: 'company', param: 'id' })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @AdminScope({ type: 'platform' })
  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @AdminScope({ type: 'company', param: 'id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @AdminScope({ type: 'company', param: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
