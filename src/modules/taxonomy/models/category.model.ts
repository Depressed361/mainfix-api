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
  tableName: 'categories',
  timestamps: false,
})
export class Category extends Model<Category> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique('company_key')
  @Column({ field: 'company_id', type: DataType.UUID })
  declare companyId: string;

  @AllowNull(false)
  @Unique('company_key')
  @Column(DataType.TEXT)
  declare key: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare label: string;
}
