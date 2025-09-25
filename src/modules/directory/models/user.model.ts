import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  AllowNull,
  Unique,
  Index,
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: false, // la table n'a que created_at (pas updated_at)
})
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string;

  @AllowNull(false)
  @Column({ field: 'company_id', type: DataType.UUID })
  companyId!: string;

  @Column({ field: 'passwordHash', type: DataType.STRING, allowNull: false })
  declare passwordHash: string;

  @AllowNull(false)
  @Unique
  @Index
  @Column({ type: DataType.CITEXT }) // si CITEXT indispo en local, remplace par STRING
  email!: string;

  @Column({ field: 'site_id', type: DataType.UUID, allowNull: true })
  declare siteId?: string;

  @AllowNull(false)
  @Column({ field: 'display_name', type: DataType.STRING })
  displayName!: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(
      'occupant',
      'maintainer',
      'manager',
      'approver',
      'admin',
    ),
  })
  role!: 'occupant' | 'maintainer' | 'manager' | 'approver' | 'admin'; //

  @Default(true)
  @Column({ type: DataType.BOOLEAN })
  active!: boolean;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
