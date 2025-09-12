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

@Table({ tableName: 'ticket_attachments', timestamps: false })
export class TicketAttachment extends Model<TicketAttachment> {
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
  @Column(DataType.TEXT)
  key!: string;

  @Column({ field: 'mime_type', type: DataType.TEXT })
  mimeType?: string;

  @Column({ field: 'size_bytes', type: DataType.INTEGER })
  sizeBytes?: number;

  @ForeignKey(() => User)
  @Column({ field: 'uploaded_by', type: DataType.UUID })
  uploadedBy?: string;
  @BelongsTo(() => User, 'uploadedBy')
  uploader?: User;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;
}
