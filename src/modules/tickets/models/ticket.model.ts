import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  ForeignKey,
  AllowNull,
  BelongsTo,
  HasMany,
  PrimaryKey,
} from 'sequelize-typescript';
import { Company } from '../../companies/company.model';
import { Site } from '../../catalog/models/site.model';
import { Building } from '../../catalog/models/buildings.model';
import { Location } from '../../catalog/models/location.model';
import { Category } from '../../taxonomy/models/category.model';
import { Asset } from '../../catalog/models/asset.model';
import { User } from '../../directory/models/user.model';
import { Team } from '../../directory/models/team.model';
import { Contract } from '../../contracts/models/contract.model';
import { TicketEvent } from './ticket-event.model';
import { TicketComment } from '../ticket-comment.model';
import { TicketAttachment } from '../ticket-attachment.model';
import { TicketCost } from '../../cost/models/ticket-cost.model';
import { TicketPart } from '../../cost/models/ticket-part.model';
import { TicketLink } from './ticket-link.model';
import { SlaTarget } from '../../sla/sla-target.model';
import { ApprovalRequest } from '../../approvals/approval-request.model';
import { SatisfactionSurvey } from '../../satisfaction/models/satisfaction-survey.model';

@Table({
  tableName: 'tickets',
  timestamps: false,
})
export class Ticket extends Model<Ticket> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(32) })
  declare number: string;

  @AllowNull(false)
  @ForeignKey(() => Company)
  @Column({ field: 'company_id', type: DataType.UUID })
  companyId!: string;
  @BelongsTo(() => Company)
  company?: Company;

  @AllowNull(false)
  @ForeignKey(() => Site)
  @Column({ field: 'site_id', type: DataType.UUID })
  siteId!: string;
  @BelongsTo(() => Site)
  site?: Site;

  @ForeignKey(() => Building)
  @Column({ field: 'building_id', type: DataType.UUID })
  buildingId?: string;
  @BelongsTo(() => Building)
  building?: Building;

  @ForeignKey(() => Location)
  @Column({ field: 'location_id', type: DataType.UUID })
  locationId?: string;
  @BelongsTo(() => Location)
  location?: Location;

  @AllowNull(false)
  @ForeignKey(() => Category)
  @Column({ field: 'category_id', type: DataType.UUID })
  categoryId!: string;
  @BelongsTo(() => Category)
  category?: Category;

  @ForeignKey(() => Asset)
  @Column({ field: 'asset_id', type: DataType.UUID })
  assetId?: string;
  @BelongsTo(() => Asset)
  asset?: Asset;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ field: 'reporter_id', type: DataType.UUID })
  reporterId!: string;
  @BelongsTo(() => User, 'reporterId')
  reporter?: User;

  @ForeignKey(() => Team)
  @Column({ field: 'assignee_team_id', type: DataType.UUID })
  assigneeTeamId?: string;
  @BelongsTo(() => Team, 'assigneeTeamId')
  assigneeTeam?: Team;

  @Column({ field: 'assigned_at', type: DataType.DATE })
  assignedAt?: Date;

  @Column(DataType.TEXT)
  ergonomie?: string;

  @AllowNull(false)
  @Column({ type: DataType.ENUM('P1', 'P2', 'P3') })
  priority!: 'P1' | 'P2' | 'P3';

  @AllowNull(false)
  @Default('open')
  @Column({
    type: DataType.ENUM(
      'draft', // Temporarily disabled
      'open',
      'assigned',
      'in_progress',
      'awaiting_confirmation',
      'resolved',
      'closed',
      'cancelled',
    ),
  })
  status!:
    | 'draft' // temporarily disabled
    | 'open'
    | 'assigned'
    | 'in_progress'
    | 'awaiting_confirmation'
    | 'resolved'
    | 'closed'
    | 'cancelled';

  @Column({ type: DataType.DATE, field: 'status_updated_at' })
  declare statusUpdatedAt: Date;

  @Column(DataType.TEXT)
  title?: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.JSONB)
  photos?: Record<string, unknown>;

  @Column({ field: 'sla_ack_deadline', type: DataType.DATE })
  slaAckDeadline?: Date;

  @Column({ field: 'sla_resolve_deadline', type: DataType.DATE })
  slaResolveDeadline?: Date;

  @Column({ field: 'ack_at', type: DataType.DATE })
  ackAt?: Date;

  @Column({ field: 'resolved_at', type: DataType.DATE })
  resolvedAt?: Date;

  @ForeignKey(() => Contract)
  @Column({ field: 'contract_id', type: DataType.UUID })
  contractId?: string;
  @BelongsTo(() => Contract)
  contract?: Contract;

  @Column({ field: 'contract_version', type: DataType.INTEGER })
  contractVersion?: number;

  @Column({ field: 'contract_snapshot', type: DataType.JSONB })
  contractSnapshot?: Record<string, unknown>;

  @Default(DataType.NOW)
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @Default(DataType.NOW)
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;

  @HasMany(() => TicketEvent)
  events?: TicketEvent[];

  @HasMany(() => TicketComment)
  comments?: TicketComment[];

  @HasMany(() => TicketAttachment)
  attachments?: TicketAttachment[];

  @HasMany(() => TicketCost)
  costs?: TicketCost[];

  @HasMany(() => TicketPart)
  parts?: TicketPart[];

  @HasMany(() => TicketLink, { foreignKey: 'parentTicketId' })
  childLinks?: TicketLink[];

  @HasMany(() => TicketLink, { foreignKey: 'childTicketId' })
  parentLinks?: TicketLink[];

  @HasMany(() => SlaTarget)
  slaTargets?: SlaTarget[];

  @HasMany(() => ApprovalRequest)
  approvalRequests?: ApprovalRequest[];

  @HasMany(() => SatisfactionSurvey)
  surveys?: SatisfactionSurvey[];
}
