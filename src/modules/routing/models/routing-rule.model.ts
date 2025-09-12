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
  tableName: 'routing_rules',
  timestamps: false,
})
export class RoutingRule extends Model<RoutingRule> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ field: 'contract_version_id', type: DataType.UUID })
  contractVersionId!: string;

  @AllowNull(false)
  @Default(100)
  @Column(DataType.INTEGER)
  priority!: number;

  @AllowNull(false)
  @Column(DataType.JSONB)
  condition!: Record<string, unknown>;

  @AllowNull(false)
  @Column(DataType.JSONB)
  action!: Record<string, unknown>;
}
