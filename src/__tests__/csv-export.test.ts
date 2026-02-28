import { describe, it, expect } from 'vitest';
import {
  exportSessionsToCSV,
  exportComparisonToCSV,
  exportLeaderboardToCSV,
} from '../lib/csv-export';

function makeSession(overrides: Record<string, any> = {}) {
  return {
    id: 'session-1',
    startTime: '2026-01-01T10:00:00Z',
    endTime: '2026-01-01T11:00:00Z',
    completedModules: ['module-a', 'module-b'],
    totalTests: 20,
    passedTests: 18,
    failedTests: 2,
    duration: 3600000, // 1 hour
    userName: 'Alice',
    teamId: 'team-1',
    ...overrides,
  };
}

describe('exportSessionsToCSV', () => {
  it('returns message for empty input', () => {
    expect(exportSessionsToCSV([])).toBe('No data to export');
    expect(exportSessionsToCSV(null as any)).toBe('No data to export');
  });

  it('generates CSV with headers', () => {
    const csv = exportSessionsToCSV([makeSession()]);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Session ID');
    expect(lines[0]).toContain('Success Rate');
    expect(lines[0]).toContain('Tests Per Minute');
  });

  it('generates correct data row', () => {
    const csv = exportSessionsToCSV([makeSession()]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2); // header + 1 row
    expect(lines[1]).toContain('session-1');
    expect(lines[1]).toContain('Alice');
  });

  it('calculates success rate correctly', () => {
    const csv = exportSessionsToCSV([makeSession({ totalTests: 10, passedTests: 8 })]);
    expect(csv).toContain('80.00');
  });

  it('handles multiple sessions', () => {
    const sessions = [
      makeSession({ id: 's1' }),
      makeSession({ id: 's2', userName: 'Bob' }),
    ];
    const csv = exportSessionsToCSV(sessions);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3); // header + 2 rows
  });

  it('formats duration correctly', () => {
    const csv = exportSessionsToCSV([makeSession({ duration: 3600000 })]);
    expect(csv).toContain('1h 0m 0s');
  });

  it('formats short duration (seconds only)', () => {
    const csv = exportSessionsToCSV([makeSession({ duration: 45000 })]);
    expect(csv).toContain('45s');
  });

  it('handles missing userName', () => {
    const csv = exportSessionsToCSV([makeSession({ userName: undefined })]);
    expect(csv).toContain('Anonymous');
  });

  it('handles missing teamId', () => {
    const csv = exportSessionsToCSV([makeSession({ teamId: undefined })]);
    expect(csv).toContain('N/A');
  });

  it('escapes values with commas', () => {
    const csv = exportSessionsToCSV([makeSession({
      completedModules: ['module-a, part-1', 'module-b'],
    })]);
    expect(csv).toContain('"module-a, part-1; module-b"');
  });
});

describe('exportComparisonToCSV', () => {
  function makeComparison() {
    return {
      session1: makeSession({ id: 's1' }),
      session2: makeSession({ id: 's2', duration: 2400000, passedTests: 20 }),
      durationChange: -1200000,
      durationChangePercent: -33.33,
      completionChange: 0,
      accuracyChange: 10,
      testsRunChange: 0,
      improvementScore: 75,
    };
  }

  it('returns message for empty input', () => {
    expect(exportComparisonToCSV([])).toBe('No comparison data to export');
  });

  it('generates CSV with comparison headers', () => {
    const csv = exportComparisonToCSV([makeComparison()]);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Duration Change');
    expect(lines[0]).toContain('Improvement Score');
  });

  it('includes comparison data', () => {
    const csv = exportComparisonToCSV([makeComparison()]);
    expect(csv).toContain('75'); // improvement score
    expect(csv).toContain('-33.33'); // duration change pct
  });
});

describe('exportLeaderboardToCSV', () => {
  function makeEntry() {
    return {
      userName: 'Alice',
      teamId: 'team-1',
      rank: 1,
      fastestCompletion: 1200000,
      totalModulesCompleted: 10,
      totalTestsRun: 100,
      totalTestsPassed: 95,
      averageCompletionTime: 1500000,
      successRate: 95.0,
      sessions: 5,
      badges: ['gold', 'speed-demon'],
    };
  }

  it('returns message for empty input', () => {
    expect(exportLeaderboardToCSV([])).toBe('No leaderboard data to export');
  });

  it('generates CSV with leaderboard headers', () => {
    const csv = exportLeaderboardToCSV([makeEntry()]);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Rank');
    expect(lines[0]).toContain('Success Rate');
    expect(lines[0]).toContain('Badges');
  });

  it('includes entry data', () => {
    const csv = exportLeaderboardToCSV([makeEntry()]);
    expect(csv).toContain('Alice');
    expect(csv).toContain('95.00');
  });

  it('joins badges with semicolons', () => {
    const csv = exportLeaderboardToCSV([makeEntry()]);
    expect(csv).toContain('gold; speed-demon');
  });
});
