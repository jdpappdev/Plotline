import type { AccentName, NotificationSettings, WeekStart } from '../domain/types';
import { saveWorkspaceStorage } from '../lib/storage';
import { ACCENT_THEMES, applyAccentCssVariables, normalizeAccent } from '../lib/theme';
import type { PreferencesSlice, WorkspaceSliceCreator } from './types';

export function createPreferencesSlice(initial: {
  notifications: NotificationSettings;
  accent: AccentName;
  weekStart: WeekStart;
  railCollapsed: boolean;
  isSignedOut: boolean;
}): WorkspaceSliceCreator<PreferencesSlice> {
  return (set, get) => ({
    notifications: initial.notifications,
    accent: initial.accent,
    weekStart: initial.weekStart,
    railCollapsed: initial.railCollapsed,
    isSignedOut: initial.isSignedOut,

    setAccent: (rawAccent, showToast = false) => {
      const normalized = normalizeAccent(rawAccent);
      saveWorkspaceStorage({ accent: normalized });
      applyAccentCssVariables(normalized);
      set({ accent: normalized });
      if (showToast) {
        const theme = ACCENT_THEMES[normalized];
        get().pushToast(`Accent set to ${theme.label}`, theme.description);
      }
    },

    setWeekStart: (weekStart, showToast = false) => {
      saveWorkspaceStorage({ weekStart });
      set({ weekStart });
      if (showToast) {
        get().pushToast(
          `Week start set to ${weekStart === 'monday' ? 'Monday' : 'Sunday'}`,
          'Calendar grid and Weekly Output columns updated.'
        );
      }
    },

    setRailCollapsed: (railCollapsed) => {
      saveWorkspaceStorage({ railCollapsed });
      set({ railCollapsed });
    },

    toggleRail: () =>
      set((state) => {
        const next = !state.railCollapsed;
        saveWorkspaceStorage({ railCollapsed: next });
        return { railCollapsed: next };
      }),

    toggleNotification: (key) => {
      const state = get();
      const next: NotificationSettings = {
        ...state.notifications,
        [key]: !state.notifications[key],
      };
      saveWorkspaceStorage({ notifications: next });
      set({ notifications: next });
    },

    setSignedOut: (isSignedOut) => {
      saveWorkspaceStorage({ isSignedOut });
      set({ isSignedOut });
    },
  });
}
