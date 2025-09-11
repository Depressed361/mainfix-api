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
import { SlaTarget } from './sla-target.model';

@Table({ tableName: 'sla_breaches', timestamps: false })
export class SlaBreach extends Model<SlaBreach> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => SlaTarget)
  @Column({ field: 'sla_target_id', type: DataType.UUID })
  slaTargetId!: string;
  @BelongsTo(() => SlaTarget)
  slaTarget?: SlaTarget;

  @AllowNull(false)
  @Column({ field: 'breached_at', type: DataType.DATE })
  breachedAt!: Date;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  level!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  notified!: boolean;
}
