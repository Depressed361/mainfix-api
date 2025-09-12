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
  HasMany,
} from 'sequelize-typescript';
import { Ticket } from '../tickets/models/ticket.model';
import { SlaBreach } from './sla-breach.model';

@Table({ tableName: 'sla_targets', timestamps: false })
export class SlaTarget extends Model<SlaTarget> {
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
  @Column({ type: DataType.ENUM('ack', 'resolve') })
  kind!: 'ack' | 'resolve';

  @AllowNull(false)
  @Column(DataType.DATE)
  deadline!: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  paused!: boolean;

  @Column({ field: 'paused_at', type: DataType.DATE })
  pausedAt?: Date;

  @HasMany(() => SlaBreach, { foreignKey: 'slaTargetId', sourceKey: 'id' })
  breaches!: SlaBreach[]; // <-- propriété “virtuel relationnel”
}
