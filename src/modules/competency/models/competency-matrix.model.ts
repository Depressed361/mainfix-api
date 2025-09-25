import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  ForeignKey,
  AllowNull,
  BelongsTo,
  Unique,
} from 'sequelize-typescript';
import { ContractVersion } from '../../contracts/models/contract-version.model';
import { Team } from '../../directory/models/team.model';
import { Category } from '../../taxonomy/models/category.model';
import { Building } from '../../catalog/models/buildings.model';

@Table({
  tableName: 'competency_matrix',
  timestamps: false,
})
export class CompetencyMatrix extends Model<CompetencyMatrix> {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => ContractVersion)
  @AllowNull(false)
  @Unique('competency_unique')
  @Column({ field: 'contract_version_id', type: DataType.UUID })
  declare contractVersionId: string;

  @BelongsTo(() => ContractVersion)
  declare contractVersion?: ContractVersion;

  @ForeignKey(() => Team)
  @AllowNull(false)
  @Unique('competency_unique')
  @Column({ field: 'team_id', type: DataType.UUID })
  declare teamId: string;

  @BelongsTo(() => Team)
  declare team?: Team;

  @ForeignKey(() => Category)
  @AllowNull(false)
  @Unique('competency_unique')
  @Column({ field: 'category_id', type: DataType.UUID })
  declare categoryId: string;

  @BelongsTo(() => Category)
  declare category?: Category;

  @ForeignKey(() => Building)
  @Unique('competency_unique')
  @Column({ field: 'building_id', type: DataType.UUID })
  declare buildingId?: string | null;

  @BelongsTo(() => Building)
  declare building?: Building;

  @AllowNull(false)
  @Column({ type: DataType.ENUM('primary', 'backup') })
  declare level: 'primary' | 'backup';

  @AllowNull(false)
  @Unique('competency_unique')
  @Column({ type: DataType.ENUM('business_hours', 'after_hours', 'any') })
  declare window: 'business_hours' | 'after_hours' | 'any';
}
