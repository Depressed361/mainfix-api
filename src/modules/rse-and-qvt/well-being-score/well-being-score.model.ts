import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Site } from '../../sites/site.model';

@Table({
  tableName: 'well_being_scores',
  timestamps: false,
  indexes: [
    {
      unique: true,
      name: 'site_period_unique',
      fields: ['site_id', 'period_start', 'period_end'],
    },
  ],
})
export class WellBeingScore extends Model<WellBeingScore> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Site)
  @Column({ field: 'site_id', type: DataType.UUID })
  siteId!: string;
  @BelongsTo(() => Site)
  site?: Site;

  @AllowNull(false)
  @Column({ field: 'period_start', type: DataType.DATEONLY })
  periodStart!: Date;

  @AllowNull(false)
  @Column({ field: 'period_end', type: DataType.DATEONLY })
  periodEnd!: Date;

  @AllowNull(false)
  @Column({ field: 'average_rating', type: DataType.DECIMAL(3, 2) })
  averageRating!: string;

  @AllowNull(false)
  @Column({ field: 'nb_surveys', type: DataType.INTEGER })
  nbSurveys!: number;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
