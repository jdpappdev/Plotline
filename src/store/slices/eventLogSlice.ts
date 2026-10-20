import { StateCreator } from 'zustand';
import type { EventLogSlice, PlotlineState } from '../sliceTypes';
import type { EventLogEntry } from '../../domain/notifications';
import { getNowTimestamp } from '../../lib/clock';
import { EVENT_LOG_STORAGE_KEY } from '../persistence';

export function loadPersistedEventLog(): EventLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(EVENT_LOG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is EventLogEntry =>
          Boolean(item && typeof item.id === 'string' && typeof item.taskId === 'string')
        );
      }
    }
  } catch {
    // Ignore
  }
  return [];
}

export function savePersistedEventLog(entries: EventLogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EVENT_LOG_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore
  }
}

export const createEventLogSlice: StateCreator<PlotlineState, [], [], EventLogSlice> = (set) => ({
  eventLog: loadPersistedEventLog(),
  recordAssignmentEvent: (taskId, prevAssigneeId, nextAssigneeId) => {
    if (prevAssigneeId === nextAssigneeId) return;
    const nowTs = getNowTimestamp();
    const newEvent: EventLogEntry = {
      id: `evt-asgn-${nowTs}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'AssignmentChanged',
      taskId,
      prevAssigneeId,
      nextAssigneeId,
      timestamp: nowTs,
    };
    set((state) => {
      const next = [...state.eventLog, newEvent];
      savePersistedEventLog(next);
      return { eventLog: next };
    });
  },
  recordMovementEvent: (taskId, prevStatus, nextStatus) => {
    if (prevStatus === nextStatus) return;
    const nowTs = getNowTimestamp();
    const newEvent: EventLogEntry = {
      id: `evt-mov-${nowTs}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'StatusChanged',
      taskId,
      prevStatus,
      nextStatus,
      timestamp: nowTs,
    };
    set((state) => {
      const next = [...state.eventLog, newEvent];
      savePersistedEventLog(next);
      return { eventLog: next };
    });
  },
});
