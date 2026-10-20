import { afterEach, describe, expect, it } from 'vitest';
import { setClockOverride } from '../../lib/clock';
import {
  computeAnalyticsData,
  computeProjectStatusCounts,
  computeWeeklyOutputData,
  getDoneTasksGrouped,
  getMemberWorkload,
  groupTasksByStatus,
  SECONDS_PER_HOUR,
} from './index';
import {
  createSeedEvents,
  createSeedFocusSessions,
  createSeedProjects,
  createSeedTasks,
  SEED_TEAM,
  validateWorkspace,
} from '../seed';

function assertEqual<T>(label: string, actual: T, expected: T): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(
      `[Baseline Mismatch] ${label}\n  Actual:   ${actualJson}\n  Expected: ${expectedJson}`
    );
  }
  expect(actual).toEqual(expected);
}

describe('baseline dataset verification at fixed clock 2026-10-18T12:00 (Sunday)', () => {
  afterEach(() => {
    setClockOverride(null);
  });

  it('asserts exact baseline metrics at 2026-10-18T12:00', () => {
    setClockOverride(new Date(2026, 9, 18, 12, 0, 0));

    const projects = createSeedProjects();
    const tasks = createSeedTasks();
    const team = [...SEED_TEAM];
    const events = createSeedEvents(projects);
    const focusSessions = createSeedFocusSessions(tasks, projects);

    const statusCounts = computeProjectStatusCounts(projects, tasks);
    assertEqual('Total projects', statusCounts.totalCount, 6);
    assertEqual('Ended projects', statusCounts.endedCount, 1);
    assertEqual('Running projects', statusCounts.runningCount, 4);
    assertEqual('Pending projects', statusCounts.pendingCount, 1);

    const openTasksCount = tasks.filter((t) => t.status !== 'Done').length;
    assertEqual('Open tasks count', openTasksCount, 12);

    const grouped = groupTasksByStatus(tasks);
    assertEqual('Board Backlog count', grouped.Backlog.length, 5);
    assertEqual('Board In Progress count', grouped['In Progress'].length, 4);
    assertEqual('Board In Review count', grouped['In Review'].length, 3);

    const doneGroups = getDoneTasksGrouped(tasks);
    assertEqual('Done shown (recent)', doneGroups.recentDone.length, 7);
    assertEqual('Done earlier', doneGroups.earlierDone.length, 8);

    const workloadsByFirstName: Record<string, number> = {};
    for (const member of team) {
      const firstName = member.name.split(' ')[0];
      workloadsByFirstName[firstName] = getMemberWorkload(member.id, tasks);
    }
    assertEqual('Workloads', workloadsByFirstName, {
      Soren: 17,
      Mireia: 20,
      Tarek: 77,
      Kaelen: 10,
      Nadia: 37,
      Juno: 25,
      Jade: 33,
    });

    assertEqual(
      'Project names',
      projects.map((p) => p.name),
      [
        'Harbor Mobile Banking Redesign',
        'Fernlight Wellness App',
        'Orchard Logistics Dashboard',
        'Atlas Travel Booking Flow',
        'Lumen Museum Website',
        'Northwind Brand Refresh',
      ]
    );

    assertEqual(
      'People names',
      team.map((m) => m.name),
      [
        'Soren Lindqvist',
        'Mireia Vance',
        'Tarek Al-Mansoor',
        'Kaelen Okafor',
        'Nadia Kovalenko',
        'Juno Takahashi',
        'Jade Polo',
      ]
    );

    const analytics30D = computeAnalyticsData('30D', projects, tasks, team, focusSessions);
    assertEqual('30D analytics tasksCompletedCount', analytics30D.tasksCompletedCount, 14);
    assertEqual('30D analytics totalFocusHours', analytics30D.totalFocusHours, 123.6);
    assertEqual('30D analytics onTimeRate', analytics30D.onTimeRate, 93);
    assertEqual('30D analytics avgCycleDays', analytics30D.avgCycleDays, 6.1);

    assertEqual(
      '30D project focus slice hours',
      analytics30D.projectFocusSlices.map((s) => s.hours),
      [38.8, 27.5, 23.2, 21.4, 12.7]
    );

    const weekly = computeWeeklyOutputData(focusSessions, 'monday');
    const weeklyHours = Number((weekly.totalWeekSeconds / SECONDS_PER_HOUR).toFixed(1));
    assertEqual('Weekly output hours', weeklyHours, 31.8);

    const validationReport = validateWorkspace(projects, tasks, team, events, focusSessions);
    const failedChecks = validationReport.checks.filter((c) => !c.passed);
    assertEqual('Data check failed list', failedChecks, []);
    assertEqual('Data check passing', validationReport.passed, true);
  });

  it('passes validateWorkspace() on reseed for each day Mon–Sun and across a month boundary', () => {
    const testDates: Array<{ label: string; date: Date }> = [
      { label: 'Mon 2026-10-12', date: new Date(2026, 9, 12, 12, 0, 0) },
      { label: 'Tue 2026-10-13', date: new Date(2026, 9, 13, 12, 0, 0) },
      { label: 'Wed 2026-10-14', date: new Date(2026, 9, 14, 12, 0, 0) },
      { label: 'Thu 2026-10-15', date: new Date(2026, 9, 15, 12, 0, 0) },
      { label: 'Fri 2026-10-16', date: new Date(2026, 9, 16, 12, 0, 0) },
      { label: 'Sat 2026-10-17', date: new Date(2026, 9, 17, 12, 0, 0) },
      { label: 'Sun 2026-10-18', date: new Date(2026, 9, 18, 12, 0, 0) },
      { label: 'Month end Sat 2026-10-31', date: new Date(2026, 9, 31, 12, 0, 0) },
      { label: 'Month start Sun 2026-11-01', date: new Date(2026, 10, 1, 12, 0, 0) },
      { label: 'Month start Mon 2026-11-02', date: new Date(2026, 10, 2, 12, 0, 0) },
    ];

    const failures: Array<{ day: string; checkId: string; details: string }> = [];

    for (const item of testDates) {
      setClockOverride(item.date);
      const projects = createSeedProjects();
      const tasks = createSeedTasks();
      const team = [...SEED_TEAM];
      const events = createSeedEvents(projects);
      const focusSessions = createSeedFocusSessions(tasks, projects);
      const report = validateWorkspace(projects, tasks, team, events, focusSessions);

      for (const chk of report.checks) {
        if (!chk.passed) {
          failures.push({
            day: item.label,
            checkId: chk.id,
            details: chk.details,
          });
        }
      }
    }

    assertEqual('Mon–Sun and month boundary validation failures', failures, []);
  });
});
