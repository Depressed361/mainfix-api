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
import { Ticket } from '../../tickets/models/ticket.model';
import { User } from '../../directory/models/user.model';

@Table({
  tableName: 'satisfaction_surveys',
  timestamps: true,
  indexes: [
    {
      name: 'uniq_satisfaction_ticket_respondent',
      unique: true,
      fields: ['ticket_id', 'respondent_user_id'], // ✅ c'est ici qu'on met "fields"
    },
  ],
})
export class SatisfactionSurvey extends Model<SatisfactionSurvey> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Ticket)
  @Column({ field: 'ticket_id', type: DataType.UUID })
  ticketId!: string;
  @BelongsTo(() => Ticket)
  ticket?: Ticket;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ field: 'respondent_user_id', type: DataType.UUID })
  respondentUserId!: string;
  @BelongsTo(() => User, 'respondentUserId')
  respondent?: User;

  @AllowNull(false)
  @Column(DataType.SMALLINT)
  rating!: number;

  @Column(DataType.TEXT)
  comment?: string;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
