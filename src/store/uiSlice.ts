import { validateWorkspace } from '../domain/validation';
import { resetWorkspaceStorage, saveWorkspaceStorage } from '../lib/storage';
import type { UiSlice, WorkspaceSliceCreator } from './types';

const TOAST_DEFAULT_DURATION_MS = 4200;
const TOAST_UNDO_DURATION_MS = 6000;
const DEFAULT_TIMER_TASK_ID = 'tsk-h-5';

export const createUiSlice: WorkspaceSliceCreator<UiSlice> = (set, get) => ({
  activeRoute: 'Dashboard',
  searchQuery: '',
  toasts: [],
  newProjectModalOpen: false,
  newTaskModalOpen: false,
  commandPaletteOpen: false,
  selectedProfileMemberId: null,
  selectedProjectIdForDialog: null,
  importModalOpen: false,
  tourStep: null,

  setActiveRoute: (activeRoute) => set({ activeRoute }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setNewProjectModalOpen: (newProjectModalOpen) => set({ newProjectModalOpen }),
  setNewTaskModalOpen: (newTaskModalOpen) => set({ newTaskModalOpen }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setSelectedProfileMemberId: (selectedProfileMemberId) => set({ selectedProfileMemberId }),
  openProjectDialog: (id) => set({ selectedProjectIdForDialog: id }),
  setImportModalOpen: (importModalOpen) => set({ importModalOpen }),
  setTourStep: (tourStep) => set({ tourStep }),

  pushToast: (title, detail) => {
    const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, detail }],
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, TOAST_DEFAULT_DURATION_MS);
  },

  pushToastWithUndo: (title, detail, undoAction) => {
    const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, detail, undoAction }],
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, TOAST_UNDO_DURATION_MS);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  restoreSnapshot: (snapshot) => {
    saveWorkspaceStorage({
      projects: snapshot.projects,
      tasks: snapshot.tasks,
      team: snapshot.team,
      events: snapshot.events,
      focusSessions: snapshot.focusSessions,
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
    });

    get().pushToast('Deletion undone', 'Restored dataset record.');
  },

  resetDemoData: () => {
    const current = get();
    const fresh = resetWorkspaceStorage({
      accent: current.accent,
      weekStart: current.weekStart,
      railCollapsed: current.railCollapsed,
      notifications: current.notifications,
    });

    set({
      projects: fresh.projects,
      tasks: fresh.tasks,
      team: fresh.team,
      events: fresh.events,
      focusSessions: fresh.focusSessions,
      checkedInEventIds: [],
      timerSeconds: 0,
      timerRunning: false,
      timerTaskId: DEFAULT_TIMER_TASK_ID,
    });

    validateWorkspace(
      fresh.projects,
      fresh.tasks,
      fresh.team,
      fresh.events,
      fresh.focusSessions
    );
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
});
