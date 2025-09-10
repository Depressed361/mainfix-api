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
  tableName: 'skills',
  timestamps: false,
})
export class Skill extends Model<Skill> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique('company_key')
  @Column({ field: 'company_id', type: DataType.UUID })
  companyId!: string;

  @AllowNull(false)
  @Unique('company_key')
  @Column(DataType.TEXT)
  key!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  label!: string;
}
