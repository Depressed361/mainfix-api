import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from 'sequelize-typescript';
import { Ticket } from './ticket.model';

@Table({ tableName: 'ticket_links', timestamps: false })
export class TicketLink extends Model<TicketLink> {
  @PrimaryKey
  @ForeignKey(() => Ticket)
  @Column({ field: 'parent_ticket_id', type: DataType.UUID })
  parentTicketId!: string;
  @BelongsTo(() => Ticket, 'parentTicketId')
  parent?: Ticket;

  @PrimaryKey
  @ForeignKey(() => Ticket)
  @Column({ field: 'child_ticket_id', type: DataType.UUID })
  childTicketId!: string;
  @BelongsTo(() => Ticket, 'childTicketId')
  child?: Ticket;

  @Column({
    type: DataType.ENUM('duplicate', 'related', 'parent-child'),
  })
  relation!: 'duplicate' | 'related' | 'parent-child';
}
