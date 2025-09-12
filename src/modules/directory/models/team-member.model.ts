import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({
  tableName: 'team_members',
  timestamps: false,
})
export class TeamMember extends Model<TeamMember> {
  @PrimaryKey
  @Column({ field: 'team_id', type: DataType.UUID })
  teamId!: string;

  @PrimaryKey
  @Column({ field: 'user_id', type: DataType.UUID })
  userId!: string;
}
