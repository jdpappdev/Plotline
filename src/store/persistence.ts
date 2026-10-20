import { Project, TaskItem } from '../domain/types';
import { dedupeById, createSeedProjects, createSeedTasks } from '../domain/seed/index';

export const ACCENT_STORAGE_KEY = 'plotline-accent-v3';
export const WEEK_START_STORAGE_KEY = 'plotline-week-start-v3';
export const TASKS_STORAGE_KEY = 'plotline-tasks-v6';
export const PROJECTS_STORAGE_KEY = 'plotline-projects-v6';
export const TEAM_STORAGE_KEY = 'plotline-team-v6';
export const EVENTS_STORAGE_KEY = 'plotline-events-v6';
export const FOCUS_SESSIONS_STORAGE_KEY = 'plotline-focus-sessions-v6';
export const NOTIFICATIONS_STORAGE_KEY = 'plotline-notifications-v3';
export const NOTIFICATION_READ_IDS_STORAGE_KEY = 'plotline-notification-read-ids-v1';
export const EVENT_LOG_STORAGE_KEY = 'plotline-event-log-v1';
export const TIMER_STATE_STORAGE_KEY = 'plotline-timer-state-v1';
export const CURRENT_USER_STORAGE_KEY = 'plotline-current-user-v3';
export const SIGNED_OUT_STORAGE_KEY = 'plotline-signed-out-v3';
export const RAIL_COLLAPSED_STORAGE_KEY = 'plotline-rail-collapsed-v3';
export const CHECKED_IN_EVENTS_STORAGE_KEY = 'plotline-checked-in-events-v3';

export function loadPersistedProjects(): Project[] {
  if (typeof window === 'undefined') return createSeedProjects();
  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some((p: Project) => p.id === 'prj-harbor')) {
        return dedupeById<Project>(parsed);
      }
    }
  } catch {
    // Ignore
  }
  return createSeedProjects();
}

export function savePersistedProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(dedupeById(projects)));
  } catch {
    // Ignore
  }
}

export function loadPersistedTasks(): TaskItem[] {
  if (typeof window === 'undefined') return createSeedTasks();
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some((t) => t.id === 'tsk-h-1' && Boolean(t.startDate))) {
        return dedupeById<TaskItem>(parsed);
      }
    }
  } catch {
    // Ignore
  }
  return createSeedTasks();
}

export function savePersistedTasks(tasks: TaskItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(dedupeById(tasks)));
  } catch {
    // Ignore
  }
}
