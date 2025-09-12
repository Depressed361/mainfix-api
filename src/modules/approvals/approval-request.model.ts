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
import { Ticket } from '../tickets/models/ticket.model';

@Table({ tableName: 'approval_requests', timestamps: false })
export class ApprovalRequest extends Model<ApprovalRequest> {
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
  reason?: string;

  @Column({ field: 'amount_estimate', type: DataType.DECIMAL(12, 2) })
  amountEstimate?: string;

  @Default('EUR')
  @Column({ type: DataType.CHAR(3) })
  currency!: string;

  @Default('PENDING')
  @Column({ type: DataType.ENUM('PENDING', 'APPROVED', 'REJECTED') })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
