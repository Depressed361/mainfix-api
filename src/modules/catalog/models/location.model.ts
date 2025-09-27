import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Building } from './buildings.model';

@Table({
  tableName: 'locations',
  timestamps: false,
})
export class Location extends Model<Location> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Building)
  @AllowNull(false)
  @Unique('locations_building_code_unique')
  @Column({ field: 'building_id', type: DataType.UUID })
  declare buildingId: string;

  @BelongsTo(() => Building)
  declare building?: Building;

  @AllowNull(false)
  @Unique('locations_building_code_unique')
  @Column({ field: 'code', type: DataType.TEXT })
  declare name: string;

  @Column(DataType.TEXT)
  declare description?: string | null;
}
