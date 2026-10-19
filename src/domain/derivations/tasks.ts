import { TaskItem } from '../types';
import { getIsoDateOffset, getTodayIsoDate } from '../../lib/clock';
import { computeDaysAgoFromIso, computeDaysBetweenIso } from './time';

const RECENT_DONE_CUTOFF_DAYS = -14;
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

export type TaskStatus = TaskItem['status'];
export type TaskFilterCriterion = 'my' | 'high' | 'week';

export function isDueWithinWeek(dueDateIso?: string): boolean {
  if (!dueDateIso) return false;
  const today = new Date(`${getTodayIsoDate()}T00:00:00`);
  const due = new Date(`${dueDateIso}T00:00:00`);
  if (Number.isNaN(due.getTime())) return false;
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
}

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

export function getTaskFactorBand(status: TaskStatus): [number, number] {
  switch (status) {
    case 'Done':
      return [0.55, 0.7];
    case 'In Review':
      return [0.5, 0.65];
    case 'In Progress':
      return [0.25, 0.4];
    case 'Backlog':
    default:
      return [0, 0];
  }
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

export function progressForTaskStatus(status: TaskStatus, currentProgress?: number): number {
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
