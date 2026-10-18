import type { CalendarEvent, StoreSnapshot } from '../domain/types';
import { dedupeById } from '../lib/format';
import { saveWorkspaceStorage } from '../lib/storage';
import type { EventsSlice, WorkspaceSliceCreator } from './types';

export function createEventsSlice(
  initialEvents: CalendarEvent[],
  initialCheckedInEventIds: string[]
): WorkspaceSliceCreator<EventsSlice> {
  return (set, get) => ({
    events: initialEvents,
    checkedInEventIds: initialCheckedInEventIds,

    addEvent: (input) => {
      const snapshot = get();
      const newId =
        input.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = snapshot.events.find((e) => e.id === newId);
      if (existing) return existing;

      const newEvent: CalendarEvent = {
        id: newId,
        title: input.title.trim(),
        category: input.category,
        projectId: input.projectId || snapshot.projects[0]?.id || 'prj-harbor',
        date: input.date,
        startTime: input.startTime || '10:00',
        endTime: input.endTime || '11:00',
        attendeeIds:
          input.attendeeIds.length > 0 ? input.attendeeIds : [snapshot.currentUser.id],
        location: input.location?.trim() || 'Studio Room 01',
      };

      let didInsert = false;
      set((state) => {
        if (state.events.some((e) => e.id === newId)) {
          return state;
        }
        didInsert = true;
        const nextEvents = dedupeById([newEvent, ...state.events]);
        saveWorkspaceStorage({ events: nextEvents });
        return { events: nextEvents };
      });

      if (didInsert) {
        get().pushToast(
          `Event "${newEvent.title}" scheduled`,
          `${newEvent.date} · ${newEvent.startTime}–${newEvent.endTime}`
        );
      }
      return newEvent;
    },

    updateEvent: (eventId, input) => {
      const state = get();
      const nextEvents = state.events.map((evt) => {
        if (evt.id !== eventId) return evt;
        return {
          ...evt,
          title: input.title !== undefined ? input.title.trim() : evt.title,
          category: input.category !== undefined ? input.category : evt.category,
          date: input.date !== undefined ? input.date : evt.date,
          startTime: input.startTime !== undefined ? input.startTime : evt.startTime,
          endTime: input.endTime !== undefined ? input.endTime : evt.endTime,
          attendeeIds: input.attendeeIds !== undefined ? input.attendeeIds : evt.attendeeIds,
          location: input.location !== undefined ? input.location : evt.location,
        };
      });
      saveWorkspaceStorage({ events: nextEvents });
      set({ events: nextEvents });
      get().pushToast('Event updated');
    },

    deleteEvent: (eventId) => {
      const snapshot = get();
      const target = snapshot.events.find((e) => e.id === eventId);
      if (!target) return;

      const savedSnapshot: StoreSnapshot = {
        projects: [...snapshot.projects],
        tasks: [...snapshot.tasks],
        team: [...snapshot.team],
        events: [...snapshot.events],
        focusSessions: [...snapshot.focusSessions],
        timerRunning: snapshot.timerRunning,
        timerSeconds: snapshot.timerSeconds,
        timerTaskId: snapshot.timerTaskId,
      };

      const nextEvents = snapshot.events.filter((e) => e.id !== eventId);
      saveWorkspaceStorage({ events: nextEvents });

      set({ events: nextEvents });

      get().pushToastWithUndo(
        `Event "${target.title}" deleted`,
        `${target.date} · ${target.startTime}–${target.endTime}`,
        () => get().restoreSnapshot(savedSnapshot)
      );
    },

    toggleEventCheckIn: (eventId) => {
      const state = get();
      const isCheckedIn = state.checkedInEventIds.includes(eventId);
      const targetEvent = state.events.find((e) => e.id === eventId);
      const nextIds = isCheckedIn
        ? state.checkedInEventIds.filter((id) => id !== eventId)
        : [...state.checkedInEventIds, eventId];

      saveWorkspaceStorage({ checkedInEventIds: nextIds });
      set({ checkedInEventIds: nextIds });

      if (targetEvent) {
        get().pushToast(
          isCheckedIn
            ? `Meeting ended: ${targetEvent.title}`
            : `Meeting started: ${targetEvent.title}`,
          `${targetEvent.startTime}–${targetEvent.endTime} · ${targetEvent.location}`
        );
      }
    },
  });
}
