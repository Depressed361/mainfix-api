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
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
@Table({
  tableName: 'skills',
  timestamps: false,
})
export class Skill extends Model<
  InferAttributes<Skill>,
  InferCreationAttributes<Skill>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;
  @AllowNull(false)
  @Unique('company_key')
  @Column({ field: 'company_id', type: DataType.UUID })
  declare companyId: string;

  @AllowNull(false)
  @Unique('company_key')
  @Column(DataType.TEXT)
  declare key: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare label: string;

  declare createdAt?: Date;
  declare updatedAt?: Date;
}
