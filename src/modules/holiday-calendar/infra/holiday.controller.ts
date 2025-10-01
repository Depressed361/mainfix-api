import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { AdminScope } from '../../auth/decorators/admin-scope.decorator';
import { UpsertCalendarDto, UpsertHolidayDto, RemoveHolidayDto, ListRangeQueryDto } from './dto';
import { CreateOrUpdateCalendar } from '../domain/use-cases/CreateOrUpdateCalendar';
import { UpsertHoliday } from '../domain/use-cases/UpsertHoliday';
import { RemoveHoliday } from '../domain/use-cases/RemoveHoliday';
import { ListHolidaysInRange } from '../domain/use-cases/ListHolidaysInRange';

@Controller()
export class HolidayController {
  constructor(
    private readonly createOrUpdate: CreateOrUpdateCalendar,
    private readonly upsertHoliday: UpsertHoliday,
    private readonly removeHoliday: RemoveHoliday,
    private readonly listInRange: ListHolidaysInRange,
  ) {}

  @UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
  @AdminScope({ type: 'platform' })
  @Post('holidays/calendars')
  createOrUpdateCalendar(@Body() dto: UpsertCalendarDto) {
    return this.createOrUpdate.execute({ code: dto.code, country: dto.country ?? null });
  }

  @UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
  @AdminScope({ type: 'platform' })
  @Post('holidays')
  upsert(@Body() dto: UpsertHolidayDto) {
    return this.upsertHoliday.execute({ calendarId: dto.calendarId, day: dto.day, label: dto.label ?? null });
  }

  @UseGuards(JwtAuthGuard, RequireAdminRoleGuard, RequireAdminScopeGuard)
  @AdminScope({ type: 'platform' })
  @Delete('holidays')
  remove(@Body() dto: RemoveHolidayDto) {
    return this.removeHoliday.execute({ calendarId: dto.calendarId, day: dto.day });
  }

  @UseGuards(JwtAuthGuard)
  @Get('holidays')
  listRange(@Query() q: ListRangeQueryDto) {
    return this.listInRange.execute({ calendarId: q.calendarId, from: q.from, to: q.to });
  }
}

