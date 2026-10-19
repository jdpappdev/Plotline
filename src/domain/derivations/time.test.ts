import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSeedFocusSessions, createSeedProjects, createSeedTasks } from '../../domain/seed';
import { setClockOverride } from '../../lib/clock';
import {
  computeDaysAgoFromIso,
  computeDaysBetweenIso,
  computeWeeklyOutputData,
  formatDuration,
  formatLoggedDuration,
} from './time';

describe('time derivations', () => {
  const projects = createSeedProjects();
  const tasks = createSeedTasks();
  const focusSessions = createSeedFocusSessions(tasks, projects);

  beforeEach(() => {
    setClockOverride(new Date(2026, 9, 18, 12, 0, 0));
  });

  afterEach(() => {
    setClockOverride(null);
  });

  it('computes exact baseline Weekly Output for Dashboard', () => {
    const weekly = computeWeeklyOutputData(focusSessions, 'monday');
    expect(weekly.totalWeekSeconds).toBe(114480);
    expect(weekly.totalSessionsCount).toBe(15);
    expect(weekly.columns.length).toBe(7);
  });

  it('computes days ago, days between, and formats durations', () => {
    expect(computeDaysAgoFromIso('2026-10-18')).toBe(0);
    expect(computeDaysAgoFromIso('2026-10-11')).toBe(7);
    expect(computeDaysAgoFromIso('')).toBe(9999);

    expect(computeDaysBetweenIso('2026-10-10', '2026-10-15')).toBe(5);
    expect(computeDaysBetweenIso('2026-10-15', '2026-10-10')).toBe(0);

    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(45)).toBe('<1m');
    expect(formatDuration(1800)).toBe('30m');
    expect(formatDuration(3600)).toBe('1.0h');
    expect(formatDuration(5400)).toBe('1.5h');
    expect(formatLoggedDuration(7200)).toBe('2.0h');
  });
});
