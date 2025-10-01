import { IsString, IsOptional, IsUUID, Matches } from 'class-validator';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export class UpsertCalendarDto {
  @IsString() code!: string;
  @IsOptional() @IsString() country?: string;
}

export class UpsertHolidayDto {
  @IsUUID() calendarId!: string;
  @Matches(ISO) day!: string; // 'YYYY-MM-DD'
  @IsOptional() @IsString() label?: string;
}

export class RemoveHolidayDto {
  @IsUUID() calendarId!: string;
  @Matches(ISO) day!: string;
}

export class ListRangeQueryDto {
  @IsUUID() calendarId!: string;
  @Matches(ISO) from!: string;
  @Matches(ISO) to!: string;
}

