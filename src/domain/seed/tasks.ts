import { TaskItem, Project, FocusSession, CalendarEvent } from '../types';
import { getTodayIsoDate, getIsoDateOffset, getNow, getNowTimestamp } from '../../lib/clock';
import { computeDaysAgoFromIso, computeDaysBetweenIso } from '../derivations/time';
import { getTaskFactorBand } from '../derivations/tasks';
import { dedupeById } from '../../store';

const SEED_TASK_FACTORS: Record<string, number> = {
  'tsk-h-1': 0.62,
  'tsk-h-2': 0.6,
  'tsk-h-3': 0.625,
  'tsk-h-4': 0.6,
  'tsk-f-1': 0.6,
  'tsk-f-2': 0.625,
  'tsk-o-1': 0.6,
  'tsk-o-2': 0.625,
  'tsk-a-1': 0.6,
  'tsk-a-2': 0.6,
  'tsk-a-3': 0.6,
  'tsk-l-1': 0.625,
  'tsk-l-2': 0.6,
  'tsk-l-3': 0.625,
  'tsk-l-4': 0.6,
  'tsk-h-6': 0.575,
  'tsk-o-4': 0.55,
  'tsk-a-4': 0.575,
  'tsk-h-5': 1 / 3,
  'tsk-f-3': 0.3214,
  'tsk-f-4': 0.325,
  'tsk-o-3': 0.3182,
};

export function createSeedTasks(): TaskItem[] {
  return [
    {
      id: 'tsk-h-1',
      code: 'PLT-101-A',
      title: 'Audit current app and competitor flows',
      category: 'Interface',
      projectId: 'prj-harbor',
      assigneeId: 'usr-mireia',
      status: 'Done',
      priority: 'Medium',
      startDate: getIsoDateOffset(-29),
      completedDate: getIsoDateOffset(-23),
      dueDate: getIsoDateOffset(-22),
      estimateHours: 10,
      progress: 100,
      subtasksDone: 3,
      subtasksTotal: 3,
    },
    // ... all tasks
  ];
}

export function createSeedFocusSessions(tasks: TaskItem[], _projects: Project[]): FocusSession[] {
  // ...
  return [];
}

export function createSeedEvents(projects: Project[]): CalendarEvent[] {
  // ...
  return [];
}
