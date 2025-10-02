import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { CompetencyMatrix } from '../models/competency-matrix.model';
import { ContractVersion } from '../../contracts/models/contract-version.model';
import { CreateCompetencyDto } from '../dto/create-competency.dto';
import { UpdateCompetencyDto } from '../dto/update-competency.dto';
import { ResolveCompetencyQueryDto } from '../dto/resolve-competency.query';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { Contract } from '../../contracts/models/contract.model';
import { Site } from '../../catalog/models/site.model';

@Injectable()
export class CompetencyService {
  constructor(
    @InjectModel(CompetencyMatrix)
    private readonly matrix: typeof CompetencyMatrix,
    @InjectModel(ContractVersion)
    private readonly contractVersions: typeof ContractVersion,
    @InjectModel(Contract)
    private readonly contracts: typeof Contract,
    @InjectModel(Site)
    private readonly sites: typeof Site,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  list(contractVersionId: string) {
    return this.matrix.findAll({
      where: { contractVersionId },
      order: [['level', 'ASC']],
    });
  }

  async listByContract(contractId: string, versionNumber: number) {
    const version = await this.contractVersions.findOne({
      where: { contractId, version: versionNumber },
    });
    if (!version) throw new NotFoundException('Contract version not found');
    return this.list(version.id);
  }

  create(dto: CreateCompetencyDto) {
    return this.matrix.create(dto as any);
  }

  async update(id: string, dto: UpdateCompetencyDto) {
    const row = await this.matrix.findByPk(id);
    if (!row) throw new NotFoundException('Competency not found');
    return row.update(dto as any);
  }

  async remove(id: string) {
    const row = await this.matrix.findByPk(id);
    if (!row) return { deleted: 0 };
    await row.destroy();
    return { deleted: 1 };
  }

  async resolve(actor: AuthenticatedActor, query: ResolveCompetencyQueryDto) {
    const version = await this.contractVersions.findOne({
      where: { contractId: query.contractId, version: query.version },
    });
    if (!version) {
      throw new NotFoundException('Contract version not found');
    }

    // Strict policy: verify actor can read within company perimeter; otherwise obfuscate as 404
    const contract = await this.contracts.findByPk(query.contractId);
    if (!contract) throw new NotFoundException('Contract not found');
    const site = await this.sites.findByPk(contract.siteId);
    const companyId = site?.companyId;
    const hasSuper = actor.scopeStrings?.includes('admin:super');
    const allowed = hasSuper || actor.companyId === companyId || (actor.companyScopeIds || []).includes(companyId!) || (actor.siteScopeIds || []).includes(contract.siteId);
    if (!allowed) {
      // obfuscate
      throw new NotFoundException('Contract version not found');
    }

    const sql = `
      WITH ctx AS (
        SELECT
          :categoryId::uuid   AS category_id,
          :buildingId::uuid   AS building_id,
          :window::enum_competency_matrix_window       AS window
      )
      SELECT
        cm.*,
        t.name AS team_name
      FROM competency_matrix cm
      JOIN teams t ON t.id = cm.team_id AND t.active = true
      JOIN ctx c ON TRUE
      WHERE cm.contract_version_id = :contractVersionId
        AND cm.category_id = c.category_id
        AND (cm.building_id = c.building_id OR cm.building_id IS NULL)
        AND (cm.window = c.window OR cm.window = 'any'::enum_competency_matrix_window)
      ORDER BY
        (cm.building_id IS NULL)::int ASC,
        (cm.window = 'any'::enum_competency_matrix_window)::int ASC,
        (cm.level = 'primary')::int DESC;
    `;

    return this.sequelize.query(sql, {
      type: QueryTypes.SELECT,
      replacements: {
        contractVersionId: version.id,
        categoryId: query.categoryId,
        buildingId: query.buildingId ?? null,
        window: query.window,
      },
    });
  }
}
