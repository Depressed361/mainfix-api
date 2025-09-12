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
import { Ticket } from './models/ticket.model';
import { User } from '../directory/models/user.model';

@Table({ tableName: 'ticket_comments', timestamps: false })
export class TicketComment extends Model<TicketComment> {
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
  @Column({ field: 'author_user_id', type: DataType.UUID })
  authorUserId!: string;
  @BelongsTo(() => User, 'authorUserId')
  author?: User;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body!: string;

  @Default(false)
  @Column({ field: 'is_internal', type: DataType.BOOLEAN })
  isInternal!: boolean;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
