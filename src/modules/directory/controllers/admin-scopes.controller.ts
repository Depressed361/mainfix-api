import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { AdminScope as AdminScopeDecorator } from '../../auth/decorators/admin-scope.decorator';
import { CreateAdminScopeDto } from '../dto/create-admin-scope.dto';
import { RemoveAdminScopeDto } from '../dto/remove-admin-scope.dto';
import { AdminScopesService } from '../services/admin-scopes.service';

@Controller('admin-scopes')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
@AdminScopeDecorator({ type: 'platform' })
export class AdminScopesController {
  constructor(private readonly scopes: AdminScopesService) {}

  @Post()
  create(@Body() dto: CreateAdminScopeDto) {
    return this.scopes.create(dto);
  }

  @Get()
  list(@Query('userId') userId: string) {
    if (!userId) return [];
    return this.scopes.listForUser(userId);
  }

  @Delete()
  remove(@Body() dto: RemoveAdminScopeDto) {
    return this.scopes.remove(dto);
  }
}
