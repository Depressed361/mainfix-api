import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({
  tableName: 'category_skills',
  timestamps: false,
})
export class CategorySkill extends Model<
  InferAttributes<CategorySkill>,
  InferCreationAttributes<CategorySkill>
> {
  @PrimaryKey
  @Column({ field: 'category_id', type: DataType.UUID })
  declare categoryId: string;

  @PrimaryKey
  @Column({ field: 'skill_id', type: DataType.UUID })
  declare skillId: string;
}
