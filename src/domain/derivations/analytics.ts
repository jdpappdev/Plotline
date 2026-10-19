import { FocusSession, Project, TaskItem, TeamMember } from '../types';
import { getIsoDateOffset } from '../../lib/clock';
import { computeDaysAgoFromIso, formatDuration, getSessionSeconds, SECONDS_PER_HOUR } from './time';
import {
  getTaskCycleDays,
  isTaskCompletedInRange,
  isTaskCompletedOnTime,
  TaskStatus,
} from './tasks';

const ACCENT_TINTS = [
  'var(--accent-tint-1)',
  'var(--accent-tint-2)',
  'var(--accent-tint-3)',
  'var(--accent-tint-4)',
  'var(--accent-tint-5)',
];

export type AnalyticsRangeKey = '7D' | '30D' | '90D';

export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
}

export function formatShortMonthDay(dateIso: string): string {
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3) return dateIso;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function computeLargestRemainderPercentages(values: number[]): number[] {
  if (values.length === 0) return [];
  const sanitized = values.map((v) => Math.max(0, Number.isFinite(v) ? v : 0));
  const total = sanitized.reduce((acc, v) => acc + v, 0);
  if (total <= 0) {
    return sanitized.map(() => 0);
  }

  const exactQuotas = sanitized.map((v) => (v / total) * 100);
  const floors = exactQuotas.map((q) => Math.floor(q));
  const currentSum = floors.reduce((acc, f) => acc + f, 0);
  const shortfall = Math.max(0, Math.min(sanitized.length, 100 - currentSum));

  const rankedIndices = exactQuotas
    .map((q, idx) => ({
      idx,
      remainder: q - floors[idx],
      value: sanitized[idx],
    }))
    .sort((a, b) => {
      if (Math.abs(b.remainder - a.remainder) > 1e-9) {
        return b.remainder - a.remainder;
      }
      if (b.value !== a.value) {
        return b.value - a.value;
      }
      return a.idx - b.idx;
    });

  const result = [...floors];
  for (let i = 0; i < shortfall; i++) {
    result[rankedIndices[i].idx] += 1;
  }
  return result;
}

export interface AnalyticsComputedData {
  rangeDays: number;
  tasksCompletedCount: number;
  tasksPrevCount: number;
  tasksDeltaPct: number;
  tasksSubtitle: string;
  totalFocusHours: number;
  prevFocusHours: number;
  focusDeltaPct: number;
  focusSubtitle: string;
  onTimeRate: number;
  prevOnTimeRate: number;
  onTimeDeltaPts: number;
  onTimeSubtitle: string;
  onTimeCount: number;
  completedWithDueCount: number;
  avgCycleDays: number;
  prevAvgCycleDays: number;
  cycleDeltaDays: number;
  cycleSubtitle: string;
  dailyTrend: Array<{
    dateIso: string;
    label: string;
    hours: number;
    tasksCount: number;
    isWeekend: boolean;
  }>;
  maxDailyHours: number;
  totalRangeTaskCompletions: number;
  projectFocusSlices: Array<{
    project: Project;
    seconds: number;
    hours: number;
    pct: number;
    color: string;
  }>;
  totalSliceHours: number;
  totalSliceSeconds: number;
  statusComposition: Array<{
    status: TaskStatus;
    label: string;
    count: number;
    pct: number;
    color: string;
    textColor: string;
  }>;
  totalTasksCount: number;
  contributorRows: Array<{
    member: TeamMember;
    completedCount: number;
    focusHours: number;
    focusSeconds: number;
    shareOfCompletedPct: number;
  }>;
  maxContributorCompleted: number;
}

export function computeAnalyticsData(
  rangeKey: AnalyticsRangeKey,
  projects: Project[],
  tasks: TaskItem[],
  team: TeamMember[],
  focusSessions: FocusSession[]
): AnalyticsComputedData {
  const rangeDays = rangeKey === '7D' ? 7 : rangeKey === '30D' ? 30 : 90;
  const tasksCompletedInRange = tasks.filter((t) => isTaskCompletedInRange(t, 0, rangeDays));
  const tasksCompletedPrevRange = tasks.filter((t) =>
    isTaskCompletedInRange(t, rangeDays, rangeDays * 2)
  );

  const tasksCompletedCount = tasksCompletedInRange.length;
  const tasksPrevCount = tasksCompletedPrevRange.length;
  const tasksDeltaPct =
    tasksPrevCount > 0
      ? Math.round(((tasksCompletedCount - tasksPrevCount) / tasksPrevCount) * 100)
      : tasksCompletedCount > 0
        ? 100
        : 0;

  const tasksSubtitle =
    tasksPrevCount > 0
      ? `${tasksCompletedCount} completed vs ${tasksPrevCount} in prior ${rangeDays}d`
      : `${tasksCompletedCount} completed · no prior baseline`;

  const sessionsInRange = focusSessions.filter((s) => {
    const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
    return dAgo >= 0 && dAgo < rangeDays;
  });

  const sessionsPrevRange = focusSessions.filter((s) => {
    const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
    return dAgo >= rangeDays && dAgo < rangeDays * 2;
  });

  const totalFocusSeconds = sessionsInRange.reduce((acc, s) => acc + getSessionSeconds(s), 0);
  const prevFocusSeconds = sessionsPrevRange.reduce((acc, s) => acc + getSessionSeconds(s), 0);

  const totalFocusHours = Number((totalFocusSeconds / SECONDS_PER_HOUR).toFixed(1));
  const prevFocusHours = Number((prevFocusSeconds / SECONDS_PER_HOUR).toFixed(1));

  const focusDeltaPct =
    prevFocusSeconds > 0
      ? Math.round(((totalFocusSeconds - prevFocusSeconds) / prevFocusSeconds) * 100)
      : totalFocusSeconds > 0
        ? 100
        : 0;

  const focusSubtitle =
    prevFocusSeconds > 0
      ? `${formatDuration(totalFocusSeconds)} logged vs ${formatDuration(prevFocusSeconds)} prior`
      : `${pluralize(sessionsInRange.length, 'session')} logged · no prior baseline`;

  const completedWithDue = tasksCompletedInRange.filter((t) => Boolean(t.dueDate));
  const onTimeCount = completedWithDue.filter((t) => isTaskCompletedOnTime(t)).length;
  const onTimeRate =
    completedWithDue.length > 0 ? Math.round((onTimeCount / completedWithDue.length) * 100) : 100;

  const prevCompletedWithDue = tasksCompletedPrevRange.filter((t) => Boolean(t.dueDate));
  const prevOnTimeCount = prevCompletedWithDue.filter((t) => isTaskCompletedOnTime(t)).length;
  const prevOnTimeRate =
    prevCompletedWithDue.length > 0
      ? Math.round((prevOnTimeCount / prevCompletedWithDue.length) * 100)
      : 0;
  const onTimeDeltaPts = prevCompletedWithDue.length > 0 ? onTimeRate - prevOnTimeRate : 0;
  const onTimeSubtitle = `${onTimeCount} of ${completedWithDue.length} delivered on or before due date`;

  const cycleValues = tasksCompletedInRange.map((t) => getTaskCycleDays(t)).filter((v) => v > 0);

  const avgCycleDays =
    cycleValues.length > 0
      ? Number((cycleValues.reduce((a, b) => a + b, 0) / cycleValues.length).toFixed(1))
      : 0;

  const prevCycleValues = tasksCompletedPrevRange
    .map((t) => getTaskCycleDays(t))
    .filter((v) => v > 0);

  const prevAvgCycleDays =
    prevCycleValues.length > 0
      ? Number((prevCycleValues.reduce((a, b) => a + b, 0) / prevCycleValues.length).toFixed(1))
      : 0;

  const cycleDeltaDays =
    prevAvgCycleDays > 0 ? Number((avgCycleDays - prevAvgCycleDays).toFixed(1)) : 0;
  const cycleSubtitle =
    prevAvgCycleDays > 0
      ? `From start to Done across ${pluralize(cycleValues.length, 'task')} (prior ${prevAvgCycleDays}d)`
      : `From start to Done across ${pluralize(cycleValues.length, 'task')}`;

  const dailyTrend: AnalyticsComputedData['dailyTrend'] = [];
  for (let daysAgo = rangeDays - 1; daysAgo >= 0; daysAgo--) {
    const dateIso = getIsoDateOffset(-daysAgo);
    const parts = dateIso.split('-').map(Number);
    const dayObj = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    const isWeekend = dayObj.getDay() === 0 || dayObj.getDay() === 6;
    const daySeconds = sessionsInRange
      .filter((s) => s.date === dateIso)
      .reduce((acc, s) => acc + getSessionSeconds(s), 0);
    const dayHours = Number((daySeconds / SECONDS_PER_HOUR).toFixed(1));
    const dayTasks = tasksCompletedInRange.filter((t) => t.completedDate === dateIso).length;

    dailyTrend.push({
      dateIso,
      label: formatShortMonthDay(dateIso),
      hours: dayHours,
      tasksCount: dayTasks,
      isWeekend,
    });
  }

  const maxDailyHours = Math.max(4, ...dailyTrend.map((d) => d.hours), 1);
  const totalRangeTaskCompletions = dailyTrend.reduce((acc, d) => acc + d.tasksCount, 0);

  const rawSlices = projects
    .map((proj, idx) => {
      const projSeconds = sessionsInRange
        .filter((s) => s.projectId === proj.id)
        .reduce((acc, s) => acc + getSessionSeconds(s), 0);
      return {
        project: proj,
        seconds: projSeconds,
        hours: Number((projSeconds / SECONDS_PER_HOUR).toFixed(1)),
        color: ACCENT_TINTS[idx % ACCENT_TINTS.length],
      };
    })
    .filter((s) => s.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds);

  const totalSliceSeconds = rawSlices.reduce((acc, s) => acc + s.seconds, 0);
  const totalSliceHours = Number((totalSliceSeconds / SECONDS_PER_HOUR).toFixed(1));
  const slicePercentages = computeLargestRemainderPercentages(rawSlices.map((s) => s.seconds));
  const projectFocusSlices = rawSlices.map((s, idx) => ({
    ...s,
    pct: slicePercentages[idx] ?? 0,
  }));

  const statusOrder: Array<{
    status: TaskStatus;
    label: string;
    color: string;
    textColor: string;
  }> = [
    { status: 'Done', label: 'Done', color: 'var(--accent)', textColor: '#FFFFFF' },
    { status: 'In Review', label: 'In Review', color: '#D97706', textColor: '#FFFFFF' },
    {
      status: 'In Progress',
      label: 'In Progress',
      color: 'var(--accent-light)',
      textColor: '#0F172A',
    },
    { status: 'Backlog', label: 'To do', color: '#E2E8F0', textColor: '#334155' },
  ];

  const totalTasksCount = tasks.length;
  const statusCounts = statusOrder.map((st) => tasks.filter((t) => t.status === st.status).length);
  const statusPcts = computeLargestRemainderPercentages(statusCounts);
  const statusComposition = statusOrder.map((st, idx) => ({
    ...st,
    count: statusCounts[idx],
    pct: statusPcts[idx] ?? 0,
  }));

  const rawContributors = team
    .map((member) => {
      const completedCount = tasksCompletedInRange.filter((t) => t.assigneeId === member.id).length;
      const memberSeconds = sessionsInRange
        .filter((s) => s.memberId === member.id)
        .reduce((acc, s) => acc + getSessionSeconds(s), 0);
      const focusHours = Number((memberSeconds / SECONDS_PER_HOUR).toFixed(1));
      return {
        member,
        completedCount,
        focusHours,
        focusSeconds: memberSeconds,
      };
    })
    .sort((a, b) => b.completedCount - a.completedCount || b.focusSeconds - a.focusSeconds);

  const contributorPcts = computeLargestRemainderPercentages(
    rawContributors.map((r) => r.completedCount)
  );
  const contributorRows = rawContributors.map((r, idx) => ({
    ...r,
    shareOfCompletedPct: contributorPcts[idx] ?? 0,
  }));

  const maxContributorCompleted = Math.max(1, ...contributorRows.map((r) => r.completedCount));

  return {
    rangeDays,
    tasksCompletedCount,
    tasksPrevCount,
    tasksDeltaPct,
    tasksSubtitle,
    totalFocusHours,
    prevFocusHours,
    focusDeltaPct,
    focusSubtitle,
    onTimeRate,
    prevOnTimeRate,
    onTimeDeltaPts,
    onTimeSubtitle,
    onTimeCount,
    completedWithDueCount: completedWithDue.length,
    avgCycleDays,
    prevAvgCycleDays,
    cycleDeltaDays,
    cycleSubtitle,
    dailyTrend,
    maxDailyHours,
    totalRangeTaskCompletions,
    projectFocusSlices,
    totalSliceHours,
    totalSliceSeconds,
    statusComposition,
    totalTasksCount,
    contributorRows,
    maxContributorCompleted,
  };
}
