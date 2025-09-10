import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({
  tableName: 'team_zones',
  timestamps: false,
})
export class TeamZone extends Model<TeamZone> {
  @PrimaryKey
  @Column({ field: 'team_id', type: DataType.UUID })
  teamId!: string;

  @PrimaryKey
  @Column({ field: 'building_id', type: DataType.UUID })
  buildingId!: string;
}
