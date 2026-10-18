import type {
  AnalyticsRangeKey,
  CalendarEvent,
  Department,
  DerivedProjectStatus,
  EventCategory,
  FocusSession,
  Project,
  ProjectSortField,
  ProjectStatusFilter,
  TaskFilterCriterion,
  TaskItem,
  TaskStatus,
  TeamMember,
  WeekStart,
} from './types';
import {
  computeDaysAgoFromIso,
  computeDaysBetweenIso,
  getIsoDateOffset,
  getTodayIsoDate,
  isDueWithinWeek,
} from '../lib/dates';
import { formatDuration, formatShortMonthDay, pluralize } from '../lib/format';
import { ACCENT_TINTS } from '../lib/theme';
import { DEFAULT_MEMBER_CAPACITY_HOURS } from './seed/constants';
import { createProjectDeadlineEvents } from './seed/eventsSeed';

const SECONDS_PER_HOUR = 3600;
const RECENT_DONE_CUTOFF_DAYS = -14;
const MAX_RINGS_PROJECTS = 4;
const PROGRESS_DONE = 100;
const PROGRESS_REVIEW_MIN = 75;
const PROGRESS_REVIEW_MAX = 90;
const PROGRESS_REVIEW_DEFAULT = 80;
const PROGRESS_ACTIVE_MIN = 35;
const PROGRESS_ACTIVE_MAX = 70;
const PROGRESS_ACTIVE_FROM_DONE = 55;
const PROGRESS_ACTIVE_DEFAULT = 50;
const PROGRESS_BACKLOG_MAX = 25;
const PROGRESS_BACKLOG_DEFAULT = 15;

export function getTaskCycleDays(task: TaskItem): number {
  if (task.startDate && task.completedDate) {
    return computeDaysBetweenIso(task.startDate, task.completedDate);
  }
  return task.cycleDays ?? 0;
}

export function isTaskCompletedOnTime(task: TaskItem): boolean {
  if (!task.completedDate || !task.dueDate) return true;
  return task.completedDate <= task.dueDate;
}

export function isTaskCompletedInRange(
  task: TaskItem,
  minDaysAgoInclusive: number,
  maxDaysAgoExclusive: number
): boolean {
  if (task.status !== 'Done' || !task.completedDate) return false;
  const daysAgo = computeDaysAgoFromIso(task.completedDate);
  return daysAgo >= minDaysAgoInclusive && daysAgo < maxDaysAgoExclusive;
}

export function progressForTaskStatus(status: TaskStatus, currentProgress: number): number {
  switch (status) {
    case 'Done':
      return PROGRESS_DONE;
    case 'In Review':
      return Math.max(
        PROGRESS_REVIEW_MIN,
        Math.min(PROGRESS_REVIEW_MAX, currentProgress || PROGRESS_REVIEW_DEFAULT)
      );
    case 'In Progress':
      return Math.max(
        PROGRESS_ACTIVE_MIN,
        Math.min(
          PROGRESS_ACTIVE_MAX,
          currentProgress === PROGRESS_DONE
            ? PROGRESS_ACTIVE_FROM_DONE
            : currentProgress || PROGRESS_ACTIVE_DEFAULT
        )
      );
    case 'Backlog':
    default:
      return Math.min(
        PROGRESS_BACKLOG_MAX,
        currentProgress === PROGRESS_DONE
          ? PROGRESS_BACKLOG_DEFAULT
          : currentProgress || PROGRESS_BACKLOG_DEFAULT
      );
  }
}

export function getProjectProgress(project: Project, tasks: TaskItem[]): number {
  const projTasks = tasks.filter((t) => t.projectId === project.id);
  if (projTasks.length === 0) return 0;
  const doneCount = projTasks.filter((t) => t.status === 'Done').length;
  return Math.round((doneCount / projTasks.length) * 100);
}

export function getProjectStatus(project: Project, tasks: TaskItem[]): DerivedProjectStatus {
  if (project.statusOverride) {
    return project.statusOverride;
  }
  const projTasks = tasks.filter((t) => t.projectId === project.id);
  if (projTasks.length === 0) {
    return 'Pending';
  }
  if (projTasks.every((t) => t.status === 'Done')) {
    return 'Ended';
  }
  const hasStartedTask = projTasks.some(
    (t) => t.status === 'In Progress' || t.status === 'In Review' || t.status === 'Done'
  );
  if (!hasStartedTask) {
    return 'Pending';
  }
  return 'Running';
}

export function getProjectHealth(project: Project, tasks: TaskItem[]): 'At risk' | 'On track' {
  const today = getTodayIsoDate();
  const projTasks = tasks.filter((t) => t.projectId === project.id);
  const hasOverdue = projTasks.some(
    (t) => t.status !== 'Done' && Boolean(t.dueDate) && t.dueDate < today
  );
  return hasOverdue ? 'At risk' : 'On track';
}

export function getProjectTaskSummary(
  projectId: string,
  tasks: TaskItem[]
): {
  projectTasks: TaskItem[];
  totalCount: number;
  doneCount: number;
  openCount: number;
} {
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const doneCount = projectTasks.filter((t) => t.status === 'Done').length;
  return {
    projectTasks,
    totalCount: projectTasks.length,
    doneCount,
    openCount: projectTasks.length - doneCount,
  };
}

export interface ProjectStatusCounts {
  totalCount: number;
  endedCount: number;
  runningCount: number;
  pendingCount: number;
  endedPct: number;
  runningPct: number;
  pendingPct: number;
}

export function computeProjectStatusCounts(
  projects: Project[],
  tasks: TaskItem[]
): ProjectStatusCounts {
  let endedCount = 0;
  let runningCount = 0;
  let pendingCount = 0;

  projects.forEach((p) => {
    const status = getProjectStatus(p, tasks);
    if (status === 'Ended') endedCount += 1;
    else if (status === 'Pending') pendingCount += 1;
    else runningCount += 1;
  });

  const totalCount = projects.length;
  const safeTotal = Math.max(1, totalCount);

  return {
    totalCount,
    endedCount,
    runningCount,
    pendingCount,
    endedPct: Math.round((endedCount / safeTotal) * 100),
    runningPct: Math.round((runningCount / safeTotal) * 100),
    pendingPct: Math.round((pendingCount / safeTotal) * 100),
  };
}

export function filterAndSortProjects(
  projects: Project[],
  tasks: TaskItem[],
  team: TeamMember[],
  options: {
    statusFilter: ProjectStatusFilter;
    sortField: ProjectSortField;
    searchQuery: string;
  }
): Project[] {
  const normalizedQuery = options.searchQuery.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    const status = getProjectStatus(p, tasks);
    if (options.statusFilter === 'running' && status !== 'Running') return false;
    if (options.statusFilter === 'pending' && status !== 'Pending') return false;
    if (options.statusFilter === 'ended' && status !== 'Ended') return false;

    if (!normalizedQuery) return true;
    const lead = team.find((m) => m.id === p.leadId);
    return (
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.code.toLowerCase().includes(normalizedQuery) ||
      p.client.toLowerCase().includes(normalizedQuery) ||
      (lead ? lead.name.toLowerCase().includes(normalizedQuery) : false)
    );
  });

  return [...filtered].sort((a, b) => {
    if (options.sortField === 'dueDate') {
      return a.targetDate.localeCompare(b.targetDate);
    }
    if (options.sortField === 'progress') {
      return getProjectProgress(b, tasks) - getProjectProgress(a, tasks);
    }
    return a.name.localeCompare(b.name);
  });
}

export function getMemberWorkload(memberId: string, tasks: TaskItem[]): number {
  const openTasks = tasks.filter(
    (t) => (t.assigneeId === memberId || t.coAssigneeId === memberId) && t.status !== 'Done'
  );
  const openHours = openTasks.reduce((sum, t) => sum + (t.estimateHours || 0), 0);
  return Math.round((openHours / DEFAULT_MEMBER_CAPACITY_HOURS) * 100);
}

export function getMemberTaskCounts(
  memberId: string,
  tasks: TaskItem[]
): { openCount: number; completedCount: number } {
  const openCount = tasks.filter(
    (t) => (t.assigneeId === memberId || t.coAssigneeId === memberId) && t.status !== 'Done'
  ).length;
  const completedCount = tasks.filter(
    (t) => (t.assigneeId === memberId || t.coAssigneeId === memberId) && t.status === 'Done'
  ).length;
  return { openCount, completedCount };
}

export function getMemberAssignedTasks(memberId: string, tasks: TaskItem[]): TaskItem[] {
  return tasks.filter((t) => t.assigneeId === memberId || t.coAssigneeId === memberId);
}

export function computeTeamMetrics(
  team: TeamMember[],
  tasks: TaskItem[]
): {
  totalCount: number;
  onlineCount: number;
  awayCount: number;
  offlineCount: number;
  avgWorkload: number;
} {
  const totalCount = team.length;
  const onlineCount = team.filter((m) => m.presence === 'online').length;
  const awayCount = team.filter((m) => m.presence === 'away').length;
  const offlineCount = team.filter((m) => m.presence === 'offline').length;
  const avgWorkload =
    totalCount > 0
      ? Math.round(team.reduce((acc, m) => acc + getMemberWorkload(m.id, tasks), 0) / totalCount)
      : 0;

  return { totalCount, onlineCount, awayCount, offlineCount, avgWorkload };
}

export function filterTeamMembers(
  team: TeamMember[],
  departmentFilter: 'All' | Department,
  searchQuery: string
): TeamMember[] {
  const q = searchQuery.trim().toLowerCase();
  return team.filter((member) => {
    const matchesDept = departmentFilter === 'All' || member.department === departmentFilter;
    const matchesQuery =
      !q ||
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      member.department.toLowerCase().includes(q);
    return matchesDept && matchesQuery;
  });
}

export function getDoneTasksGrouped(tasks: TaskItem[]): {
  recentDone: TaskItem[];
  earlierDone: TaskItem[];
} {
  const doneTasks = tasks.filter((t) => t.status === 'Done');
  const cutoffDate = getIsoDateOffset(RECENT_DONE_CUTOFF_DAYS);
  const recentDone = doneTasks.filter((t) => (t.completedDate || t.dueDate) >= cutoffDate);
  const earlierDone = doneTasks.filter((t) => (t.completedDate || t.dueDate) < cutoffDate);
  return { recentDone, earlierDone };
}

export function computeTaskFilterCounts(
  tasks: TaskItem[],
  currentUserId: string
): { myCount: number; highCount: number; weekCount: number } {
  const myCount = tasks.filter(
    (t) => t.assigneeId === currentUserId || t.coAssigneeId === currentUserId
  ).length;
  const highCount = tasks.filter((t) => t.priority === 'High').length;
  const weekCount = tasks.filter((t) => t.status !== 'Done' && isDueWithinWeek(t.dueDate)).length;
  return { myCount, highCount, weekCount };
}

export function filterTasksForBoard(
  tasks: TaskItem[],
  currentUserId: string,
  activeFilters: TaskFilterCriterion[],
  globalSearch: string,
  localSearch: string
): TaskItem[] {
  const combinedQuery = `${globalSearch} ${localSearch}`.trim().toLowerCase();
  return tasks.filter((task) => {
    if (
      activeFilters.includes('my') &&
      task.assigneeId !== currentUserId &&
      task.coAssigneeId !== currentUserId
    ) {
      return false;
    }
    if (activeFilters.includes('high') && task.priority !== 'High') {
      return false;
    }
    if (
      activeFilters.includes('week') &&
      (task.status === 'Done' || !isDueWithinWeek(task.dueDate))
    ) {
      return false;
    }
    if (!combinedQuery) return true;
    return (
      task.title.toLowerCase().includes(combinedQuery) ||
      task.code.toLowerCase().includes(combinedQuery) ||
      task.category.toLowerCase().includes(combinedQuery)
    );
  });
}

export function groupTasksByStatus(tasks: TaskItem[]): Record<TaskStatus, TaskItem[]> {
  return {
    Backlog: tasks.filter((t) => t.status === 'Backlog'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    'In Review': tasks.filter((t) => t.status === 'In Review'),
    Done: tasks.filter((t) => t.status === 'Done'),
  };
}

export function getNextUpEvent(
  events: CalendarEvent[],
  projects: Project[]
): CalendarEvent | null {
  const now = new Date();
  const todayIso = getTodayIsoDate();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const deadlineEvents = createProjectDeadlineEvents(projects);
  const allEvents = [...events, ...deadlineEvents];

  const upcoming = allEvents.filter((e) => {
    if (e.date > todayIso) return true;
    if (e.date === todayIso && e.startTime >= currentHHMM) return true;
    return false;
  });

  upcoming.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return upcoming[0] || allEvents[0] || null;
}

export function filterCalendarEvents(
  events: CalendarEvent[],
  categoryFilter: 'All' | EventCategory,
  searchQuery: string
): CalendarEvent[] {
  const q = searchQuery.trim().toLowerCase();
  return events.filter((evt) => {
    const matchesCat = categoryFilter === 'All' || evt.category === categoryFilter;
    const matchesQuery =
      !q || evt.title.toLowerCase().includes(q) || evt.location.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });
}

export function computeEventsByDateMap(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  events.forEach((evt) => {
    const list = map.get(evt.date) || [];
    list.push(evt);
    map.set(evt.date, list);
  });
  for (const [, list] of map.entries()) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return map;
}

export function getRingsProjects(
  projects: Project[],
  tasks: TaskItem[]
): Array<{ project: Project; progress: number }> {
  const unfinished = projects.filter((p) => getProjectStatus(p, tasks) !== 'Ended');
  unfinished.sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  return unfinished.slice(0, MAX_RINGS_PROJECTS).map((p) => ({
    project: p,
    progress: getProjectProgress(p, tasks),
  }));
}

export interface WeeklyOutputColumn {
  label: string;
  weekdayIndex: number;
  seconds: number;
  hours: number;
  sessionsCount: number;
  isToday: boolean;
  isWeekend: boolean;
}

export function computeWeeklyOutputData(
  focusSessions: FocusSession[],
  weekStart: WeekStart
): {
  columns: WeeklyOutputColumn[];
  maxSeconds: number;
  totalWeekSeconds: number;
  totalSessionsCount: number;
} {
  const todayJsDay = new Date().getDay();
  const baseOrder =
    weekStart === 'sunday'
      ? [
          { label: 'S', weekdayIndex: 0 },
          { label: 'M', weekdayIndex: 1 },
          { label: 'T', weekdayIndex: 2 },
          { label: 'W', weekdayIndex: 3 },
          { label: 'T', weekdayIndex: 4 },
          { label: 'F', weekdayIndex: 5 },
          { label: 'S', weekdayIndex: 6 },
        ]
      : [
          { label: 'M', weekdayIndex: 1 },
          { label: 'T', weekdayIndex: 2 },
          { label: 'W', weekdayIndex: 3 },
          { label: 'T', weekdayIndex: 4 },
          { label: 'F', weekdayIndex: 5 },
          { label: 'S', weekdayIndex: 6 },
          { label: 'S', weekdayIndex: 0 },
        ];

  const currentWeekSessions = focusSessions.filter((s) => {
    const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
    return dAgo >= 0 && dAgo < 7;
  });

  const columns: WeeklyOutputColumn[] = baseOrder.map((col) => {
    const colSessions = currentWeekSessions.filter((s) => s.weekdayIndex === col.weekdayIndex);
    const totalSeconds = colSessions.reduce((acc, s) => {
      if (typeof s.seconds === 'number') return acc + Math.round(s.seconds);
      return acc + Math.round((s.hours || 0) * SECONDS_PER_HOUR);
    }, 0);
    return {
      ...col,
      seconds: totalSeconds,
      hours: totalSeconds / SECONDS_PER_HOUR,
      sessionsCount: colSessions.length,
      isToday: col.weekdayIndex === todayJsDay,
      isWeekend: col.weekdayIndex === 0 || col.weekdayIndex === 6,
    };
  });

  const maxSeconds = Math.max(
    4.5 * SECONDS_PER_HOUR,
    ...columns.map((c) => c.seconds),
    1
  );
  const totalWeekSeconds = columns.reduce((sum, col) => sum + col.seconds, 0);
  const totalSessionsCount = columns.reduce((sum, col) => sum + col.sessionsCount, 0);

  return {
    columns,
    maxSeconds,
    totalWeekSeconds,
    totalSessionsCount,
  };
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

function getSessionSeconds(session: FocusSession): number {
  return typeof session.seconds === 'number'
    ? Math.round(session.seconds)
    : Math.round((session.hours || 0) * SECONDS_PER_HOUR);
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

  const cycleValues = tasksCompletedInRange
    .map((t) => getTaskCycleDays(t))
    .filter((v) => v > 0);
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

  let runningPctSum = 0;
  const projectFocusSlices = rawSlices.map((s, idx) => {
    if (totalSliceSeconds === 0) return { ...s, pct: 0 };
    if (idx === rawSlices.length - 1) {
      return { ...s, pct: Math.max(0, 100 - runningPctSum) };
    }
    const pct = Math.round((s.seconds / totalSliceSeconds) * 100);
    runningPctSum += pct;
    return { ...s, pct };
  });

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
  let statusPctSum = 0;
  const statusComposition = statusOrder.map((st, idx) => {
    const count = tasks.filter((t) => t.status === st.status).length;
    if (totalTasksCount === 0) return { ...st, count, pct: 0 };
    if (idx === statusOrder.length - 1) {
      return { ...st, count, pct: Math.max(0, 100 - statusPctSum) };
    }
    const pct = Math.round((count / totalTasksCount) * 100);
    statusPctSum += pct;
    return { ...st, count, pct };
  });

  const contributorRows = team
    .map((member) => {
      const completedCount = tasksCompletedInRange.filter(
        (t) => t.assigneeId === member.id
      ).length;
      const memberSeconds = sessionsInRange
        .filter((s) => s.memberId === member.id)
        .reduce((acc, s) => acc + getSessionSeconds(s), 0);
      const focusHours = Number((memberSeconds / SECONDS_PER_HOUR).toFixed(1));
      const shareOfCompletedPct =
        tasksCompletedCount > 0 ? Math.round((completedCount / tasksCompletedCount) * 100) : 0;
      return {
        member,
        completedCount,
        focusHours,
        focusSeconds: memberSeconds,
        shareOfCompletedPct,
      };
    })
    .sort((a, b) => b.completedCount - a.completedCount || b.focusSeconds - a.focusSeconds);

  const maxContributorCompleted = Math.max(
    1,
    ...contributorRows.map((r) => r.completedCount)
  );

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
