import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({
  tableName: 'team_skills',
  timestamps: false,
})
export class TeamSkill extends Model<TeamSkill> {
  @PrimaryKey
  @Column({ field: 'team_id', type: DataType.UUID })
  declare teamId: string;

  @PrimaryKey
  @Column({ field: 'skill_id', type: DataType.UUID })
  declare skillId: string;
}
