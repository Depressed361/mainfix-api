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
import { Ticket } from './ticket.model';

@Table({ tableName: 'ticket_parts', timestamps: false })
export class TicketPart extends Model<TicketPart> {
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

  @Column(DataType.TEXT)
  sku?: string;

  @Column(DataType.TEXT)
  label?: string;

  @Column({ type: DataType.DECIMAL(10, 2) })
  qty?: string;

  @Column({ field: 'unit_cost', type: DataType.DECIMAL(10, 2) })
  unitCost?: string;
}
