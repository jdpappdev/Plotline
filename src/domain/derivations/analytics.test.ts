import { describe, expect, it } from 'vitest';
import {
  createSeedFocusSessions,
  createSeedProjects,
  createSeedTasks,
  SEED_TEAM,
} from '../types';
import { computeAnalyticsData, computeLargestRemainderPercentages } from './analytics';

describe('analytics derivations', () => {
  const projects = createSeedProjects();
  const tasks = createSeedTasks();
  const team = [...SEED_TEAM];
  const focusSessions = createSeedFocusSessions(tasks, projects);

  it('distributes percentages via largest remainder so they sum to 100%', () => {
    const pcts = computeLargestRemainderPercentages([139680, 99000, 83520, 77040, 45720]);
    expect(pcts).toEqual([32, 22, 19, 17, 10]);
    expect(pcts.reduce((a, b) => a + b, 0)).toBe(100);
  });

  it('computes exact baseline 30D Analytics KPIs, project focus slices (32/22/19/17/10), status composition, and contributors', () => {
    const analytics30D = computeAnalyticsData('30D', projects, tasks, team, focusSessions);
    expect(analytics30D.tasksCompletedCount).toBe(14);
    expect(analytics30D.tasksPrevCount).toBe(1);
    expect(analytics30D.totalFocusHours).toBe(123.6);
    expect(analytics30D.prevFocusHours).toBe(10);
    expect(analytics30D.onTimeRate).toBe(93);
    expect(analytics30D.onTimeCount).toBe(13);
    expect(analytics30D.completedWithDueCount).toBe(14);
    expect(analytics30D.avgCycleDays).toBe(6.1);
    expect(analytics30D.prevAvgCycleDays).toBe(7);

    expect(
      analytics30D.projectFocusSlices.map((s) => ({
        id: s.project.id,
        hours: s.hours,
        pct: s.pct,
      }))
    ).toEqual([
      { id: 'prj-harbor', hours: 38.8, pct: 32 },
      { id: 'prj-atlas', hours: 27.5, pct: 22 },
      { id: 'prj-fernlight', hours: 23.2, pct: 19 },
      { id: 'prj-orchard', hours: 21.4, pct: 17 },
      { id: 'prj-lumen', hours: 12.7, pct: 10 },
    ]);

    expect(
      analytics30D.statusComposition.map((s) => ({
        status: s.status,
        count: s.count,
        pct: s.pct,
      }))
    ).toEqual([
      { status: 'Done', count: 15, pct: 56 },
      { status: 'In Review', count: 3, pct: 11 },
      { status: 'In Progress', count: 4, pct: 15 },
      { status: 'Backlog', count: 5, pct: 18 },
    ]);

    expect(
      analytics30D.contributorRows.map((r) => ({
        id: r.member.id,
        completedCount: r.completedCount,
        focusHours: r.focusHours,
      }))
    ).toEqual([
      { id: 'usr-nadia', completedCount: 4, focusHours: 43.1 },
      { id: 'usr-jade', completedCount: 3, focusHours: 23.7 },
      { id: 'usr-tarek', completedCount: 2, focusHours: 31 },
      { id: 'usr-mireia', completedCount: 2, focusHours: 9.8 },
      { id: 'usr-kaelen', completedCount: 2, focusHours: 5.4 },
      { id: 'usr-juno', completedCount: 1, focusHours: 5 },
      { id: 'usr-soren', completedCount: 0, focusHours: 5.6 },
    ]);
  });
});
