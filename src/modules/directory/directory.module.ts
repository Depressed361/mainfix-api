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
import { UsersControllerV2 } from './infra/users.controller';
import { TeamsControllerV2 } from './infra/teams.controller';
import { AdminScopesControllerV2 } from './infra/admin-scopes.controller';
import { TOKENS } from './domain/ports';
import { SequelizeUserRepository } from './adapters/user.repository.sequelize';
import { SequelizeTeamRepository } from './adapters/team.repository.sequelize';
import { SequelizeTeamMemberRepository } from './adapters/team-member.repository.sequelize';
import { SequelizeAdminScopeRepository } from './adapters/admin-scope.repository.sequelize';
import { SequelizeDirectoryQuery } from './adapters/directory.query.sequelize';
import { CreateUser } from './domain/use-cases/CreateUser';
import { UpdateUser } from './domain/use-cases/UpdateUser';
import { ArchiveUser } from './domain/use-cases/ArchiveUser';
import { CreateTeam } from './domain/use-cases/CreateTeam';
import { UpdateTeam } from './domain/use-cases/UpdateTeam';
import { ToggleTeamActive } from './domain/use-cases/ToggleTeamActive';
import { AddTeamMember } from './domain/use-cases/AddTeamMember';
import { RemoveTeamMember } from './domain/use-cases/RemoveTeamMember';
import { ListUsers } from './domain/use-cases/ListUsers';
import { ListTeams } from './domain/use-cases/ListTeams';
import { ListTeamMembers } from './domain/use-cases/ListTeamMembers';
import { GrantAdminScope } from './domain/use-cases/GrantAdminScope';
import { RevokeAdminScope } from './domain/use-cases/RevokeAdminScope';
import { ListAdminScopes } from './domain/use-cases/ListAdminScopes';

@Module({
  imports: [
    SequelizeModule.forFeature([Team, TeamMember, AdminScope, User]),
    AuthModule,
  ],
  controllers: [TeamsController, AdminScopesController, UsersController, UsersControllerV2, TeamsControllerV2, AdminScopesControllerV2],
  providers: [
    TeamsService,
    AdminScopesService,
    UsersService,
    { provide: TOKENS.UserRepository, useClass: SequelizeUserRepository },
    { provide: TOKENS.TeamRepository, useClass: SequelizeTeamRepository },
    { provide: TOKENS.TeamMemberRepository, useClass: SequelizeTeamMemberRepository },
    { provide: TOKENS.AdminScopeRepository, useClass: SequelizeAdminScopeRepository },
    { provide: TOKENS.DirectoryQuery, useClass: SequelizeDirectoryQuery },
    // use-cases
    { provide: CreateUser, useFactory: (u, auth) => new CreateUser(u, auth), inject: [TOKENS.UserRepository, TOKENS.AuthCommand] },
    { provide: UpdateUser, useFactory: (u) => new UpdateUser(u), inject: [TOKENS.UserRepository] },
    { provide: ArchiveUser, useFactory: (u) => new ArchiveUser(u), inject: [TOKENS.UserRepository] },
    { provide: CreateTeam, useFactory: (t) => new CreateTeam(t), inject: [TOKENS.TeamRepository] },
    { provide: UpdateTeam, useFactory: (t) => new UpdateTeam(t), inject: [TOKENS.TeamRepository] },
    { provide: ToggleTeamActive, useFactory: (t) => new ToggleTeamActive(t), inject: [TOKENS.TeamRepository] },
    { provide: AddTeamMember, useFactory: (m, u, t) => new AddTeamMember(m, u, t), inject: [TOKENS.TeamMemberRepository, TOKENS.UserRepository, TOKENS.TeamRepository] },
    { provide: RemoveTeamMember, useFactory: (m) => new RemoveTeamMember(m), inject: [TOKENS.TeamMemberRepository] },
    { provide: ListUsers, useFactory: (u) => new ListUsers(u), inject: [TOKENS.UserRepository] },
    { provide: ListTeams, useFactory: (t) => new ListTeams(t), inject: [TOKENS.TeamRepository] },
    { provide: ListTeamMembers, useFactory: (m) => new ListTeamMembers(m), inject: [TOKENS.TeamMemberRepository] },
    { provide: GrantAdminScope, useFactory: (r) => new GrantAdminScope(r), inject: [TOKENS.AdminScopeRepository] },
    { provide: RevokeAdminScope, useFactory: (r) => new RevokeAdminScope(r), inject: [TOKENS.AdminScopeRepository] },
    { provide: ListAdminScopes, useFactory: (r) => new ListAdminScopes(r), inject: [TOKENS.AdminScopeRepository] },
    // Minimal AuthCommand stub to satisfy DI; real binding in Auth module if needed
    { provide: TOKENS.AuthCommand, useValue: { setPasswordHash: async () => {} } },
  ],
  exports: [SequelizeModule, TOKENS.DirectoryQuery],
})
export class DirectoryModule {}
