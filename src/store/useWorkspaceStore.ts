import { create } from 'zustand';
import { validateWorkspace } from '../domain/validation';
import { loadWorkspaceStorage } from '../lib/storage';
import { createEventsSlice } from './eventsSlice';
import { createPreferencesSlice } from './preferencesSlice';
import { createProjectsSlice } from './projectsSlice';
import { createTasksSlice } from './tasksSlice';
import { createTeamSlice } from './teamSlice';
import { createTimerSlice } from './timerSlice';
import type { WorkspaceState } from './types';
import { createUiSlice } from './uiSlice';

export const useWorkspaceStore = create<WorkspaceState>()((...args) => {
  const initial = loadWorkspaceStorage();

  if (typeof window !== 'undefined') {
    setTimeout(() => {
      validateWorkspace(
        initial.projects,
        initial.tasks,
        initial.team,
        initial.events,
        initial.focusSessions
      );
    }, 100);
  }

  return {
    ...createProjectsSlice(initial.projects)(...args),
    ...createTasksSlice(initial.tasks)(...args),
    ...createTeamSlice(initial.team, initial.currentUser)(...args),
    ...createEventsSlice(initial.events, initial.checkedInEventIds)(...args),
    ...createTimerSlice(initial.focusSessions)(...args),
    ...createPreferencesSlice({
      notifications: initial.notifications,
      accent: initial.accent,
      weekStart: initial.weekStart,
      railCollapsed: initial.railCollapsed,
      isSignedOut: initial.isSignedOut,
    })(...args),
    ...createUiSlice(...args),
  };
});
