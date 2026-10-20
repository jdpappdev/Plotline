import { StateCreator } from 'zustand';
import type { FocusSession, TaskItem } from '../../domain/types';
import type { PlotlineState, TimerSlice } from '../sliceTypes';
import { getTodayIsoDate, getNow, getNowTimestamp } from '../../lib/clock';
import { dedupeById, createSeedFocusSessions } from '../../domain/seed/index';
import { formatDuration } from '../../domain/derivations/time';
import {
  FOCUS_SESSIONS_STORAGE_KEY,
  TIMER_STATE_STORAGE_KEY,
  savePersistedTasks,
} from '../persistence';

export const FOCUS_PROMPT_THRESHOLD_SECONDS = 90 * 60; // 5400 seconds (90 minutes)

interface PersistedTimerState {
  timerSeconds: number;
  timerRunning: boolean;
  timerTaskId: string;
  focusPromptFired: boolean;
}

function loadPersistedTimerState(): PersistedTimerState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(TIMER_STATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const timerSeconds =
          typeof parsed.timerSeconds === 'number' && parsed.timerSeconds >= 0
            ? Math.floor(parsed.timerSeconds)
            : 0;
        const timerRunning = Boolean(parsed.timerRunning);
        const timerTaskId =
          typeof parsed.timerTaskId === 'string' && parsed.timerTaskId
            ? parsed.timerTaskId
            : 'tsk-h-5';
        const focusPromptFired =
          typeof parsed.focusPromptFired === 'boolean'
            ? parsed.focusPromptFired
            : timerSeconds >= FOCUS_PROMPT_THRESHOLD_SECONDS;
        return {
          timerSeconds,
          timerRunning,
          timerTaskId,
          focusPromptFired,
        };
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

export function savePersistedTimerState(state: PersistedTimerState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TIMER_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore
  }
}

export function loadPersistedFocusSessions(tasks: TaskItem[]): FocusSession[] {
  if (typeof window === 'undefined') return createSeedFocusSessions(tasks);
  try {
    const raw = window.localStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasWeekendOrInvalid = parsed.some((s: FocusSession) => {
          const parts = (s.date || '').split('-').map(Number);
          const day =
            parts.length === 3
              ? new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getDay()
              : s.weekdayIndex;
          return day === 0 || day === 6 || s.weekdayIndex === 0 || s.weekdayIndex === 6;
        });
        if (!hasWeekendOrInvalid) {
          // Sync task.loggedSeconds with persisted sessions
          tasks.forEach((t) => {
            t.loggedSeconds = parsed
              .filter((s: FocusSession) => s.taskId === t.id)
              .reduce(
                (acc: number, s: FocusSession) =>
                  acc +
                  (typeof s.seconds === 'number'
                    ? Math.round(s.seconds)
                    : Math.round((s.hours || 0) * 3600)),
                0
              );
          });
          return dedupeById<FocusSession>(parsed);
        }
      }
    }
  } catch {
    // Ignore
  }
  return createSeedFocusSessions(tasks);
}

export function savePersistedFocusSessions(sessions: FocusSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(dedupeById(sessions)));
  } catch {
    // Ignore
  }
}

export function loadInitialTimerSeconds(): number {
  return loadPersistedTimerState()?.timerSeconds ?? 0;
}

export function loadInitialTimerRunning(): boolean {
  return loadPersistedTimerState()?.timerRunning ?? false;
}

export function loadInitialTimerTaskId(): string {
  return loadPersistedTimerState()?.timerTaskId ?? 'tsk-h-5';
}

export function loadInitialFocusPromptFired(): boolean {
  return loadPersistedTimerState()?.focusPromptFired ?? false;
}

export const createTimerSlice =
  (
    initialFocusSessions: FocusSession[],
    initialTimerSeconds: number = loadInitialTimerSeconds(),
    initialTimerRunning: boolean = loadInitialTimerRunning(),
    initialTimerTaskId: string = loadInitialTimerTaskId(),
    initialFocusPromptFired: boolean = loadInitialFocusPromptFired()
  ): StateCreator<PlotlineState, [], [], TimerSlice> =>
  (set, get) => ({
    focusSessions: initialFocusSessions,
    timerSeconds: initialTimerSeconds,
    timerRunning: initialTimerRunning,
    timerTaskId: initialTimerTaskId,
    focusPromptFired:
      initialFocusPromptFired || initialTimerSeconds >= FOCUS_PROMPT_THRESHOLD_SECONDS,

    toggleTimer: () => {
      set((state) => {
        const nextRunning = !state.timerRunning;
        const nextSeconds = state.timerSeconds;
        // Reset the fired flag only when a genuinely new session starts (from 0 seconds)
        const nextFired = nextRunning && nextSeconds === 0 ? false : state.focusPromptFired;
        savePersistedTimerState({
          timerSeconds: nextSeconds,
          timerRunning: nextRunning,
          timerTaskId: state.timerTaskId,
          focusPromptFired: nextFired,
        });
        return {
          timerRunning: nextRunning,
          timerSeconds: nextSeconds,
          focusPromptFired: nextFired,
        };
      });
    },

    resetTimer: () => {
      const snapshot = get();
      const elapsedSeconds =
        snapshot.timerSeconds > 0 ? snapshot.timerSeconds : snapshot.timerRunning ? 1 : 0;
      const activeTask =
        snapshot.tasks.find((t) => t.id === snapshot.timerTaskId) || snapshot.tasks[0];

      if (elapsedSeconds > 0 && activeTask) {
        const newSessionId = `fcs-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
        const nowTs = getNowTimestamp();
        const todayWeekday = getNow().getDay();
        const newSession: FocusSession = {
          id: newSessionId,
          taskId: activeTask.id,
          projectId: activeTask.projectId,
          memberId: activeTask.assigneeId || snapshot.currentUser.id,
          weekdayIndex: todayWeekday === 0 ? 5 : todayWeekday === 6 ? 5 : todayWeekday,
          date: getTodayIsoDate(),
          daysAgo: 0,
          seconds: elapsedSeconds,
          hours: elapsedSeconds / 3600,
          createdAt: new Date(nowTs).toISOString(),
        };

        let didLog = false;
        set((state) => {
          if (state.focusSessions.some((s) => s.id === newSessionId)) {
            savePersistedTimerState({
              timerSeconds: 0,
              timerRunning: false,
              timerTaskId: state.timerTaskId,
              focusPromptFired: false,
            });
            return { timerSeconds: 0, timerRunning: false, focusPromptFired: false };
          }
          didLog = true;
          const nextSessions = dedupeById([...state.focusSessions, newSession]);
          savePersistedFocusSessions(nextSessions);

          const nextTasks = state.tasks.map((t) => {
            if (t.id !== activeTask.id) return t;
            const prevLogged = t.loggedSeconds || 0;
            const nextLogged = prevLogged + elapsedSeconds;
            return {
              ...t,
              loggedSeconds: nextLogged,
              updatedAt: nowTs,
              updatedAtLabel: 'Just now',
            };
          });
          savePersistedTasks(nextTasks);
          savePersistedTimerState({
            timerSeconds: 0,
            timerRunning: false,
            timerTaskId: state.timerTaskId,
            focusPromptFired: false,
          });

          return {
            timerSeconds: 0,
            timerRunning: false,
            focusPromptFired: false,
            focusSessions: nextSessions,
            tasks: nextTasks,
          };
        });

        if (didLog) {
          get().pushToast(
            `Logged ${formatDuration(elapsedSeconds)} focus session`,
            `${activeTask.code} · ${activeTask.title}`
          );
        }
        return;
      }

      savePersistedTimerState({
        timerSeconds: 0,
        timerRunning: false,
        timerTaskId: snapshot.timerTaskId,
        focusPromptFired: false,
      });
      set({ timerSeconds: 0, timerRunning: false, focusPromptFired: false });
    },

    tickTimer: () => {
      let shouldNotifyFocusPrompt = false;
      let activeTaskTitle = '';

      set((state) => {
        if (!state.timerRunning) return state;
        const nextSeconds = state.timerSeconds + 1;
        let nextFired = state.focusPromptFired;

        if (nextSeconds >= FOCUS_PROMPT_THRESHOLD_SECONDS && !state.focusPromptFired) {
          nextFired = true;
          shouldNotifyFocusPrompt = true;
          const activeTask = state.tasks.find((t) => t.id === state.timerTaskId) || state.tasks[0];
          activeTaskTitle = activeTask ? `${activeTask.code} · ${activeTask.title}` : '';
        }

        savePersistedTimerState({
          timerSeconds: nextSeconds,
          timerRunning: state.timerRunning,
          timerTaskId: state.timerTaskId,
          focusPromptFired: nextFired,
        });

        return {
          timerSeconds: nextSeconds,
          focusPromptFired: nextFired,
        };
      });

      if (shouldNotifyFocusPrompt) {
        get().pushToast(
          'Focus session passed 90 minutes',
          activeTaskTitle || 'Consider taking a short break or logging your progress.'
        );
      }
    },

    setTimerTask: (timerTaskId) => {
      set((state) => {
        savePersistedTimerState({
          timerSeconds: state.timerSeconds,
          timerRunning: state.timerRunning,
          timerTaskId,
          focusPromptFired: state.focusPromptFired,
        });
        return { timerTaskId };
      });
    },
  });
