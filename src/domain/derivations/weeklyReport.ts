import { FocusSession, Project, TaskItem } from '../types';
import { computeDaysAgoFromIso, getSessionSeconds, SECONDS_PER_HOUR } from './time';
import { isTaskCompletedInRange } from './tasks';

export const WEEKLY_REPORT_HEADERS = [
  'Task Title',
  'Project',
  'Category',
  'Completion Date',
  'Logged Hours',
] as const;

export interface WeeklyReportRow {
  taskTitle: string;
  project: string;
  category: string;
  completionDate: string;
  loggedHours: number;
}

export function escapeCsvCell(value: string | number | null | undefined): string {
  const text = String(value ?? '');
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function deriveWeeklyReportRows(
  tasks: TaskItem[],
  projects: Project[],
  focusSessions: FocusSession[]
): WeeklyReportRow[] {
  const projectMap = new Map<string, string>();
  for (const project of projects) {
    if (project && typeof project.id === 'string') {
      projectMap.set(project.id, project.name);
    }
  }

  const sessionsInWindowByTask = new Map<string, number>();
  for (const session of focusSessions) {
    if (!session || typeof session.taskId !== 'string') continue;
    const daysAgo = computeDaysAgoFromIso(session.date);
    if (daysAgo >= 0 && daysAgo < 7) {
      const secs = getSessionSeconds(session);
      if (secs > 0) {
        sessionsInWindowByTask.set(
          session.taskId,
          (sessionsInWindowByTask.get(session.taskId) ?? 0) + secs
        );
      }
    }
  }

  const seenTaskIds = new Set<string>();
  const rows: WeeklyReportRow[] = [];

  for (const task of tasks) {
    if (!task || typeof task.id !== 'string' || seenTaskIds.has(task.id)) continue;
    seenTaskIds.add(task.id);

    const completedInWindow = isTaskCompletedInRange(task, 0, 7);
    const windowSessionSeconds = sessionsInWindowByTask.get(task.id) ?? 0;

    if (!completedInWindow && windowSessionSeconds <= 0) {
      continue;
    }

    const totalSeconds =
      windowSessionSeconds > 0 ? windowSessionSeconds : Math.max(0, task.loggedSeconds ?? 0);
    const loggedHours = Number((totalSeconds / SECONDS_PER_HOUR).toFixed(2));
    const projectName = projectMap.get(task.projectId) || task.projectId || 'Unassigned';
    const completionDate = task.status === 'Done' && task.completedDate ? task.completedDate : '';

    rows.push({
      taskTitle: task.title,
      project: projectName,
      category: task.category || 'General',
      completionDate,
      loggedHours,
    });
  }

  return rows;
}

export function generateWeeklyReportCsv(
  tasks: TaskItem[],
  projects: Project[],
  focusSessions: FocusSession[]
): string {
  const rows = deriveWeeklyReportRows(tasks, projects, focusSessions);
  const headerLine = WEEKLY_REPORT_HEADERS.map((h) => escapeCsvCell(h)).join(',');
  if (rows.length === 0) {
    return headerLine;
  }

  const dataLines = rows.map((row) =>
    [
      escapeCsvCell(row.taskTitle),
      escapeCsvCell(row.project),
      escapeCsvCell(row.category),
      escapeCsvCell(row.completionDate),
      escapeCsvCell(row.loggedHours),
    ].join(',')
  );

  return [headerLine, ...dataLines].join('\r\n');
}
