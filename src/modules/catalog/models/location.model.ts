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
  tableName: 'locations',
  timestamps: false,
})
export class Location extends Model<Location> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique('building_code')
  @Column({ field: 'building_id', type: DataType.UUID })
  buildingId!: string;

  @AllowNull(false)
  @Unique('building_code')
  @Column(DataType.TEXT)
  code!: string;

  @Column(DataType.TEXT)
  description?: string;
}
