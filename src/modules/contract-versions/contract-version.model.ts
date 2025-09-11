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
  tableName: 'contract_versions',
  timestamps: false,
})
export class ContractVersion extends Model<ContractVersion> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique('contract_version_unique')
  @Column({ field: 'contract_id', type: DataType.UUID })
  contractId!: string;

  @AllowNull(false)
  @Unique('contract_version_unique')
  @Column(DataType.INTEGER)
  declare version: number;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @AllowNull(false)
  @Column(DataType.JSONB)
  coverage!: Record<string, unknown>;

  @Column(DataType.JSONB)
  escalation?: Record<string, unknown>;

  @Column(DataType.JSONB)
  approvals?: Record<string, unknown>;
}
