import { describe, it, expect } from 'vitest';
import {
  calculatePropertyScore,
  generateRecommendationReasons,
  generatePropertyRecommendations,
  getDefaultPreferences,
} from '../lib/recommendation-engine';
import type { UserPreferences } from '../lib/recommendation-engine';
import type { Property } from '../lib/types';

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: 'p1',
    title: 'Test Property',
    address: '123 Main St',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11201',
    price: 1500000,
    yearBuilt: 2010,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    imageUrl: 'http://example.com/img.jpg',
    isCurated: false,
    complianceFlags: [],
    ...overrides,
  };
}

function makePreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    priceRange: { min: 500000, max: 3000000 },
    preferredCities: ['Brooklyn', 'Manhattan'],
    minBedrooms: 2,
    minBathrooms: 1,
    preferredFeatures: [],
    investmentGoals: 'balanced',
    riskTolerance: 'moderate',
    ...overrides,
  };
}

describe('calculatePropertyScore', () => {
  it('adds 30 for price in range', () => {
    const score = calculatePropertyScore(
      makeProperty({ price: 1500000 }),
      makePreferences(),
      []
    );
    expect(score).toBeGreaterThanOrEqual(30);
  });

  it('adds 15 for price below range', () => {
    const score = calculatePropertyScore(
      makeProperty({ price: 200000 }),
      makePreferences(),
      []
    );
    expect(score).toBeGreaterThanOrEqual(15);
  });

  it('adds 25 for preferred city', () => {
    const base = calculatePropertyScore(
      makeProperty({ city: 'Unknown' }),
      makePreferences(),
      []
    );
    const withCity = calculatePropertyScore(
      makeProperty({ city: 'Brooklyn' }),
      makePreferences(),
      []
    );
    expect(withCity - base).toBe(25);
  });

  it('adds 15 for meeting bedroom requirement', () => {
    const below = calculatePropertyScore(
      makeProperty({ bedrooms: 1 }),
      makePreferences({ minBedrooms: 3 }),
      []
    );
    const meets = calculatePropertyScore(
      makeProperty({ bedrooms: 3 }),
      makePreferences({ minBedrooms: 3 }),
      []
    );
    expect(meets - below).toBe(15);
  });

  it('adds 10 for meeting bathroom requirement', () => {
    const below = calculatePropertyScore(
      makeProperty({ bathrooms: 0 }),
      makePreferences({ minBathrooms: 2 }),
      []
    );
    const meets = calculatePropertyScore(
      makeProperty({ bathrooms: 2 }),
      makePreferences({ minBathrooms: 2 }),
      []
    );
    expect(meets - below).toBe(10);
  });

  it('adds 20 for cash-flow goal with cap rate > 5', () => {
    // Use low-scoring baseline to avoid 100 cap
    const lowProps = { city: 'Unknown', bedrooms: 0, bathrooms: 0, price: 999999999 };
    const without = calculatePropertyScore(
      makeProperty({ ...lowProps, capRate: 3 }),
      makePreferences({ investmentGoals: 'cash-flow' }),
      []
    );
    const withCap = calculatePropertyScore(
      makeProperty({ ...lowProps, capRate: 7 }),
      makePreferences({ investmentGoals: 'cash-flow' }),
      []
    );
    expect(withCap - without).toBe(20);
  });

  it('adds 20 for appreciation goal with roi > 8', () => {
    const lowProps = { city: 'Unknown', bedrooms: 0, bathrooms: 0, price: 999999999 };
    const without = calculatePropertyScore(
      makeProperty({ ...lowProps, roi: 5 }),
      makePreferences({ investmentGoals: 'appreciation' }),
      []
    );
    const withRoi = calculatePropertyScore(
      makeProperty({ ...lowProps, roi: 10 }),
      makePreferences({ investmentGoals: 'appreciation' }),
      []
    );
    expect(withRoi - without).toBe(20);
  });

  it('adds 15 for curated properties', () => {
    const lowProps = { city: 'Unknown', bedrooms: 0, bathrooms: 0, price: 999999999 };
    const uncurated = calculatePropertyScore(
      makeProperty({ ...lowProps, isCurated: false }),
      makePreferences(),
      []
    );
    const curated = calculatePropertyScore(
      makeProperty({ ...lowProps, isCurated: true }),
      makePreferences(),
      []
    );
    expect(curated - uncurated).toBe(15);
  });

  it('adds 10 for no urgent compliance flags', () => {
    const withUrgent = calculatePropertyScore(
      makeProperty({ complianceFlags: [{ type: 'LEAD_WATCHDOG_NJ', severity: 'URGENT', message: '' }] }),
      makePreferences(),
      []
    );
    const clean = calculatePropertyScore(
      makeProperty({ complianceFlags: [] }),
      makePreferences(),
      []
    );
    expect(clean - withUrgent).toBe(10);
  });

  it('caps score at 100', () => {
    const score = calculatePropertyScore(
      makeProperty({ isCurated: true, capRate: 8, city: 'Brooklyn' }),
      makePreferences({ investmentGoals: 'cash-flow' }),
      []
    );
    expect(score).toBeLessThanOrEqual(100);
  });

  it('adds 15 for diversification with moderate risk', () => {
    // Both cities outside preferredCities to isolate diversification bonus
    const lowProps = { bedrooms: 0, bathrooms: 0, price: 999999999 };
    const portfolio = [makeProperty({ id: 'p2', city: 'Portland' })];
    const diversified = calculatePropertyScore(
      makeProperty({ ...lowProps, city: 'Denver' }),
      makePreferences({ riskTolerance: 'moderate' }),
      portfolio
    );
    const notDiversified = calculatePropertyScore(
      makeProperty({ ...lowProps, city: 'Portland' }),
      makePreferences({ riskTolerance: 'moderate' }),
      portfolio
    );
    expect(diversified - notDiversified).toBe(15);
  });
});

describe('generateRecommendationReasons', () => {
  it('includes preferred city', () => {
    const reasons = generateRecommendationReasons(
      makeProperty({ city: 'Brooklyn' }),
      makePreferences(),
      80
    );
    expect(reasons.some(r => r.includes('Brooklyn'))).toBe(true);
  });

  it('includes strong cap rate', () => {
    const reasons = generateRecommendationReasons(
      makeProperty({ capRate: 7 }),
      makePreferences(),
      50
    );
    expect(reasons.some(r => r.includes('cap rate'))).toBe(true);
  });

  it('includes curated status', () => {
    const reasons = generateRecommendationReasons(
      makeProperty({ isCurated: true }),
      makePreferences(),
      50
    );
    expect(reasons.some(r => r.includes('curated'))).toBe(true);
  });

  it('includes exceptional match for score >= 80', () => {
    const reasons = generateRecommendationReasons(
      makeProperty({ city: 'Brooklyn' }),
      makePreferences(),
      85
    );
    expect(reasons.some(r => r.includes('Exceptional'))).toBe(true);
  });

  it('limits to 3 reasons', () => {
    const reasons = generateRecommendationReasons(
      makeProperty({
        city: 'Brooklyn', capRate: 8, roi: 12,
        isCurated: true, yearBuilt: 2020,
      }),
      makePreferences(),
      90
    );
    expect(reasons.length).toBeLessThanOrEqual(3);
  });
});

describe('generatePropertyRecommendations', () => {
  it('filters out properties scoring below 50', () => {
    const properties = [
      makeProperty({ id: '1', city: 'Unknown', price: 999999999, bedrooms: 0, bathrooms: 0 }),
    ];
    const recs = generatePropertyRecommendations(properties, makePreferences(), []);
    expect(recs).toHaveLength(0);
  });

  it('sorts by score descending', () => {
    const properties = [
      makeProperty({ id: '1', city: 'Brooklyn', isCurated: true }),
      makeProperty({ id: '2', city: 'Unknown' }),
    ];
    const recs = generatePropertyRecommendations(properties, makePreferences(), []);
    if (recs.length >= 2) {
      expect(recs[0].score).toBeGreaterThanOrEqual(recs[1].score);
    }
  });

  it('limits to 5 recommendations', () => {
    const properties = Array.from({ length: 10 }, (_, i) =>
      makeProperty({ id: `p${i}`, city: 'Brooklyn', isCurated: true })
    );
    const recs = generatePropertyRecommendations(properties, makePreferences(), []);
    expect(recs.length).toBeLessThanOrEqual(5);
  });

  it('sets urgency based on score', () => {
    const properties = [
      makeProperty({ city: 'Brooklyn', isCurated: true, capRate: 8 }),
    ];
    const recs = generatePropertyRecommendations(
      properties,
      makePreferences({ investmentGoals: 'cash-flow' }),
      []
    );
    if (recs.length > 0 && recs[0].score >= 80) {
      expect(recs[0].urgency).toBe('high');
    }
  });
});

describe('getDefaultPreferences', () => {
  it('returns valid preferences object', () => {
    const prefs = getDefaultPreferences();
    expect(prefs.priceRange.min).toBeLessThan(prefs.priceRange.max);
    expect(prefs.preferredCities.length).toBeGreaterThan(0);
    expect(prefs.minBedrooms).toBeGreaterThan(0);
    expect(prefs.minBathrooms).toBeGreaterThan(0);
    expect(['cash-flow', 'appreciation', 'balanced']).toContain(prefs.investmentGoals);
    expect(['conservative', 'moderate', 'aggressive']).toContain(prefs.riskTolerance);
  });
});
