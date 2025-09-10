import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({
  tableName: 'category_skills',
  timestamps: false,
})
export class CategorySkill extends Model<CategorySkill> {
  @PrimaryKey
  @Column({ field: 'category_id', type: DataType.UUID })
  categoryId!: string;

  @PrimaryKey
  @Column({ field: 'skill_id', type: DataType.UUID })
  skillId!: string;
}
