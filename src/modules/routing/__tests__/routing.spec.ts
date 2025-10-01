import { RuleValidator } from '../domain/services/RuleValidator';
import { ConditionMatcher } from '../domain/services/ConditionMatcher';

describe('Routing domain - unit', () => {
  it('RuleValidator rejects invalid action', () => {
    const v = new RuleValidator();
    expect(() => v.validateAction({} as any)).toThrow();
    expect(() => v.validateAction({ assign: { type: 'team' } } as any)).toThrow();
    expect(() => v.validateAction({ assign: { type: 'vendor', externalVendorId: '123' } })).toThrow();
  });

  it('ConditionMatcher matches on tagsAnyOf and assetKindIn', () => {
    const m = new ConditionMatcher();
    const cond = { assetKindIn: ['HVAC'], tagsAnyOf: ['urgent'] };
    const ctx = {
      companyId: 'c',
      siteId: 's',
      contractVersionId: 'cv',
      categoryId: 'cat',
      timeWindow: 'business' as const,
      assetKind: 'HVAC',
      tags: ['vip', 'urgent'],
    };
    expect(m.matches(ctx as any, cond)).toBe(true);
    expect(m.matches({ ...ctx, assetKind: 'ELEC' } as any, cond)).toBe(false);
    expect(m.matches({ ...ctx, tags: ['info'] } as any, cond)).toBe(false);
  });
});

