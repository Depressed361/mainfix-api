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

@Table({ tableName: 'ticket_costs', timestamps: false })
export class TicketCost extends Model<TicketCost> {
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

  @Column({ field: 'labor_hours', type: DataType.DECIMAL(6, 2) })
  laborHours?: string;

  @Column({ field: 'labor_rate', type: DataType.DECIMAL(10, 2) })
  laborRate?: string;

  @Column({ field: 'parts_cost', type: DataType.DECIMAL(10, 2) })
  partsCost?: string;

  @Column({ type: DataType.DECIMAL(12, 2) })
  total?: string;

  @Default('EUR')
  @Column({ type: DataType.CHAR(3) })
  currency!: string;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
