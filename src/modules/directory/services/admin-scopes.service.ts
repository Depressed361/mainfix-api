import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AdminScope, AdminScopeType } from '../models/admin-scope.model';
import { CreateAdminScopeDto } from '../dto/create-admin-scope.dto';
import { RemoveAdminScopeDto } from '../dto/remove-admin-scope.dto';

interface ScopePayload {
  userId: string;
  scope: AdminScopeType;
  companyId: string | null;
  siteId: string | null;
  buildingId: string | null;
}

@Injectable()
export class AdminScopesService {
  constructor(
    @InjectModel(AdminScope)
    private readonly adminScopes: typeof AdminScope,
  ) {}

  private normalize(dto: CreateAdminScopeDto | RemoveAdminScopeDto): ScopePayload {
    const companyId = dto.companyId ?? null;
    const siteId = dto.siteId ?? null;
    const buildingId = dto.buildingId ?? null;

    switch (dto.scope) {
      case 'platform':
        if (companyId || siteId || buildingId) {
          throw new BadRequestException(
            'Platform scope must not include company, site or building identifiers',
          );
        }
        break;
      case 'company':
        if (!companyId || siteId || buildingId) {
          throw new BadRequestException(
            'Company scope requires companyId and forbids siteId/buildingId',
          );
        }
        break;
      case 'site':
        if (!siteId || buildingId) {
          throw new BadRequestException(
            'Site scope requires siteId and forbids buildingId',
          );
        }
        break;
      case 'building':
        if (!buildingId) {
          throw new BadRequestException('Building scope requires buildingId');
        }
        break;
      default:
        throw new BadRequestException('Unsupported admin scope type');
    }

    return {
      userId: dto.userId,
      scope: dto.scope,
      companyId,
      siteId,
      buildingId,
    };
  }

  async create(payload: CreateAdminScopeDto) {
    const normalized = this.normalize(payload);
    return this.adminScopes.create(normalized as AdminScope);
  }

  async listForUser(userId: string) {
    return this.adminScopes.findAll({
      where: { userId },
      order: [['created_at', 'ASC']],
    });
  }

  async remove(payload: RemoveAdminScopeDto) {
    const normalized = this.normalize(payload);
    const deleted = await this.adminScopes.destroy({
      where: normalized,
    });
    if (deleted === 0) {
      throw new NotFoundException('Admin scope not found');
    }
    return { deleted: true } as const;
  }
}
