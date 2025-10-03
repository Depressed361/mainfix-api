import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes } from 'sequelize';
import { Ticket } from '../../tickets/models/ticket.model';
import { User } from '../../directory/models/user.model';

@Table({ tableName: 'ticket_events', timestamps: false })
export class TicketEvent extends Model<InferAttributes<TicketEvent>, InferCreationAttributes<TicketEvent>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Ticket)
  @Column({ field: 'ticket_id', type: DataType.UUID })
  ticketId!: string;
  @BelongsTo(() => Ticket)
  ticket?: Ticket;

  @ForeignKey(() => User)
  @Column({ field: 'actor_user_id', type: DataType.UUID })
  actorUserId?: string;
  @BelongsTo(() => User, 'actorUserId')
  actor?: User;

  @AllowNull(false)
  @Column(DataType.TEXT)
  type!: string;

  @Column(DataType.JSONB)
  payload?: Record<string, unknown>;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
