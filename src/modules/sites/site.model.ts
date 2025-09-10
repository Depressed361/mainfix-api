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
  tableName: 'sites',
  timestamps: false,
})
export class Site extends Model<Site> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique('company_code')
  @Column({ field: 'company_id', type: DataType.UUID })
  companyId!: string;

  @AllowNull(false)
  @Unique('company_code')
  @Column(DataType.TEXT)
  code!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  name!: string;

  @AllowNull(false)
  @Default('Europe/Paris')
  @Column(DataType.TEXT)
  timezone!: string;
}
