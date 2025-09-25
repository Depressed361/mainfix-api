import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  AllowNull,
  BelongsTo,
  CreatedAt,
  PrimaryKey,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Company } from '../../companies/company.model';
import { Site } from '../../catalog/models/site.model';
import { Building } from '../../catalog/models/buildings.model';

export type AdminScopeType = 'platform' | 'company' | 'site' | 'building';

@Table({
  tableName: 'admin_scopes',
  timestamps: false,
  underscored: true,
})
export class AdminScope extends Model<AdminScope> {
  declare id?: never;

  @PrimaryKey
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  declare userId: string;

  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.ENUM('platform', 'company', 'site', 'building'),
  })
  declare scope: AdminScopeType;

  @PrimaryKey
  @ForeignKey(() => Company)
  @Column({ field: 'company_id', type: DataType.UUID })
  declare companyId?: string | null;

  @PrimaryKey
  @ForeignKey(() => Site)
  @Column({ field: 'site_id', type: DataType.UUID })
  declare siteId?: string | null;

  @PrimaryKey
  @ForeignKey(() => Building)
  @Column({ field: 'building_id', type: DataType.UUID })
  declare buildingId?: string | null;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @BelongsTo(() => User)
  declare user?: User;

  @BelongsTo(() => Company)
  declare company?: Company;

  @BelongsTo(() => Site)
  declare site?: Site;

  @BelongsTo(() => Building)
  declare building?: Building;
}
