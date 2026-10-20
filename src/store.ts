import { create } from 'zustand';
import { contourGlyph } from './utils/contourGlyph';

export { contourGlyph };

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).contourGlyph = contourGlyph;
}

import { ACCENT_THEMES } from './domain/types';

import type {
  AccentName,
  WeekStart,
  RouteId,
  Department,
  PresenceStatus,
  EventCategory,
  AccentDefinition,
  TeamMember,
  Project,
  TaskItem,
  FocusSession,
  CalendarEvent,
  NotificationSettings,
  ToastNotice,
  NewProjectInput,
  NewTaskInput,
  NewMemberInput,
  NewEventInput,
  UpdateProfileInput,
  ValidationCheckResult,
  WorkspaceValidationReport,
} from './domain/types';

export { ACCENT_THEMES };

export type {
  AccentName,
  WeekStart,
  RouteId,
  Department,
  PresenceStatus,
  EventCategory,
  AccentDefinition,
  TeamMember,
  Project,
  TaskItem,
  FocusSession,
  CalendarEvent,
  NotificationSettings,
  ToastNotice,
  NewProjectInput,
  NewTaskInput,
  NewMemberInput,
  NewEventInput,
  UpdateProfileInput,
  ValidationCheckResult,
  WorkspaceValidationReport,
};

export interface StoreSnapshot {
  projects: Project[];
  tasks: TaskItem[];
  team: TeamMember[];
  events: CalendarEvent[];
  focusSessions: FocusSession[];
  timerRunning: boolean;
  timerSeconds: number;
  timerTaskId: string;
  focusPromptFired?: boolean;
}

import {
  TASKS_STORAGE_KEY,
  PROJECTS_STORAGE_KEY,
  TEAM_STORAGE_KEY,
  EVENTS_STORAGE_KEY,
  FOCUS_SESSIONS_STORAGE_KEY,
  CHECKED_IN_EVENTS_STORAGE_KEY,
  NOTIFICATION_READ_IDS_STORAGE_KEY,
  EVENT_LOG_STORAGE_KEY,
  TIMER_STATE_STORAGE_KEY,
  loadPersistedProjects,
  savePersistedProjects,
  loadPersistedTasks,
  savePersistedTasks,
} from './store/persistence';

import { computeInitials } from './utils/string';
export { computeInitials };

import {
  SEED_TEAM,
  createSeedProjects,
  createSeedTasks,
  createSeedFocusSessions,
  createSeedEvents,
  validateWorkspace,
  dedupeById,
} from './domain/seed/index';

export {
  SEED_TEAM,
  createSeedProjects,
  createSeedTasks,
  createSeedFocusSessions,
  createSeedEvents,
  validateWorkspace,
  dedupeById,
};

import { createProjectsSlice } from './store/slices/projectsSlice';
import { createTasksSlice } from './store/slices/tasksSlice';
import {
  createTeamSlice,
  loadPersistedTeam,
  savePersistedTeam,
  loadInitialCurrentUser,
} from './store/slices/teamSlice';
import {
  createCalendarSlice,
  loadPersistedEvents,
  savePersistedEvents,
} from './store/slices/calendarSlice';
import {
  createTimerSlice,
  loadPersistedFocusSessions,
  savePersistedFocusSessions,
  savePersistedTimerState,
  FOCUS_PROMPT_THRESHOLD_SECONDS,
} from './store/slices/timerSlice';
import {
  createUISlice,
  normalizeAccent,
  applyAccentCssVariables,
  loadInitialAccent,
  loadInitialWeekStart,
  loadInitialSignedOut,
  loadInitialRailCollapsed,
  loadInitialNotifications,
} from './store/slices/uiSlice';
import { createEventLogSlice } from './store/slices/eventLogSlice';
import { createNotificationsSlice } from './store/slices/notificationsSlice';

import type {
  ProjectsSlice,
  TasksSlice,
  TeamSlice,
  CalendarSlice,
  TimerSlice,
  UISlice,
  EventLogSlice,
  NotificationsSlice,
  PlotlineState,
} from './store/sliceTypes';

export type {
  ProjectsSlice,
  TasksSlice,
  TeamSlice,
  CalendarSlice,
  TimerSlice,
  UISlice,
  EventLogSlice,
  NotificationsSlice,
  PlotlineState,
};

export {
  loadPersistedProjects,
  savePersistedProjects,
  loadPersistedTasks,
  savePersistedTasks,
  loadPersistedTeam,
  savePersistedTeam,
  loadPersistedEvents,
  savePersistedEvents,
  loadPersistedFocusSessions,
  savePersistedFocusSessions,
  createUISlice,
  normalizeAccent,
  applyAccentCssVariables,
  loadInitialAccent,
  loadInitialWeekStart,
  loadInitialSignedOut,
  loadInitialRailCollapsed,
  loadInitialNotifications,
};

export const usePlotlineStore = create<PlotlineState>((set, get, api) => {
  const initialProjects = loadPersistedProjects();
  const initialTasks = loadPersistedTasks();
  const initialTeam = loadPersistedTeam();
  const initialEvents = loadPersistedEvents(initialProjects);
  const initialFocusSessions = loadPersistedFocusSessions(initialTasks);

  // Run validation check on startup
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      validateWorkspace(
        initialProjects,
        initialTasks,
        initialTeam,
        initialEvents,
        initialFocusSessions
      );
    }, 100);
  }

  return {
    ...createProjectsSlice(set, get, api),
    ...createTasksSlice(initialTasks)(set, get, api),
    ...createTeamSlice(initialTeam, loadInitialCurrentUser())(set, get, api),
    ...createCalendarSlice(initialEvents)(set, get, api),
    ...createTimerSlice(initialFocusSessions)(set, get, api),
    ...createUISlice(set, get, api),
    ...createEventLogSlice(set, get, api),
    ...createNotificationsSlice(set, get, api),

    restoreSnapshot: (snapshot) => {
      const nextFired =
        snapshot.focusPromptFired !== undefined
          ? snapshot.focusPromptFired
          : snapshot.timerSeconds >= FOCUS_PROMPT_THRESHOLD_SECONDS;

      savePersistedProjects(snapshot.projects);
      savePersistedTasks(snapshot.tasks);
      savePersistedTeam(snapshot.team);
      savePersistedEvents(snapshot.events);
      savePersistedFocusSessions(snapshot.focusSessions);
      savePersistedTimerState({
        timerSeconds: snapshot.timerSeconds,
        timerRunning: snapshot.timerRunning,
        timerTaskId: snapshot.timerTaskId,
        focusPromptFired: nextFired,
      });

      set({
        projects: snapshot.projects,
        tasks: snapshot.tasks,
        team: snapshot.team,
        events: snapshot.events,
        focusSessions: snapshot.focusSessions,
        timerRunning: snapshot.timerRunning,
        timerSeconds: snapshot.timerSeconds,
        timerTaskId: snapshot.timerTaskId,
        focusPromptFired: nextFired,
      });

      get().pushToast('Deletion undone', 'Restored dataset record.');
    },

    resetDemoData: () => {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(PROJECTS_STORAGE_KEY);
          window.localStorage.removeItem(TASKS_STORAGE_KEY);
          window.localStorage.removeItem(TEAM_STORAGE_KEY);
          window.localStorage.removeItem(EVENTS_STORAGE_KEY);
          window.localStorage.removeItem(FOCUS_SESSIONS_STORAGE_KEY);
          window.localStorage.removeItem(CHECKED_IN_EVENTS_STORAGE_KEY);
          window.localStorage.removeItem(NOTIFICATION_READ_IDS_STORAGE_KEY);
          window.localStorage.removeItem(EVENT_LOG_STORAGE_KEY);
          window.localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }

      const freshProjects = createSeedProjects();
      const freshTasks = createSeedTasks();
      const freshTeam = SEED_TEAM;
      const freshEvents = createSeedEvents(freshProjects);
      const freshSessions = createSeedFocusSessions(freshTasks);

      set({
        projects: freshProjects,
        tasks: freshTasks,
        team: freshTeam,
        events: freshEvents,
        focusSessions: freshSessions,
        checkedInEventIds: [],
        eventLog: [],
        readNotificationIds: [],
        unreadNotificationIds: [],
        timerSeconds: 0,
        timerRunning: false,
        timerTaskId: 'tsk-h-5',
        focusPromptFired: false,
      });

      validateWorkspace(freshProjects, freshTasks, freshTeam, freshEvents, freshSessions);
      get().pushToast('Demo data reset', 'Restored initial benchmark dataset.');
    },

    runValidationCheck: () => {
      const state = get();
      return validateWorkspace(
        state.projects,
        state.tasks,
        state.team,
        state.events,
        state.focusSessions
      );
    },
  };
});

export const useStore = usePlotlineStore;
