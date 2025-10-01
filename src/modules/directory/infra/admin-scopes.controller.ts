import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { GrantAdminScope } from '../domain/use-cases/GrantAdminScope';
import { RevokeAdminScope } from '../domain/use-cases/RevokeAdminScope';
import { ListAdminScopes } from '../domain/use-cases/ListAdminScopes';
import { GrantAdminScopeDto } from './dto';

@Controller('directory/admin-scopes')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, CompanyScopeGuard)
export class AdminScopesControllerV2 {
  constructor(
    private readonly grant: GrantAdminScope,
    private readonly revoke: RevokeAdminScope,
    private readonly list: ListAdminScopes,
  ) {}

  @Post()
  grantScope(@Body() dto: GrantAdminScopeDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.grant.execute(actor, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeScope(@Body() dto: GrantAdminScopeDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    await this.revoke.execute(actor, dto);
  }

  @Get('users/:id')
  listForUser(@Param('id') id: string) {
    return this.list.execute(id);
  }
}

