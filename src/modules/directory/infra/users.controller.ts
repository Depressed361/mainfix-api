import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { CreateUser } from '../domain/use-cases/CreateUser';
import { UpdateUser } from '../domain/use-cases/UpdateUser';
import { ArchiveUser } from '../domain/use-cases/ArchiveUser';
import { ListUsers } from '../domain/use-cases/ListUsers';
import { CreateUserDto, UpdateUserDto } from './dto';

@Controller('directory/users')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, CompanyScopeGuard)
export class UsersControllerV2 {
  constructor(
    private readonly createUser: CreateUser,
    private readonly updateUser: UpdateUser,
    private readonly archiveUser: ArchiveUser,
    private readonly listUsers: ListUsers,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.createUser.execute(actor, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.updateUser.execute(actor, id, dto);
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    await this.archiveUser.execute(actor, id);
    return { archived: true };
  }

  @Get()
  list(@Query('companyId') companyId: string, @Query() q: any) {
    return this.listUsers.execute(companyId, q);
  }
}

