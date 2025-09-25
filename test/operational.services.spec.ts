import { RseReportsService } from '../src/modules/reports/rse-reports.service';
import { TicketCostsService } from '../src/modules/cost/services/ticket-costs.service';
import { ApprovalRequestsService } from '../src/modules/approvals/services/approval-requests.service';
import { SurveysService } from '../src/modules/satisfaction/services/surveys.service';
import { ComfortIndicatorsService } from '../src/modules/comfort/services/comfort-indicators.service';
import { WellBeingService } from '../src/modules/well-being/services/well-being.service';

describe('Operational services', () => {
  const createBasicStore = () => {
    let counter = 0;
    const records: any[] = [];
    return {
      records,
      create: jest.fn(async (data: Record<string, any>) => {
        const record: any = {
          id: data.id ?? `id-${++counter}`,
          created_at: data.created_at ?? new Date(counter),
          createdAt: data.createdAt ?? data.created_at ?? new Date(counter),
          ...data,
          get: (key: string) => record[key],
          destroy: async () => {
            const index = records.indexOf(record);
            if (index >= 0) records.splice(index, 1);
          },
        };
        records.push(record);
        return record;
      }),
      findAll: jest.fn(async (options?: { where?: Record<string, any>; order?: [string, string][] }) => {
        const where = options?.where ?? {};
        let results = records.filter((record) =>
          Object.entries(where).every(([key, value]) => record[key] === value),
        );
        if (options?.order?.length) {
          const [field, direction] = options.order[0];
          results = [...results].sort((a, b) => {
            const av = a[field] ?? a.get?.(field);
            const bv = b[field] ?? b.get?.(field);
            return direction === 'DESC' ? (bv > av ? 1 : -1) : av > bv ? 1 : -1;
          });
        }
        return results;
      }),
      findByPk: jest.fn(async (id: string) => records.find((record) => record.id === id) ?? null),
      count: jest.fn(async (options?: { where?: Record<string, any> }) => {
        const where = options?.where ?? {};
        return records.filter((record) =>
          Object.entries(where).every(([key, value]) => record[key] === value),
        ).length;
      }),
    };
  };

  describe('TicketCostsService', () => {
    let store: ReturnType<typeof createBasicStore>;
    let service: TicketCostsService;

    beforeEach(() => {
      store = createBasicStore();
      service = new TicketCostsService(store as any);
    });

    it('creates and lists ticket costs', async () => {
      const ticketId = 'ticket-1';
      await service.create(ticketId, { laborHours: 2, laborRate: 50, currency: 'EUR' } as any);
      const costs = await service.findAll(ticketId);
      expect(costs).toHaveLength(1);
      expect(costs[0]!.get('laborHours')).toBe(2);
    });

    it('removes a ticket cost', async () => {
      const ticketId = 'ticket-2';
      const cost = await service.create(ticketId, { total: 100, currency: 'EUR' } as any);
      const response = await service.remove(cost.get('id') as string);
      expect(response).toEqual({ deleted: true });
      await expect(service.remove(cost.get('id') as string)).rejects.toThrow('Ticket cost not found');
    });
  });

  describe('ApprovalRequestsService', () => {
    let store: ReturnType<typeof createBasicStore>;
    let service: ApprovalRequestsService;

    beforeEach(() => {
      store = createBasicStore();
      service = new ApprovalRequestsService(store as any);
    });

    it('creates and lists approvals', async () => {
      const ticketId = 'ticket-3';
      await service.create(ticketId, { amountEstimate: 200, currency: 'EUR', reason: 'Repair' } as any);
      const approvals = await service.findAll(ticketId);
      expect(approvals).toHaveLength(1);
      expect(approvals[0]!.get('amountEstimate')).toBe(200);
    });

    it('removes an approval request', async () => {
      const req = await service.create('ticket-4', { amountEstimate: 120, currency: 'EUR' } as any);
      const response = await service.remove(req.get('id') as string);
      expect(response).toEqual({ deleted: true });
      await expect(service.remove(req.get('id') as string)).rejects.toThrow('Approval request not found');
    });
  });

  describe('SurveysService', () => {
    let store: ReturnType<typeof createBasicStore>;
    let service: SurveysService;

    beforeEach(() => {
      store = createBasicStore();
      service = new SurveysService(store as any);
    });

    it('creates and lists surveys', async () => {
      const ticketId = 'ticket-5';
      await service.create(ticketId, { respondentUserId: 'user-1', rating: 8, comment: 'Great' } as any);
      const surveys = await service.findAll(ticketId);
      expect(surveys).toHaveLength(1);
      expect(surveys[0]!.get('rating')).toBe(8);
    });
  });

  describe('ComfortIndicatorsService', () => {
    let store: ReturnType<typeof createBasicStore>;
    let service: ComfortIndicatorsService;

    beforeEach(() => {
      store = createBasicStore();
      service = new ComfortIndicatorsService(store as any);
    });

    it('creates and filters comfort indicators', async () => {
      await service.create({
        locationId: 'loc-1',
        type: 'temperature',
        value: 22,
        unit: 'degC',
        measuredAt: new Date().toISOString(),
        source: 'manual',
      } as any);
      await service.create({
        locationId: 'loc-2',
        type: 'noise',
        value: 40,
        unit: 'dB',
        measuredAt: new Date().toISOString(),
        source: 'iot',
      } as any);

      const filtered = await service.findAll('loc-2');
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.get('type')).toBe('noise');
    });
  });

  describe('RseReportsService', () => {
    let ticketStore: ReturnType<typeof createBasicStore>;
    let surveyStore: ReturnType<typeof createBasicStore>;
    let service: RseReportsService;

    beforeEach(() => {
      ticketStore = createBasicStore();
      surveyStore = createBasicStore();
      service = new RseReportsService(ticketStore as any, surveyStore as any);
    });

    it('aggregates ticket stats and survey scores', async () => {
      await ticketStore.create({
        companyId: 'company-1',
        status: 'closed',
        createdAt: new Date('2024-01-01'),
      });
      await ticketStore.create({
        companyId: 'company-1',
        status: 'in_progress',
        createdAt: new Date('2024-01-05'),
      });

      await surveyStore.create({ rating: 7 });
      await surveyStore.create({ rating: 9 });

      const report = await service.generate({ companyId: 'company-1' });
      expect(report.totals.tickets).toBe(2);
      expect(report.totals.closeded).toBe(1);
      expect(report.kpis.avgSatisfaction).toBeclosedeTo(8);
    });
  });

  describe('WellBeingService', () => {
    let store: ReturnType<typeof createBasicStore>;
    let service: WellBeingService;

    beforeEach(() => {
      store = createBasicStore();
      service = new WellBeingService(store as any);
    });

    it('lists well-being scores filtered by site', async () => {
      await store.create({
        siteId: 'site-1',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        averageRating: '7.5',
      });
      await store.create({
        siteId: 'site-2',
        periodStart: new Date('2024-02-01'),
        periodEnd: new Date('2024-02-28'),
        averageRating: '6.0',
      });

      const list = await service.findAll('site-1');
      expect(list).toHaveLength(1);
      expect(list[0]!.get('averageRating')).toBe('7.5');
    });
  });
});
