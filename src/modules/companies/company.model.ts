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
  tableName: 'companies',
  timestamps: false,
})
export class Company extends Model<Company> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  name!: string;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
