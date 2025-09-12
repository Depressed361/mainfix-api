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
  tableName: 'competency_matrix',
  timestamps: false,
})
export class CompetencyMatrix extends Model<CompetencyMatrix> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique('competency_unique')
  @Column({ field: 'contract_version_id', type: DataType.UUID })
  contractVersionId!: string;

  @AllowNull(false)
  @Unique('competency_unique')
  @Column({ field: 'team_id', type: DataType.UUID })
  teamId!: string;

  @AllowNull(false)
  @Unique('competency_unique')
  @Column({ field: 'category_id', type: DataType.UUID })
  categoryId!: string;

  @Unique('competency_unique')
  @Column({ field: 'building_id', type: DataType.UUID })
  buildingId?: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('primary', 'backup'),
  })
  level!: 'primary' | 'backup';

  @AllowNull(false)
  @Unique('competency_unique')
  @Column({
    type: DataType.ENUM('business_hours', 'after_hours', 'any'),
  })
  window!: 'business_hours' | 'after_hours' | 'any';
}
