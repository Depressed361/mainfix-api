import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Location } from '../../../../catalog/models/location.model';

@Table({ tableName: 'comfort_indicators', timestamps: false })
export class ComfortIndicator extends Model<ComfortIndicator> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Location)
  @Column({ field: 'location_id', type: DataType.UUID })
  locationId!: string;
  @BelongsTo(() => Location)
  location?: Location;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('temperature', 'noise', 'illuminance', 'air_quality'),
  })
  type!: 'temperature' | 'noise' | 'illuminance' | 'air_quality';

  @AllowNull(false)
  @Column({ type: DataType.DECIMAL(10, 2) })
  value!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  unit!: string;

  @AllowNull(false)
  @Column({ field: 'measured_at', type: DataType.DATE })
  measuredAt!: Date;

  @AllowNull(false)
  @Column({ type: DataType.ENUM('iot', 'manual') })
  source!: 'iot' | 'manual';

  @Column({ field: 'sensor_id', type: DataType.TEXT })
  sensorId?: string;

  @Column(DataType.JSONB)
  metadata?: Record<string, unknown>;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
