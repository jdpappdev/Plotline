import { describe, expect, it } from 'vitest';
import {
  computeAnalyticsData,
  computeEventsByDateMap,
  computeProjectStatusCounts,
  computeTaskFilterCounts,
  computeTeamMetrics,
  computeWeeklyOutputData,
  filterAndSortProjects,
  filterCalendarEvents,
  filterTasksForBoard,
  filterTeamMembers,
  getDoneTasksGrouped,
  getMemberAssignedTasks,
  getMemberTaskCounts,
  getMemberWorkload,
  getNextUpEvent,
  getProjectHealth,
  getProjectProgress,
  getProjectStatus,
  getProjectTaskSummary,
  getRingsProjects,
  getTaskCycleDays,
  groupTasksByStatus,
  isTaskCompletedInRange,
  isTaskCompletedOnTime,
  progressForTaskStatus,
} from './derivations';
import { createSeedEvents } from './seed/eventsSeed';
import { createSeedProjects } from './seed/projectsSeed';
import { createSeedFocusSessions } from './seed/sessionsSeed';
import { createSeedTasks } from './seed/tasksSeed';
import { SEED_TEAM } from './seed/teamSeed';

describe('domain derivations', () => {
  const projects = createSeedProjects();
  const tasks = createSeedTasks();
  const team = [...SEED_TEAM];
  const events = createSeedEvents(projects);
  const focusSessions = createSeedFocusSessions(tasks, projects);

  it('computes exact baseline project status counts and percentages for Dashboard', () => {
    const counts = computeProjectStatusCounts(projects, tasks);
    expect(counts).toEqual({
      totalCount: 6,
      endedCount: 1,
      runningCount: 4,
      pendingCount: 1,
      endedPct: 17,
      runningPct: 67,
      pendingPct: 17,
    });
  });

  it('computes exact baseline getProjectStatus and getProjectProgress for every seed project', () => {
    const summary = projects.map((p) => ({
      id: p.id,
      status: getProjectStatus(p, tasks),
      progress: getProjectProgress(p, tasks),
      health: getProjectHealth(p, tasks),
    }));

    expect(summary).toEqual([
      { id: 'prj-harbor', status: 'Running', progress: 57, health: 'On track' },
      { id: 'prj-fernlight', status: 'Running', progress: 40, health: 'At risk' },
      { id: 'prj-orchard', status: 'Running', progress: 40, health: 'On track' },
      { id: 'prj-atlas', status: 'Running', progress: 75, health: 'On track' },
      { id: 'prj-lumen', status: 'Ended', progress: 100, health: 'On track' },
      { id: 'prj-northwind', status: 'Pending', progress: 0, health: 'On track' },
    ]);
  });

  it('respects project.statusOverride in getProjectStatus', () => {
    const overridden = { ...projects[0], statusOverride: 'Ended' as const };
    expect(getProjectStatus(overridden, tasks)).toBe('Ended');
  });

  it('computes project task summary accurately', () => {
    const harborSummary = getProjectTaskSummary('prj-harbor', tasks);
    expect(harborSummary.totalCount).toBe(7);
    expect(harborSummary.doneCount).toBe(4);
    expect(harborSummary.openCount).toBe(3);
  });

  it('filters and sorts projects by status, dueDate, progress, and name', () => {
    const runningByDue = filterAndSortProjects(projects, tasks, team, {
      statusFilter: 'running',
      sortField: 'dueDate',
      searchQuery: '',
    });
    expect(runningByDue.map((p) => p.id)).toEqual([
      'prj-atlas',
      'prj-orchard',
      'prj-harbor',
      'prj-fernlight',
    ]);

    const byProgress = filterAndSortProjects(projects, tasks, team, {
      statusFilter: 'all',
      sortField: 'progress',
      searchQuery: 'harbor',
    });
    expect(byProgress.map((p) => p.id)).toEqual(['prj-harbor']);
  });

  it('computes completion rings for top 4 unfinished projects sorted by dueDate', () => {
    const rings = getRingsProjects(projects, tasks);
    expect(rings.map((r) => ({ id: r.project.id, progress: r.progress }))).toEqual([
      { id: 'prj-atlas', progress: 75 },
      { id: 'prj-orchard', progress: 40 },
      { id: 'prj-harbor', progress: 57 },
      { id: 'prj-fernlight', progress: 40 },
    ]);
  });

  it('computes exact baseline tasks board grouping and Done recent/earlier split', () => {
    const grouped = groupTasksByStatus(tasks);
    expect(grouped.Backlog.length).toBe(5);
    expect(grouped['In Progress'].length).toBe(4);
    expect(grouped['In Review'].length).toBe(3);
    expect(grouped.Done.length).toBe(15);

    const doneGroups = getDoneTasksGrouped(tasks);
    expect(doneGroups.recentDone.length).toBe(7);
    expect(doneGroups.earlierDone.length).toBe(8);
  });

  it('computes task filter counts and filters board tasks accurately', () => {
    const counts = computeTaskFilterCounts(tasks, 'usr-soren');
    expect(counts).toEqual({
      myCount: 2,
      highCount: 14,
      weekCount: 5,
    });

    const filteredMy = filterTasksForBoard(tasks, 'usr-soren', ['my'], '', '');
    expect(filteredMy.length).toBe(2);
  });

  it('computes task cycle days, on-time completion, and status progress transitions', () => {
    const lateTask = tasks.find((t) => t.id === 'tsk-h-3')!;
    expect(isTaskCompletedOnTime(lateTask)).toBe(false);
    expect(getTaskCycleDays(lateTask)).toBe(8);

    const onTimeTask = tasks.find((t) => t.id === 'tsk-h-1')!;
    expect(isTaskCompletedOnTime(onTimeTask)).toBe(true);
    expect(isTaskCompletedInRange(onTimeTask, 0, 30)).toBe(true);

    expect(progressForTaskStatus('Done', 20)).toBe(100);
    expect(progressForTaskStatus('In Review', 50)).toBe(75);
    expect(progressForTaskStatus('In Progress', 100)).toBe(55);
    expect(progressForTaskStatus('Backlog', 100)).toBe(15);
  });

  it('computes exact baseline team member workloads, task counts, and team metrics', () => {
    const memberSnapshot = team.map((m) => ({
      id: m.id,
      workload: getMemberWorkload(m.id, tasks),
      ...getMemberTaskCounts(m.id, tasks),
    }));

    expect(memberSnapshot).toEqual([
      { id: 'usr-soren', workload: 17, openCount: 2, completedCount: 0 },
      { id: 'usr-mireia', workload: 20, openCount: 1, completedCount: 2 },
      { id: 'usr-tarek', workload: 77, openCount: 3, completedCount: 2 },
      { id: 'usr-kaelen', workload: 10, openCount: 1, completedCount: 2 },
      { id: 'usr-nadia', workload: 37, openCount: 2, completedCount: 4 },
      { id: 'usr-juno', workload: 25, openCount: 2, completedCount: 2 },
      { id: 'usr-jade', workload: 33, openCount: 1, completedCount: 3 },
    ]);

    const teamMetrics = computeTeamMetrics(team, tasks);
    expect(teamMetrics).toEqual({
      totalCount: 7,
      onlineCount: 5,
      awayCount: 1,
      offlineCount: 1,
      avgWorkload: 31,
    });

    expect(filterTeamMembers(team, 'Engineering', '').length).toBe(3);
    expect(getMemberAssignedTasks('usr-nadia', tasks).length).toBe(6);
  });

  it('computes exact baseline Weekly Output for Dashboard', () => {
    const weekly = computeWeeklyOutputData(focusSessions, 'monday');
    expect(weekly.totalWeekSeconds).toBe(114480);
    expect(weekly.totalSessionsCount).toBe(15);
    expect(weekly.columns.length).toBe(7);
  });

  it('computes calendar events map, filtered events, and next up event', () => {
    const filtered = filterCalendarEvents(events, 'Review', '');
    expect(filtered.length).toBeGreaterThan(0);

    const map = computeEventsByDateMap(events);
    expect(map.size).toBeGreaterThan(0);

    const nextUp = getNextUpEvent(events, projects);
    expect(nextUp).not.toBeNull();
  });

  it('computes exact baseline 30D Analytics KPIs, project focus slices, status composition, and contributors', () => {
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
      { id: 'prj-harbor', hours: 38.8, pct: 31 },
      { id: 'prj-atlas', hours: 27.5, pct: 22 },
      { id: 'prj-fernlight', hours: 23.2, pct: 19 },
      { id: 'prj-orchard', hours: 21.4, pct: 17 },
      { id: 'prj-lumen', hours: 12.7, pct: 11 },
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
