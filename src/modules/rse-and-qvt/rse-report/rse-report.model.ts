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
import { Company } from '../../companies/company.model';

@Table({
  tableName: 'rse_reports',
  timestamps: false,
  indexes: [
    {
      unique: true,
      name: 'company_period_unique',
      fields: ['company_id', 'period_start', 'period_end'],
    },
  ],
})
export class RseReport extends Model<RseReport> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Company)
  @Column({ field: 'company_id', type: DataType.UUID })
  companyId!: string;
  @BelongsTo(() => Company)
  company?: Company;

  @AllowNull(false)
  @Column({ field: 'period_start', type: DataType.DATEONLY })
  periodStart!: Date;

  @AllowNull(false)
  @Column({ field: 'period_end', type: DataType.DATEONLY })
  periodEnd!: Date;

  @Column({ field: 'satisfaction_avg', type: DataType.DECIMAL(3, 2) })
  satisfactionAvg?: string;

  @Column({ field: 'comfort_index_avg', type: DataType.DECIMAL(5, 2) })
  comfortIndexAvg?: string;

  @Column({ field: 'ergonomics_tickets_count', type: DataType.INTEGER })
  ergonomicsTicketsCount?: number;

  @Column({ field: 'resolved_ratio', type: DataType.DECIMAL(5, 2) })
  resolvedRatio?: string;

  @Column({ field: 'export_path', type: DataType.TEXT })
  exportPath?: string;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
