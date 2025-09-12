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
  tableName: 'teams',
  timestamps: false,
})
export class Team extends Model<Team> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ field: 'company_id', type: DataType.UUID })
  companyId!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  name!: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('internal', 'vendor'),
  })
  type!: 'internal' | 'vendor';

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;
}
