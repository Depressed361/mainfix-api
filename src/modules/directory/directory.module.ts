import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Team } from './models/team.model';
import { TeamMember } from './models/team-member.model';
import { AdminScope } from './models/admin-scope.model';
import { User } from './models/user.model';
import { TeamsController } from './controllers/teams.controller';
import { AdminScopesController } from './controllers/admin-scopes.controller';
import { UsersController } from './users/users.controller';
import { TeamsService } from './services/teams.service';
import { AdminScopesService } from './services/admin-scopes.service';
import { UsersService } from './users/users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Team, TeamMember, AdminScope, User]),
    AuthModule,
  ],
  controllers: [TeamsController, AdminScopesController, UsersController],
  providers: [TeamsService, AdminScopesService, UsersService],
  exports: [SequelizeModule, TeamsService, AdminScopesService, UsersService],
})
export class DirectoryModule {}
