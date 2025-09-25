import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Ticket } from '../tickets/models/ticket.model';
import { SatisfactionSurvey } from '../satisfaction/models/satisfaction-survey.model';
import { CreateRseReportDto } from './dto/create-rse-report.dto';

@Injectable()
export class RseReportsService {
  constructor(
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
    @InjectModel(SatisfactionSurvey)
    private readonly surveyModel: typeof SatisfactionSurvey,
  ) {}

  async generate(dto: CreateRseReportDto) {
    const { companyId, from, to } = dto;
    const where: any = { companyId };
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as any)[Op.gte] = new Date(from);
      if (to) (where.createdAt as any)[Op.lte] = new Date(to);
    }

    const totalTickets = await this.ticketModel.count({ where });
    const closedTickets = await this.ticketModel.count({
      where: { ...where, status: 'closed' } as any,
    });

    const surveys = await this.surveyModel.findAll({
      include: [],
      where: {},
    });
    const ratings = surveys.map((s) => Number(s.get('rating'))).filter((n) => !Number.isNaN(n));
    const avgSatisfaction = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null;

    return {
      companyId,
      window: { from: from ?? null, to: to ?? null },
      totals: { tickets: totalTickets, closed: closedTickets },
      kpis: {
        closureRate: totalTickets ? closedTickets / totalTickets : null,
        avgSatisfaction,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  getForCompany(companyId: string) {
    return this.generate({ companyId });
  }
}
