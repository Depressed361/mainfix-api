import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, Unique } from 'sequelize-typescript';

@Table({ tableName: 'rse_reports', timestamps: false })
export class RseReport extends Model<RseReport> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique('uniq_company_period')
  @Column({ field: 'company_id', type: DataType.UUID })
  declare companyId: string;

  @AllowNull(false)
  @Unique('uniq_company_period')
  @Column({ field: 'period_start', type: DataType.DATEONLY })
  declare periodStart: Date;

  @AllowNull(false)
  @Unique('uniq_company_period')
  @Column({ field: 'period_end', type: DataType.DATEONLY })
  declare periodEnd: Date;

  @Column({ field: 'satisfaction_avg', type: DataType.DECIMAL(3, 2) })
  declare satisfactionAvg?: string | null;

  @Column({ field: 'comfort_index_avg', type: DataType.DECIMAL(5, 2) })
  declare comfortIndexAvg?: string | null;

  @AllowNull(false)
  @Default(0)
  @Column({ field: 'ergonomics_tickets_count', type: DataType.INTEGER })
  declare ergonomicsTicketsCount: number;

  @Column({ field: 'resolved_ratio', type: DataType.DECIMAL(5, 2) })
  declare resolvedRatio?: string | null;

  @Column({ field: 'export_path', type: DataType.TEXT })
  declare exportPath?: string | null;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}

