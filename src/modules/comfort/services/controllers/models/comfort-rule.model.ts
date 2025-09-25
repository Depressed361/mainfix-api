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
import { Site } from '../../../../catalog/models/site.model';
import { Category } from '../../../../taxonomy/models/category.model';

@Table({ tableName: 'comfort_rules', timestamps: false })
export class ComfortRule extends Model<ComfortRule> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Site)
  @Column({ field: 'site_id', type: DataType.UUID })
  siteId!: string;
  @BelongsTo(() => Site)
  site?: Site;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('temperature', 'noise', 'illuminance', 'air_quality'),
  })
  type!: 'temperature' | 'noise' | 'illuminance' | 'air_quality';

  @AllowNull(false)
  @Column({
    field: 'threshold_op',
    type: DataType.ENUM('>', '>=', '<', '<=', 'between'),
  })
  thresholdOp!: '>' | '>=' | '<' | '<=' | 'between';

  @Column({ field: 'threshold_low', type: DataType.DECIMAL(10, 2) })
  thresholdLow?: string;

  @Column({ field: 'threshold_high', type: DataType.DECIMAL(10, 2) })
  thresholdHigh?: string;

  @AllowNull(false)
  @Default('any')
  @Column({ type: DataType.ENUM('business_hours', 'after_hours', 'any') })
  window!: 'business_hours' | 'after_hours' | 'any';

  @AllowNull(false)
  @ForeignKey(() => Category)
  @Column({ field: 'category_id', type: DataType.UUID })
  categoryId!: string;
  @BelongsTo(() => Category)
  category?: Category;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;
}
