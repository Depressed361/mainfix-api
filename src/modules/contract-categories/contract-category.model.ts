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
  tableName: 'contract_categories',
  timestamps: false,
})
export class ContractCategory extends Model<ContractCategory> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ field: 'contract_version_id', type: DataType.UUID })
  contractVersionId!: string;

  @AllowNull(false)
  @Column({ field: 'category_id', type: DataType.UUID })
  categoryId!: string;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  included!: boolean;

  @AllowNull(false)
  @Column(DataType.JSONB)
  sla!: Record<string, unknown>;
}
