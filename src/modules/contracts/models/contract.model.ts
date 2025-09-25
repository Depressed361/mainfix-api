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
  tableName: 'contracts',
  timestamps: false,
})
export class Contract extends Model<Contract> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ field: 'site_id', type: DataType.UUID })
  siteId!: string;

  @AllowNull(true)
  @Column({ field: 'provider_company_id', type: DataType.UUID })
  declare providerCompanyId?: string | null;

  @AllowNull(false)
  @Column(DataType.TEXT)
  name!: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;
}
