import type {
  AccentName,
  CalendarEvent,
  FocusSession,
  NotificationSettings,
  Project,
  TaskItem,
  TeamMember,
  WeekStart,
} from '../domain/types';
import { createSeedEvents } from '../domain/seed/eventsSeed';
import { createSeedProjects } from '../domain/seed/projectsSeed';
import { createSeedFocusSessions } from '../domain/seed/sessionsSeed';
import { createSeedTasks } from '../domain/seed/tasksSeed';
import { SEED_TEAM } from '../domain/seed/teamSeed';
import { dedupeById } from './format';
import { applyAccentCssVariables, normalizeAccent } from './theme';

export const WORKSPACE_SCHEMA_VERSION = 7;
export const WORKSPACE_STORAGE_KEY = 'plotline-workspace-v7';

const SECONDS_PER_HOUR = 3600;

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailDigests: true,
  milestoneAlerts: true,
  taskMentions: true,
  focusReminders: false,
  weeklyReport: true,
};

export interface PersistedWorkspaceData {
  schemaVersion: number;
  projects: Project[];
  tasks: TaskItem[];
  team: TeamMember[];
  events: CalendarEvent[];
  focusSessions: FocusSession[];
  notifications: NotificationSettings;
  accent: AccentName;
  weekStart: WeekStart;
  railCollapsed: boolean;
  checkedInEventIds: string[];
  currentUser: TeamMember;
  isSignedOut: boolean;
}

export function createSeedWorkspaceData(
  overrides?: Partial<
    Pick<
      PersistedWorkspaceData,
      'accent' | 'weekStart' | 'railCollapsed' | 'notifications' | 'isSignedOut'
    >
  >
): PersistedWorkspaceData {
  const projects = createSeedProjects();
  const tasks = createSeedTasks();
  const team = [...SEED_TEAM];
  const events = createSeedEvents(projects);
  const focusSessions = createSeedFocusSessions(tasks, projects);
  const accent = overrides?.accent ?? 'tide';

  applyAccentCssVariables(accent);

  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    projects,
    tasks,
    team,
    events,
    focusSessions,
    notifications: overrides?.notifications ?? { ...DEFAULT_NOTIFICATIONS },
    accent,
    weekStart: overrides?.weekStart ?? 'monday',
    railCollapsed: overrides?.railCollapsed ?? false,
    checkedInEventIds: [],
    currentUser: team[0],
    isSignedOut: overrides?.isSignedOut ?? false,
  };
}

function hasInvalidSessions(sessions: FocusSession[]): boolean {
  return sessions.some((s) => {
    const parts = (s.date || '').split('-').map(Number);
    const day =
      parts.length === 3
        ? new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getDay()
        : s.weekdayIndex;
    return day === 0 || day === 6 || s.weekdayIndex === 0 || s.weekdayIndex === 6;
  });
}

function syncTaskLoggedSeconds(tasks: TaskItem[], sessions: FocusSession[]): TaskItem[] {
  return tasks.map((task) => {
    const loggedSeconds = sessions
      .filter((s) => s.taskId === task.id)
      .reduce(
        (acc, s) =>
          acc +
          (typeof s.seconds === 'number'
            ? Math.round(s.seconds)
            : Math.round((s.hours || 0) * SECONDS_PER_HOUR)),
        0
      );
    return {
      ...task,
      loggedSeconds,
    };
  });
}

function isValidEnvelope(raw: unknown): raw is PersistedWorkspaceData {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<PersistedWorkspaceData>;
  if (candidate.schemaVersion !== WORKSPACE_SCHEMA_VERSION) return false;
  if (!Array.isArray(candidate.projects) || candidate.projects.length === 0) return false;
  if (!Array.isArray(candidate.tasks) || candidate.tasks.length === 0) return false;
  if (!Array.isArray(candidate.team) || candidate.team.length === 0) return false;
  if (!Array.isArray(candidate.events)) return false;
  if (!Array.isArray(candidate.focusSessions) || candidate.focusSessions.length === 0) {
    return false;
  }
  if (hasInvalidSessions(candidate.focusSessions)) return false;
  return true;
}

export function loadWorkspaceStorage(): PersistedWorkspaceData {
  if (typeof window === 'undefined') {
    return createSeedWorkspaceData();
  }

  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidEnvelope(parsed)) {
        const accent = normalizeAccent(parsed.accent);
        applyAccentCssVariables(accent);
        const deduplicatedSessions = dedupeById(parsed.focusSessions);
        const syncedTasks = syncTaskLoggedSeconds(dedupeById(parsed.tasks), deduplicatedSessions);
        const deduplicatedTeam = dedupeById(parsed.team);
        return {
          schemaVersion: WORKSPACE_SCHEMA_VERSION,
          projects: dedupeById(parsed.projects),
          tasks: syncedTasks,
          team: deduplicatedTeam,
          events: dedupeById(parsed.events),
          focusSessions: deduplicatedSessions,
          notifications: { ...DEFAULT_NOTIFICATIONS, ...parsed.notifications },
          accent,
          weekStart: parsed.weekStart === 'sunday' ? 'sunday' : 'monday',
          railCollapsed: Boolean(parsed.railCollapsed),
          checkedInEventIds: Array.isArray(parsed.checkedInEventIds)
            ? parsed.checkedInEventIds
            : [],
          currentUser: parsed.currentUser || deduplicatedTeam[0] || SEED_TEAM[0],
          isSignedOut: Boolean(parsed.isSignedOut),
        };
      }
    }
  } catch {
    // Fall through to reseed on corrupt storage or version mismatch
  }

  const seeded = createSeedWorkspaceData();
  saveWorkspaceStorage(seeded);
  return seeded;
}

export function saveWorkspaceStorage(state: Partial<PersistedWorkspaceData>): void {
  if (typeof window === 'undefined') return;
  try {
    const existingRaw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    const existing: Partial<PersistedWorkspaceData> = existingRaw
      ? (JSON.parse(existingRaw) as Partial<PersistedWorkspaceData>)
      : {};
    const merged: Partial<PersistedWorkspaceData> = {
      ...existing,
      ...state,
      schemaVersion: WORKSPACE_SCHEMA_VERSION,
    };
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Ignore quota errors in restricted environments
  }
}

export function resetWorkspaceStorage(
  preservedPreferences?: Pick<
    PersistedWorkspaceData,
    'accent' | 'weekStart' | 'railCollapsed' | 'notifications'
  >
): PersistedWorkspaceData {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  const fresh = createSeedWorkspaceData(preservedPreferences);
  saveWorkspaceStorage(fresh);
  return fresh;
}
