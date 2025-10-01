import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HolidayCalendar } from '../../calendar/models/holiday-calendar.model';
import { Holiday } from '../../calendar/models/holiday.model';
import { HolidayController } from './holiday.controller';
import { TOKENS } from '../domain/ports';
import { SequelizeHolidayCalendarRepository } from '../adapters/holiday-calendar.repository.sequelize';
import { SequelizeHolidayRepository } from '../adapters/holiday.repository.sequelize';
import { RepoSlaHolidayProvider, SequelizeContractsQuery } from '../adapters/queries.sequelize';
import { CreateOrUpdateCalendar } from '../domain/use-cases/CreateOrUpdateCalendar';
import { UpsertHoliday } from '../domain/use-cases/UpsertHoliday';
import { RemoveHoliday } from '../domain/use-cases/RemoveHoliday';
import { ListHolidaysInRange } from '../domain/use-cases/ListHolidaysInRange';
import { GetHolidaysForContract } from '../domain/use-cases/GetHolidaysForContract';
import { ContractVersion } from '../../contracts/models/contract-version.model';

@Module({
  imports: [SequelizeModule.forFeature([HolidayCalendar, Holiday, ContractVersion])],
  controllers: [HolidayController],
  providers: [
    { provide: TOKENS.HolidayCalendarRepository, useClass: SequelizeHolidayCalendarRepository },
    { provide: TOKENS.HolidayRepository, useClass: SequelizeHolidayRepository },
    { provide: TOKENS.ContractsQuery, useClass: SequelizeContractsQuery },
    { provide: TOKENS.SlaHolidayProvider, useFactory: (calRepo, holRepo) => new RepoSlaHolidayProvider(calRepo, holRepo), inject: [TOKENS.HolidayCalendarRepository, TOKENS.HolidayRepository] },
    { provide: CreateOrUpdateCalendar, useFactory: (repo) => new CreateOrUpdateCalendar(repo), inject: [TOKENS.HolidayCalendarRepository] },
    { provide: UpsertHoliday, useFactory: (repo) => new UpsertHoliday(repo), inject: [TOKENS.HolidayRepository] },
    { provide: RemoveHoliday, useFactory: (repo) => new RemoveHoliday(repo), inject: [TOKENS.HolidayRepository] },
    { provide: ListHolidaysInRange, useFactory: (repo) => new ListHolidaysInRange(repo), inject: [TOKENS.HolidayRepository] },
    { provide: GetHolidaysForContract, useFactory: (cq, prov) => new GetHolidaysForContract(cq, prov), inject: [TOKENS.ContractsQuery, TOKENS.SlaHolidayProvider] },
  ],
  exports: [
    SequelizeModule,
    TOKENS.HolidayCalendarRepository,
    TOKENS.HolidayRepository,
    TOKENS.SlaHolidayProvider,
    GetHolidaysForContract,
  ],
})
export class HolidayModule {}

