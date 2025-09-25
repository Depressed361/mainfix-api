import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from '../directory/users/users.module';
import { AdminScope } from '../directory/models/admin-scope.model';
import { Site } from '../catalog/models/site.model';
import { Building } from '../catalog/models/buildings.model';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt.guard';
import { AuthActorService } from './auth-actor.service';
import { AdminScopeEvaluatorService } from './admin-scope-evaluator.service';
import { RequireAdminRoleGuard } from './guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from './guards/require-admin-scope.guard';
import { ScopesGuard } from './guards/scopes.guard';

@Module({
  imports: [
    UsersModule,
    SequelizeModule.forFeature([AdminScope, Site, Building]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'test',
      signOptions: { expiresIn: process.env.JWT_EXPIRES ?? '7d' },
    }),
  ],
  providers: [
    AuthService,
    AuthActorService,
    AdminScopeEvaluatorService,
    JwtAuthGuard,
    RequireAdminRoleGuard,
    RequireAdminScopeGuard,
    ScopesGuard,
  ],
  controllers: [AuthController],
  exports: [
    JwtAuthGuard,
    AuthActorService,
    RequireAdminRoleGuard,
    RequireAdminScopeGuard,
    ScopesGuard,
  ],
})
export class AuthModule {}
