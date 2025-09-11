import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
} from 'sequelize-typescript';

@Table({
  tableName: 'holiday_calendars',
  timestamps: false,
})
export class HolidayCalendar extends Model<HolidayCalendar> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.TEXT)
  code!: string;

  @Column(DataType.TEXT)
  country?: string;
}
