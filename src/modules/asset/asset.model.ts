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
  tableName: 'assets',
  timestamps: false,
})
export class Asset extends Model<Asset> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique('company_code')
  @Column({ field: 'company_id', type: DataType.UUID })
  companyId!: string;

  @Column({ field: 'location_id', type: DataType.UUID })
  locationId?: string;

  @AllowNull(false)
  @Unique('company_code')
  @Column(DataType.TEXT)
  code!: string;

  @Column(DataType.TEXT)
  kind?: string;

  @Column(DataType.JSONB)
  metadata?: Record<string, unknown>;
}
