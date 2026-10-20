import { StateCreator } from 'zustand';
import { AccentName, WeekStart, NotificationSettings } from '../../domain/types';
import type { UISlice, PlotlineState } from '../sliceTypes';
import { ACCENT_THEMES } from '../../domain/types';
import { getNowTimestamp } from '../../lib/clock';
import {
  ACCENT_STORAGE_KEY,
  WEEK_START_STORAGE_KEY,
  NOTIFICATIONS_STORAGE_KEY,
  SIGNED_OUT_STORAGE_KEY,
  RAIL_COLLAPSED_STORAGE_KEY,
} from '../persistence';

export function normalizeAccent(value: string | null | undefined): AccentName {
  if (!value) return 'tide';
  const lower = value.toLowerCase().trim();
  if (lower === 'tide' || lower === 'moss' || lower === 'iris' || lower === 'signal') {
    return lower;
  }
  return 'tide';
}

export function applyAccentCssVariables(accent: AccentName): void {
  if (typeof document === 'undefined') return;
  const theme = ACCENT_THEMES[accent] || ACCENT_THEMES.tide;
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.hex);
  root.style.setProperty('--accent-mid', theme.midHex);
  root.style.setProperty('--accent-light', theme.lightHex);
  root.style.setProperty('--accent-deep', 'color-mix(in oklab, var(--accent) 68%, black)');
  root.style.setProperty(
    '--surface-accent',
    'linear-gradient(155deg, var(--accent) 0%, var(--accent-deep) 100%)'
  );
  root.style.setProperty('--accent-hover', theme.midHex);
  root.style.setProperty('--accent-soft', theme.softHex);
  root.style.setProperty('--accent-border', theme.borderHex);
  root.setAttribute('data-accent', theme.id);
}

export function loadInitialAccent(): AccentName {
  if (typeof window === 'undefined') return 'tide';
  try {
    const saved = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    const resolved = normalizeAccent(saved);
    applyAccentCssVariables(resolved);
    return resolved;
  } catch {
    return 'tide';
  }
}

export function loadInitialWeekStart(): WeekStart {
  if (typeof window === 'undefined') return 'monday';
  try {
    const saved = window.localStorage.getItem(WEEK_START_STORAGE_KEY);
    return saved === 'sunday' ? 'sunday' : 'monday';
  } catch {
    return 'monday';
  }
}

export function loadInitialSignedOut(): boolean {
  return false;
}

export function loadInitialRailCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(RAIL_COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailDigests: true,
  milestoneAlerts: true,
  taskMentions: true,
  focusReminders: false,
  weeklyReport: true,
};

export function loadInitialNotifications(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_NOTIFICATIONS;
}

export const createUISlice: StateCreator<PlotlineState, [], [], UISlice> = (set, get) => ({
  notifications: loadInitialNotifications(),
  accent: loadInitialAccent(),
  weekStart: loadInitialWeekStart(),
  activeRoute: 'Dashboard',
  railCollapsed: loadInitialRailCollapsed(),
  searchQuery: '',
  toasts: [],
  commandPaletteOpen: false,
  tourStep: null,
  isSignedOut: loadInitialSignedOut(),

  setAccent: (rawAccent, showToast = false) => {
    const normalized = normalizeAccent(rawAccent);
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, normalized);
    } catch {
      // Ignore
    }
    applyAccentCssVariables(normalized);
    set({ accent: normalized });
    if (showToast) {
      const label = ACCENT_THEMES[normalized].label;
      get().pushToast(`Accent set to ${label}`, ACCENT_THEMES[normalized].description);
    }
  },

  setWeekStart: (weekStart, showToast = false) => {
    try {
      window.localStorage.setItem(WEEK_START_STORAGE_KEY, weekStart);
    } catch {
      // Ignore
    }
    set({ weekStart });
    if (showToast) {
      get().pushToast(
        `Week start set to ${weekStart === 'monday' ? 'Monday' : 'Sunday'}`,
        'Calendar grid and Weekly Output columns updated.'
      );
    }
  },

  setActiveRoute: (activeRoute) => set({ activeRoute }),

  setSignedOut: (isSignedOut) => {
    try {
      window.localStorage.setItem(SIGNED_OUT_STORAGE_KEY, String(isSignedOut));
    } catch {
      // Ignore
    }
    set({ isSignedOut });
  },

  toggleNotification: (key) => {
    const state = get();
    const next: NotificationSettings = {
      ...state.notifications,
      [key]: !state.notifications[key],
    };
    try {
      window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
    set({ notifications: next });
  },

  setRailCollapsed: (railCollapsed) => {
    try {
      window.localStorage.setItem(RAIL_COLLAPSED_STORAGE_KEY, String(railCollapsed));
    } catch {
      // Ignore
    }
    set({ railCollapsed });
  },

  toggleRail: () =>
    set((state) => {
      const next = !state.railCollapsed;
      try {
        window.localStorage.setItem(RAIL_COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // Ignore
      }
      return { railCollapsed: next };
    }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

  setTourStep: (tourStep) => set({ tourStep }),

  pushToast: (title, detail) => {
    const id = `tst-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, detail }],
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 4200);
  },

  pushToastWithUndo: (title, detail, undoAction) => {
    const id = `tst-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, detail, undoAction }],
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 6000);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
});
