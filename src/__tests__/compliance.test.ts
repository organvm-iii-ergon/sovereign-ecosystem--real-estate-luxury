import { describe, it, expect } from 'vitest';
import {
  calculateGoodCauseNY,
  calculateLeadWatchdogNJ,
  checkLeaseExpiration,
  analyzeProperty,
  getWatchlistProperties,
  getRiskMapProperties,
} from '../lib/compliance';
import type { Property } from '../lib/types';

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: 'p1',
    title: 'Test Property',
    address: '123 Main St',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11201',
    price: 1000000,
    yearBuilt: 2000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    imageUrl: 'http://example.com/img.jpg',
    isCurated: false,
    complianceFlags: [],
    ...overrides,
  };
}

describe('calculateGoodCauseNY', () => {
  it('returns null for non-NY properties', () => {
    expect(calculateGoodCauseNY(makeProperty({ state: 'NJ' }))).toBeNull();
  });

  it('returns INFO (exempt) when rent > 2.45x fair market rent', () => {
    const result = calculateGoodCauseNY(makeProperty({
      currentRent: 5000,
      fairMarketRent: 1500, // threshold = 3675
    }));
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('INFO');
    expect(result!.type).toBe('GOOD_CAUSE_NY');
    expect(result!.message).toContain('EXEMPT');
  });

  it('returns WARNING when rent <= 2.45x fair market rent', () => {
    const result = calculateGoodCauseNY(makeProperty({
      currentRent: 1000,
      fairMarketRent: 2000, // threshold = 4900, 1000 < 4900
    }));
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('WARNING');
    expect(result!.calculatedValue).toBe(1100); // 1000 * 1.10
  });

  it('returns INFO (exempt) when fair market rent is 0', () => {
    // threshold = 0 * 2.45 = 0, any positive rent > 0 → exempt
    const result = calculateGoodCauseNY(makeProperty({ currentRent: 2000 }));
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('INFO');
    expect(result!.message).toContain('EXEMPT');
  });
});

describe('calculateLeadWatchdogNJ', () => {
  it('returns null for non-NJ properties', () => {
    expect(calculateLeadWatchdogNJ(makeProperty({ state: 'NY' }))).toBeNull();
  });

  it('returns null for post-1978 buildings', () => {
    expect(calculateLeadWatchdogNJ(makeProperty({ state: 'NJ', yearBuilt: 1980 }))).toBeNull();
  });

  it('returns URGENT when no inspection on record', () => {
    const result = calculateLeadWatchdogNJ(makeProperty({
      state: 'NJ', yearBuilt: 1960,
    }));
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('URGENT');
    expect(result!.message).toContain('NO lead inspection');
  });

  it('returns URGENT when inspection overdue (>3 years)', () => {
    const fourYearsAgo = new Date();
    fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
    const result = calculateLeadWatchdogNJ(makeProperty({
      state: 'NJ', yearBuilt: 1960,
      lastInspectionDate: fourYearsAgo.toISOString(),
    }));
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('URGENT');
    expect(result!.message).toContain('overdue');
  });

  it('returns INFO when inspection is current', () => {
    const recentDate = new Date();
    recentDate.setFullYear(recentDate.getFullYear() - 1);
    const result = calculateLeadWatchdogNJ(makeProperty({
      state: 'NJ', yearBuilt: 1960,
      lastInspectionDate: recentDate.toISOString(),
    }));
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('INFO');
    expect(result!.message).toContain('current');
  });
});

describe('checkLeaseExpiration', () => {
  it('returns null when no lease end date', () => {
    expect(checkLeaseExpiration(makeProperty())).toBeNull();
  });

  it('returns URGENT when lease already expired', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const result = checkLeaseExpiration(makeProperty({
      leaseEndDate: pastDate.toISOString(),
    }));
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('URGENT');
    expect(result!.message).toContain('EXPIRED');
  });

  it('returns URGENT when lease expires within 30 days', () => {
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 15);
    const result = checkLeaseExpiration(makeProperty({
      leaseEndDate: soonDate.toISOString(),
    }));
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('URGENT');
  });

  it('returns WARNING when lease expires within 31-90 days', () => {
    const mediumDate = new Date();
    mediumDate.setDate(mediumDate.getDate() + 60);
    const result = checkLeaseExpiration(makeProperty({
      leaseEndDate: mediumDate.toISOString(),
    }));
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('WARNING');
    expect(result!.message).toContain('expires in');
  });

  it('returns null when lease expires in > 90 days', () => {
    const farDate = new Date();
    farDate.setDate(farDate.getDate() + 200);
    expect(checkLeaseExpiration(makeProperty({
      leaseEndDate: farDate.toISOString(),
    }))).toBeNull();
  });
});

describe('analyzeProperty', () => {
  it('adds good cause flag for NY property', () => {
    const result = analyzeProperty(makeProperty({
      state: 'NY', currentRent: 3000, fairMarketRent: 1500,
    }));
    expect(result.complianceFlags.some(f => f.type === 'GOOD_CAUSE_NY')).toBe(true);
  });

  it('adds lead flag for pre-1978 NJ property', () => {
    const result = analyzeProperty(makeProperty({
      state: 'NJ', yearBuilt: 1960,
    }));
    expect(result.complianceFlags.some(f => f.type === 'LEAD_WATCHDOG_NJ')).toBe(true);
    expect(result.hasLeadRisk).toBe(true);
  });

  it('adds lease expiration flag', () => {
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 30);
    const result = analyzeProperty(makeProperty({
      leaseEndDate: soonDate.toISOString(),
    }));
    expect(result.complianceFlags.some(f => f.type === 'LEASE_EXPIRING')).toBe(true);
  });

  it('returns clean property for compliant modern building', () => {
    const farDate = new Date();
    farDate.setDate(farDate.getDate() + 200);
    const result = analyzeProperty(makeProperty({
      state: 'CA', yearBuilt: 2010,
      leaseEndDate: farDate.toISOString(),
    }));
    expect(result.complianceFlags).toHaveLength(0);
  });
});

describe('getWatchlistProperties', () => {
  it('returns properties expiring within 90 days', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 45);
    const far = new Date();
    far.setDate(far.getDate() + 200);

    const properties = [
      makeProperty({ id: '1', leaseEndDate: soon.toISOString() }),
      makeProperty({ id: '2', leaseEndDate: far.toISOString() }),
      makeProperty({ id: '3' }), // no lease
    ];

    const watchlist = getWatchlistProperties(properties);
    expect(watchlist).toHaveLength(1);
    expect(watchlist[0].id).toBe('1');
  });

  it('excludes already-expired leases', () => {
    const past = new Date();
    past.setDate(past.getDate() - 10);
    const properties = [makeProperty({ leaseEndDate: past.toISOString() })];
    expect(getWatchlistProperties(properties)).toHaveLength(0);
  });
});

describe('getRiskMapProperties', () => {
  it('returns properties with URGENT or WARNING flags', () => {
    const properties = [
      makeProperty({ id: '1', complianceFlags: [{ type: 'LEAD_WATCHDOG_NJ', severity: 'URGENT', message: 'test' }] }),
      makeProperty({ id: '2', complianceFlags: [{ type: 'GOOD_CAUSE_NY', severity: 'WARNING', message: 'test' }] }),
      makeProperty({ id: '3', complianceFlags: [{ type: 'GOOD_CAUSE_NY', severity: 'INFO', message: 'test' }] }),
      makeProperty({ id: '4', complianceFlags: [] }),
    ];

    const risky = getRiskMapProperties(properties);
    expect(risky).toHaveLength(2);
    expect(risky.map(p => p.id).sort()).toEqual(['1', '2']);
  });
});
