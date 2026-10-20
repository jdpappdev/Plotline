import { StateCreator } from 'zustand';
import type { NotificationsSlice, PlotlineState } from '../sliceTypes';
import { NOTIFICATION_READ_IDS_STORAGE_KEY } from '../persistence';
import { deriveNotifications } from '../../domain/derivations/notifications';

export function loadPersistedReadNotificationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_READ_IDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return Array.from(
          new Set(parsed.filter((item): item is string => typeof item === 'string'))
        );
      }
    }
  } catch {
    // Ignore
  }
  return [];
}

export function savePersistedReadNotificationIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      NOTIFICATION_READ_IDS_STORAGE_KEY,
      JSON.stringify(Array.from(new Set(ids)))
    );
  } catch {
    // Ignore
  }
}

export const createNotificationsSlice: StateCreator<PlotlineState, [], [], NotificationsSlice> = (
  set,
  get
) => {
  const markNotificationRead = (id: string) => {
    set((state) => {
      const nextRead = state.readNotificationIds.includes(id)
        ? state.readNotificationIds
        : [...state.readNotificationIds, id];
      const derived = deriveNotifications(state.tasks, state.events, state.eventLog, [], nextRead);
      const nextUnread = derived.filter((n) => !n.read).map((n) => n.id);
      savePersistedReadNotificationIds(nextRead);
      return {
        readNotificationIds: nextRead,
        unreadNotificationIds: nextUnread,
      };
    });
  };

  const markAllNotificationsRead = (ids?: string[]) => {
    set((state) => {
      const allDerived = deriveNotifications(
        state.tasks,
        state.events,
        state.eventLog,
        [],
        state.readNotificationIds
      );
      const targetIds = ids && ids.length > 0 ? ids : allDerived.map((n) => n.id);
      const nextRead = Array.from(new Set([...state.readNotificationIds, ...targetIds]));
      const nextUnread = allDerived.map((n) => n.id).filter((nid) => !nextRead.includes(nid));
      savePersistedReadNotificationIds(nextRead);
      return {
        readNotificationIds: nextRead,
        unreadNotificationIds: nextUnread,
      };
    });
  };

  const syncNotifications = () => {
    const state = get();
    const derived = deriveNotifications(
      state.tasks,
      state.events,
      state.eventLog,
      [],
      state.readNotificationIds
    );
    const nextUnread = derived.filter((n) => !n.read).map((n) => n.id);
    if (
      nextUnread.length !== state.unreadNotificationIds.length ||
      nextUnread.some((id, idx) => state.unreadNotificationIds[idx] !== id)
    ) {
      set({ unreadNotificationIds: nextUnread });
    }
  };

  return {
    unreadNotificationIds: [],
    readNotificationIds: loadPersistedReadNotificationIds(),
    markNotificationRead,
    markAllNotificationsRead,
    markAsRead: markNotificationRead,
    markAllAsRead: markAllNotificationsRead,
    syncNotifications,
  };
};
