import type { StoreSnapshot, TaskItem } from '../domain/types';
import { getProjectProgress, progressForTaskStatus } from '../domain/derivations';
import {
  DEFAULT_CYCLE_DAYS,
  DEFAULT_SUBTASKS_TOTAL,
  INITIAL_TASK_CODE_BASE,
  PRIORITY_ESTIMATE_HOURS,
} from '../domain/seed/constants';
import { getTodayIsoDate } from '../lib/dates';
import { dedupeById } from '../lib/format';
import { saveWorkspaceStorage } from '../lib/storage';
import type { TasksSlice, WorkspaceSliceCreator } from './types';

export function createTasksSlice(initialTasks: TaskItem[]): WorkspaceSliceCreator<TasksSlice> {
  return (set, get) => ({
    tasks: initialTasks,

    moveTask: (taskId, newStatus) => {
      const snapshot = get();
      const target = snapshot.tasks.find((t) => t.id === taskId);
      if (!target || target.status === newStatus) return;

      const nowTs = Date.now();
      const nextProgress = progressForTaskStatus(newStatus, target.progress);
      const nextSubtasksDone =
        newStatus === 'Done'
          ? target.subtasksTotal
          : newStatus === 'Backlog'
          ? 0
          : Math.max(1, Math.min(target.subtasksTotal - 1, target.subtasksDone));

      set((state) => {
        const currentTarget = state.tasks.find((t) => t.id === taskId);
        if (!currentTarget || currentTarget.status === newStatus) return state;

        const updatedTasks = state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: newStatus,
                completedDate: newStatus === 'Done' ? getTodayIsoDate() : t.completedDate,
                progress: nextProgress,
                subtasksDone: nextSubtasksDone,
                updatedAt: nowTs,
              }
            : t
        );

        const updatedProjects = state.projects.map((proj) => {
          if (proj.id !== currentTarget.projectId) return proj;
          return {
            ...proj,
            progress: getProjectProgress(proj, updatedTasks),
          };
        });

        saveWorkspaceStorage({ tasks: updatedTasks, projects: updatedProjects });

        return {
          tasks: updatedTasks,
          projects: updatedProjects,
        };
      });

      const stageLabel = newStatus === 'Backlog' ? 'To do' : newStatus;
      get().pushToast(`Moved "${target.code}" to ${stageLabel}`, target.title);
    },

    addTask: (input) => {
      const snapshot = get();
      const newId =
        input.id || `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = snapshot.tasks.find((t) => t.id === newId);
      if (existing) return existing;

      const nowTs = Date.now();
      const defaultProject = snapshot.projects[0];
      const nextCodeNum = INITIAL_TASK_CODE_BASE + snapshot.tasks.length;
      const status = input.status || 'Backlog';
      const targetProjectId = defaultProject?.id || 'prj-harbor';
      const newTask: TaskItem = {
        id: newId,
        code: `PLT-${nextCodeNum}`,
        title: input.title.trim(),
        category: input.category.trim() || 'Engineering',
        projectId: targetProjectId,
        assigneeId: input.assigneeId || snapshot.currentUser.id,
        status,
        priority: input.priority,
        startDate: input.startDate || getTodayIsoDate(),
        dueDate: input.dueDate,
        completedDate: status === 'Done' ? getTodayIsoDate() : undefined,
        estimateHours: PRIORITY_ESTIMATE_HOURS[input.priority],
        loggedSeconds: 0,
        cycleDays: DEFAULT_CYCLE_DAYS,
        onTime: true,
        progress: progressForTaskStatus(status, 15),
        subtasksDone: status === 'Done' ? DEFAULT_SUBTASKS_TOTAL : 0,
        subtasksTotal: DEFAULT_SUBTASKS_TOTAL,
        weekdayIndex: new Date().getDay(),
        updatedAt: nowTs,
      };

      let didInsert = false;
      set((state) => {
        if (state.tasks.some((t) => t.id === newId)) {
          return state;
        }
        didInsert = true;
        const nextTasks = dedupeById([newTask, ...state.tasks]);
        const nextProjects = state.projects.map((proj) => {
          if (proj.id !== targetProjectId) return proj;
          return {
            ...proj,
            progress: getProjectProgress(proj, nextTasks),
          };
        });

        saveWorkspaceStorage({ tasks: nextTasks, projects: nextProjects });
        return { tasks: nextTasks, projects: nextProjects };
      });

      if (didInsert) {
        get().pushToast(`Task "${newTask.code}" created`, newTask.title);
      }
      return newTask;
    },

    deleteTask: (taskId) => {
      const snapshot = get();
      const target = snapshot.tasks.find((t) => t.id === taskId);
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

      const nextTasks = snapshot.tasks.filter((t) => t.id !== taskId);
      saveWorkspaceStorage({ tasks: nextTasks });

      set({ tasks: nextTasks });

      get().pushToastWithUndo(
        `Task "${target.code}" deleted`,
        target.title,
        () => get().restoreSnapshot(savedSnapshot)
      );
    },
  });
}
