import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
} from 'sequelize-typescript';

@Table({
  tableName: 'holidays',
  timestamps: false,
})
export class Holiday extends Model<Holiday> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ field: 'calendar_id', type: DataType.UUID })
  calendarId?: string;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  day!: string;

  @Column(DataType.TEXT)
  label?: string;
}
