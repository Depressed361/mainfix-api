import type { RoutingRule } from '../../domain/entities/RoutingRule';

export const sampleRules: RoutingRule[] = [
  {
    id: 'r-1',
    contractVersionId: 'cv-1',
    priority: 10,
    condition: { timeWindow: 'business' },
    action: { assign: { type: 'vendor', externalVendorId: 'vendor-1' } },
  },
];
