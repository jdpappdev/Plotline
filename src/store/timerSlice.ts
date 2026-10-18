import type { FocusSession } from '../domain/types';
import { getTodayIsoDate } from '../lib/dates';
import { dedupeById, formatDuration } from '../lib/format';
import { saveWorkspaceStorage } from '../lib/storage';
import type { TimerSlice, WorkspaceSliceCreator } from './types';

const DEFAULT_TIMER_TASK_ID = 'tsk-h-5';
const SECONDS_PER_HOUR = 3600;
const FRIDAY_WEEKDAY_INDEX = 5;

export function createTimerSlice(
  initialSessions: FocusSession[]
): WorkspaceSliceCreator<TimerSlice> {
  return (set, get) => ({
    focusSessions: initialSessions,
    timerSeconds: 0,
    timerRunning: false,
    timerTaskId: DEFAULT_TIMER_TASK_ID,

    toggleTimer: () => {
      set((state) => ({
        timerRunning: !state.timerRunning,
        timerSeconds: state.timerSeconds,
      }));
    },

    resetTimer: () => {
      const snapshot = get();
      const elapsedSeconds =
        snapshot.timerSeconds > 0
          ? snapshot.timerSeconds
          : snapshot.timerRunning
          ? 1
          : 0;
      const activeTask =
        snapshot.tasks.find((t) => t.id === snapshot.timerTaskId) || snapshot.tasks[0];

      if (elapsedSeconds > 0 && activeTask) {
        const newSessionId = `fcs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const nowTs = Date.now();
        const todayWeekday = new Date().getDay();
        const newSession: FocusSession = {
          id: newSessionId,
          taskId: activeTask.id,
          projectId: activeTask.projectId,
          memberId: activeTask.assigneeId || snapshot.currentUser.id,
          weekdayIndex:
            todayWeekday === 0 || todayWeekday === 6 ? FRIDAY_WEEKDAY_INDEX : todayWeekday,
          date: getTodayIsoDate(),
          daysAgo: 0,
          seconds: elapsedSeconds,
          hours: elapsedSeconds / SECONDS_PER_HOUR,
          createdAt: new Date(nowTs).toISOString(),
        };

        let didLog = false;
        set((state) => {
          if (state.focusSessions.some((s) => s.id === newSessionId)) {
            return { timerSeconds: 0, timerRunning: false };
          }
          didLog = true;
          const nextSessions = dedupeById([...state.focusSessions, newSession]);
          const nextTasks = state.tasks.map((t) => {
            if (t.id !== activeTask.id) return t;
            const prevLogged = t.loggedSeconds || 0;
            return {
              ...t,
              loggedSeconds: prevLogged + elapsedSeconds,
              updatedAt: nowTs,
            };
          });

          saveWorkspaceStorage({
            focusSessions: nextSessions,
            tasks: nextTasks,
          });

          return {
            timerSeconds: 0,
            timerRunning: false,
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

      set({ timerSeconds: 0, timerRunning: false });
    },

    tickTimer: () => {
      set((state) => {
        if (!state.timerRunning) return state;
        return { timerSeconds: state.timerSeconds + 1 };
      });
    },

    setTimerTask: (timerTaskId) => {
      set({ timerTaskId });
    },
  });
}
