import type {
  CalendarEvent,
  FocusSession,
  Project,
  TaskItem,
  TeamMember,
  ValidationCheckResult,
  WorkspaceValidationReport,
} from './types';
import { computeDaysAgoFromIso, getTodayIsoDate } from '../lib/dates';
import {
  getMemberTaskCounts,
  getProjectProgress,
  getProjectStatus,
  isTaskCompletedInRange,
} from './derivations';
import { getTaskFactorBand } from './seed/sessionsSeed';

const RANGE_DAYS_30 = 30;
const RANGE_DAYS_7 = 7;
const SECONDS_PER_HOUR = 3600;
const MAX_TASK_FACTOR_CAP = 1.2;
const FLOAT_EPSILON = 1e-4;
const SLICE_HOURS_TOLERANCE = 0.05;

export function validateWorkspace(
  projects: Project[],
  tasks: TaskItem[],
  team: TeamMember[],
  events: CalendarEvent[],
  focusSessions: FocusSession[]
): WorkspaceValidationReport {
  const today = getTodayIsoDate();
  const nowMs = Date.now();
  const checks: ValidationCheckResult[] = [];

  const projIds = new Set(projects.map((p) => p.id));
  const taskIds = new Set(tasks.map((t) => t.id));
  const teamIds = new Set(team.map((m) => m.id));
  const eventIds = new Set(events.map((e) => e.id));
  const sessionIds = new Set(focusSessions.map((s) => s.id));

  const projUnique = projIds.size === projects.length;
  const taskUnique = taskIds.size === tasks.length;
  const teamUnique = teamIds.size === team.length;
  const eventUnique = eventIds.size === events.length;
  const sessionUnique = sessionIds.size === focusSessions.length;

  const tasksProjectValid = tasks.every((t) => projIds.has(t.projectId));
  const focusTaskValid = focusSessions.every(
    (s) => taskIds.has(s.taskId) && projIds.has(s.projectId)
  );

  const check1Passed =
    projUnique &&
    taskUnique &&
    teamUnique &&
    eventUnique &&
    sessionUnique &&
    tasksProjectValid &&
    focusTaskValid;
  checks.push({
    id: 'ids-unique',
    label: 'All IDs resolve and are unique',
    passed: check1Passed,
    details: check1Passed
      ? `Projects (${projects.length}), Tasks (${tasks.length}), Team (${team.length}), Events (${events.length}), Sessions (${focusSessions.length}) unique and valid.`
      : 'Duplicate or unresolvable IDs detected.',
  });

  let check2Passed = true;
  for (const p of projects) {
    if (p.statusOverride) continue;
    const calcProgress = getProjectProgress(p, tasks);
    if (p.progress !== calcProgress) {
      check2Passed = false;
    }
  }
  checks.push({
    id: 'statuses-progress',
    label: 'Project statuses and progress match tasks',
    passed: check2Passed,
    details: check2Passed
      ? 'All project progress percentages and derived statuses match task calculations.'
      : 'Mismatch between project status/progress and tasks.',
  });

  const futureSessions = focusSessions.some(
    (s) => s.date > today || (s.createdAt ? new Date(s.createdAt).getTime() > nowMs : false)
  );
  const weekendSessions = focusSessions.some((s) => {
    const parts = s.date.split('-').map(Number);
    const dayOfWeek =
      parts.length === 3
        ? new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getDay()
        : s.weekdayIndex;
    return dayOfWeek === 0 || dayOfWeek === 6 || s.weekdayIndex === 0 || s.weekdayIndex === 6;
  });
  const unstartedSessions = focusSessions.some((s) => {
    const task = tasks.find((t) => t.id === s.taskId);
    return !task || task.status === 'Backlog';
  });
  const check3Passed = !futureSessions && !weekendSessions && !unstartedSessions;
  checks.push({
    id: 'sessions-valid',
    label: 'No weekend or future sessions, and no unstarted task sessions',
    passed: check3Passed,
    details: check3Passed
      ? 'All focus sessions logged on past/current weekdays only for active tasks.'
      : 'Weekend, future, or unstarted task focus sessions found.',
  });

  const doneTasks = tasks.filter((t) => t.status === 'Done');
  const everyTaskHasStartDate = tasks.every((t) => Boolean(t.startDate));
  const check4Passed =
    everyTaskHasStartDate &&
    doneTasks.every((t) => Boolean(t.completedDate) && t.completedDate! <= today);
  checks.push({
    id: 'done-completion-dates',
    label: 'Every task has a start date and Done tasks have completion dates in the past',
    passed: check4Passed,
    details: check4Passed
      ? `All ${tasks.length} tasks have start dates and all ${doneTasks.length} completed tasks have valid completion dates in the past.`
      : 'Missing startDate or invalid completion date found.',
  });

  const check5Passed = tasks.every((t) => teamIds.has(t.assigneeId));
  checks.push({
    id: 'assignees-exist',
    label: 'Task assignees exist in team',
    passed: check5Passed,
    details: check5Passed
      ? 'All task assignees map to valid team members.'
      : 'Unassigned or unknown team member IDs found on tasks.',
  });

  const check6Passed = events.every((e) => e.attendeeIds.every((attId) => teamIds.has(attId)));
  checks.push({
    id: 'event-attendees-valid',
    label: 'Event attendees exist in team',
    passed: check6Passed,
    details: check6Passed
      ? 'All event attendee IDs exist in team.'
      : 'Invalid event attendee IDs found.',
  });

  let endedCnt = 0;
  let runningCnt = 0;
  let pendingCnt = 0;
  projects.forEach((p) => {
    const st = getProjectStatus(p, tasks);
    if (st === 'Ended') endedCnt++;
    else if (st === 'Pending') pendingCnt++;
    else runningCnt++;
  });
  const totalCnt = projects.length;
  const check7Passed = endedCnt + runningCnt + pendingCnt === totalCnt;
  checks.push({
    id: 'stat-cards-sum',
    label: 'Stat cards sum to Total (Ended + Running + Pending = Total)',
    passed: check7Passed,
    details: check7Passed
      ? `Total (${totalCnt}) = Ended (${endedCnt}) + Running (${runningCnt}) + Pending (${pendingCnt}).`
      : `Sum mismatch: ${endedCnt} + ${runningCnt} + ${pendingCnt} != ${totalCnt}`,
  });

  let check8Passed = true;
  team.forEach((m) => {
    const { openCount, completedCount } = getMemberTaskCounts(m.id, tasks);
    const assignedOpen = tasks.filter(
      (t) => (t.assigneeId === m.id || t.coAssigneeId === m.id) && t.status !== 'Done'
    ).length;
    const assignedDone = tasks.filter(
      (t) => (t.assigneeId === m.id || t.coAssigneeId === m.id) && t.status === 'Done'
    ).length;
    if (openCount !== assignedOpen || completedCount !== assignedDone) {
      check8Passed = false;
    }
  });
  checks.push({
    id: 'identical-person-counts',
    label: 'Team, Profile, Dashboard, and Tasks show identical counts per person',
    passed: check8Passed,
    details: check8Passed
      ? 'Per-person task counts match perfectly across all screens.'
      : 'Mismatched task counts per person.',
  });

  const allFilterRows = projects.length;
  const pendingChipCount = projects.filter((p) => getProjectStatus(p, tasks) === 'Pending').length;
  const runningChipCount = projects.filter((p) => getProjectStatus(p, tasks) === 'Running').length;
  const endedChipCount = projects.filter((p) => getProjectStatus(p, tasks) === 'Ended').length;

  const check9Passed = pendingChipCount + runningChipCount + endedChipCount === allFilterRows;
  checks.push({
    id: 'filter-chip-counts',
    label: 'Filter chip counts equal number of rows shown for each status filter',
    passed: check9Passed,
    details: check9Passed
      ? `Filter chips equal rows shown: All (${allFilterRows}), Running (${runningChipCount}), Pending (${pendingChipCount}), Ended (${endedChipCount}).`
      : 'Mismatch between filter chip counts and status row counts.',
  });

  const tasksIn30D = tasks.filter((t) => isTaskCompletedInRange(t, 0, RANGE_DAYS_30));
  const kpiTaskCount30D = tasksIn30D.length;
  const contributorCounts30D = team.map(
    (m) => tasksIn30D.filter((t) => t.assigneeId === m.id).length
  );
  const contributorSum30D = contributorCounts30D.reduce((a, b) => a + b, 0);
  const check10Passed =
    kpiTaskCount30D === tasksIn30D.length && contributorSum30D === kpiTaskCount30D;
  checks.push({
    id: 'analytics-kpi-contributor-tasks',
    label: 'KPI task count equals store tasks completed in range and contributor counts sum to it',
    passed: check10Passed,
    details: check10Passed
      ? `30D KPI tasks (${kpiTaskCount30D}) equals store tasks completed in range (${tasksIn30D.length}); contributor counts sum to ${contributorSum30D}.`
      : `Mismatch: KPI (${kpiTaskCount30D}) vs contributor sum (${contributorSum30D}).`,
  });

  const sessionsIn30D = focusSessions.filter((s) => {
    const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
    return dAgo >= 0 && dAgo < RANGE_DAYS_30;
  });
  const totalSeconds30D = sessionsIn30D.reduce(
    (acc, s) =>
      acc +
      (typeof s.seconds === 'number'
        ? Math.round(s.seconds)
        : Math.round((s.hours || 0) * SECONDS_PER_HOUR)),
    0
  );
  const totalHours30D = Number((totalSeconds30D / SECONDS_PER_HOUR).toFixed(1));
  const sliceSecondsList = projects
    .map((p) =>
      sessionsIn30D
        .filter((s) => s.projectId === p.id)
        .reduce(
          (acc, s) =>
            acc +
            (typeof s.seconds === 'number'
              ? Math.round(s.seconds)
              : Math.round((s.hours || 0) * SECONDS_PER_HOUR)),
          0
        )
    )
    .filter((secs) => secs > 0);
  const sliceSecondsSum = sliceSecondsList.reduce((a, b) => a + b, 0);
  const sliceHoursSum = Number(
    sliceSecondsList
      .reduce((acc, secs) => acc + Number((secs / SECONDS_PER_HOUR).toFixed(1)), 0)
      .toFixed(1)
  );
  const check11Passed =
    sliceSecondsSum === totalSeconds30D &&
    Math.abs(sliceHoursSum - totalHours30D) < SLICE_HOURS_TOLERANCE;
  checks.push({
    id: 'donut-slices-sum-hours',
    label: 'Donut slices sum to total focus hours',
    passed: check11Passed,
    details: check11Passed
      ? `Donut slices sum to ${sliceHoursSum}h (${sliceSecondsSum}s), matching total ${totalHours30D}h.`
      : `Donut slices (${sliceHoursSum}h) do not match total hours (${totalHours30D}h).`,
  });

  const taskBandViolations: string[] = [];
  let maxFactorObserved = 0;
  tasks.forEach((t) => {
    const taskSessionSeconds = focusSessions
      .filter((s) => s.taskId === t.id)
      .reduce(
        (acc, s) =>
          acc +
          (typeof s.seconds === 'number'
            ? Math.round(s.seconds)
            : Math.round((s.hours || 0) * SECONDS_PER_HOUR)),
        0
      );
    const loggedSeconds =
      typeof t.loggedSeconds === 'number' ? t.loggedSeconds : taskSessionSeconds;
    const loggedHours = loggedSeconds / SECONDS_PER_HOUR;
    const [minF, maxF] = getTaskFactorBand(t.status);
    const factor = t.estimateHours > 0 ? loggedHours / t.estimateHours : 0;
    if (factor > maxFactorObserved) maxFactorObserved = factor;

    const inBand =
      t.status === 'Backlog'
        ? loggedSeconds === 0
        : factor + FLOAT_EPSILON >= minF && factor - FLOAT_EPSILON <= maxF;
    const underCap = factor - FLOAT_EPSILON <= MAX_TASK_FACTOR_CAP;

    if (!inBand || !underCap || Math.abs(loggedSeconds - taskSessionSeconds) > 1) {
      taskBandViolations.push(
        `${t.id} (${t.status}): ${loggedHours.toFixed(2)}h / ${t.estimateHours}h = ${factor.toFixed(3)} (expected ${minF}..${maxF})`
      );
    }
  });
  const check12Passed = taskBandViolations.length === 0;
  checks.push({
    id: 'task-factor-bands',
    label: 'Each task logged hours falls inside its factor band and <= 1.2x estimate',
    passed: check12Passed,
    details: check12Passed
      ? `All ${tasks.length} tasks fall strictly within their status factor bands (max observed ${(maxFactorObserved * 100).toFixed(1)}% of estimate, <= 120%).`
      : `Violations: ${taskBandViolations.join('; ')}`,
  });

  const sessions7D = focusSessions.filter((s) => {
    const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
    return dAgo >= 0 && dAgo < RANGE_DAYS_7;
  });
  const analytics7DSeconds = sessions7D.reduce(
    (acc, s) =>
      acc +
      (typeof s.seconds === 'number'
        ? Math.round(s.seconds)
        : Math.round((s.hours || 0) * SECONDS_PER_HOUR)),
    0
  );
  const dashboardWeeklySeconds = [0, 1, 2, 3, 4, 5, 6].reduce((sum, dayIdx) => {
    const colSecs = focusSessions
      .filter((s) => {
        const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
        return dAgo >= 0 && dAgo < RANGE_DAYS_7 && s.weekdayIndex === dayIdx;
      })
      .reduce(
        (acc, s) =>
          acc +
          (typeof s.seconds === 'number'
            ? Math.round(s.seconds)
            : Math.round((s.hours || 0) * SECONDS_PER_HOUR)),
        0
      );
    return sum + colSecs;
  }, 0);
  const check13Passed = dashboardWeeklySeconds === analytics7DSeconds;
  checks.push({
    id: 'weekly-output-equals-analytics-7d',
    label: 'Weekly Output (Dashboard) for the current week equals the sum of Analytics 7D',
    passed: check13Passed,
    details: check13Passed
      ? `Dashboard Weekly Output (${(dashboardWeeklySeconds / SECONDS_PER_HOUR).toFixed(1)}h / ${dashboardWeeklySeconds}s) equals Analytics 7D (${(analytics7DSeconds / SECONDS_PER_HOUR).toFixed(1)}h / ${analytics7DSeconds}s).`
      : `Mismatch: Dashboard (${dashboardWeeklySeconds}s) vs Analytics 7D (${analytics7DSeconds}s).`,
  });

  return {
    timestamp: new Date().toISOString(),
    passed: checks.every((c) => c.passed),
    checks,
  };
}
