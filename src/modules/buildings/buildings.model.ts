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
  tableName: 'buildings',
  timestamps: false,
})
export class Building extends Model<Building> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique('site_code')
  @Column({ field: 'site_id', type: DataType.UUID })
  siteId!: string;

  @AllowNull(false)
  @Unique('site_code')
  @Column(DataType.TEXT)
  code!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  name!: string;
}
