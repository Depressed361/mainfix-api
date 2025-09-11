import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Company } from '../companies/company.model';
import { Site } from '../sites/site.model';
import { Building } from '../buildings/buildings.model';
import { Location } from '../locations/location.model';
import { Category } from '../categories/category.model';
import { Asset } from '../asset/asset.model';
import { User } from '../users/user.model';
import { Team } from '../teams/team.model';
import { Contract } from '../contracts/contract.model';
import { TicketEvent } from './ticket-event.model';
import { TicketComment } from './ticket-comment.model';
import { TicketAttachment } from './ticket-attachment.model';
import { TicketCost } from './ticket-cost.model';
import { TicketPart } from './ticket-part.model';
import { TicketLink } from './ticket-link.model';
import { SlaTarget } from './sla/sla-target.model';
import { ApprovalRequest } from './approval-request.model';
import { SatisfactionSurvey } from './satisfaction-survey/satisfaction-survey.model';

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

  @Column(DataType.TEXT)
  ergonomie?: string;

  @AllowNull(false)
  @Column({ type: DataType.ENUM('P1', 'P2', 'P3') })
  priority!: 'P1' | 'P2' | 'P3';

  @AllowNull(false)
  @Default('NEW')
  @Column({
    type: DataType.ENUM(
      'NEW',
      'TRI_AUTO',
      'ASSIGNÉ',
      'EN_COURS',
      'EN_ATTENTE',
      'RÉSOLU',
      'VALIDÉ',
      'CLOS',
      'BACKLOG',
    ),
  })
  status!:
    | 'NEW'
    | 'TRI_AUTO'
    | 'ASSIGNÉ'
    | 'EN_COURS'
    | 'EN_ATTENTE'
    | 'RÉSOLU'
    | 'VALIDÉ'
    | 'CLOS'
    | 'BACKLOG';

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
