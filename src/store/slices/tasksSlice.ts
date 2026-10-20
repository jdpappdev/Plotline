import { StateCreator } from 'zustand';
import type { TaskItem, NewTaskInput, StoreSnapshot } from '../../domain/types';
import type { TasksSlice, PlotlineState } from '../sliceTypes';
import { getTodayIsoDate, getNow, getNowTimestamp } from '../../lib/clock';
import { dedupeById } from '../../domain/seed/index';
import { getProjectProgress } from '../../domain/derivations/projects';
import { savePersistedTasks, savePersistedProjects } from '../persistence';

export function progressForTaskStatus(status: TaskItem['status'], currentProgress: number): number {
  switch (status) {
    case 'Done':
      return 100;
    case 'In Review':
      return Math.max(75, Math.min(90, currentProgress || 80));
    case 'In Progress':
      return Math.max(35, Math.min(70, currentProgress === 100 ? 55 : currentProgress || 50));
    case 'Backlog':
    default:
      return Math.min(25, currentProgress === 100 ? 15 : currentProgress || 15);
  }
}

export const createTasksSlice =
  (initialTasks: TaskItem[]): StateCreator<PlotlineState, [], [], TasksSlice> =>
  (set, get) => ({
    tasks: initialTasks,
    newTaskModalOpen: false,

    setNewTaskModalOpen: (newTaskModalOpen) => set({ newTaskModalOpen }),

    moveTask: (taskId, newStatus) => {
      const snapshot = get();
      const target = snapshot.tasks.find((t) => t.id === taskId);
      if (!target || target.status === newStatus) return;

      const nowTs = getNowTimestamp();
      const prevStatus = target.status;

      const nextProgress = progressForTaskStatus(newStatus, target.progress);
      const nextSubtasksDone =
        newStatus === 'Done'
          ? target.subtasksTotal
          : newStatus === 'Backlog'
            ? 0
            : Math.max(1, Math.min(target.subtasksTotal - 1, target.subtasksDone));

      let didMove = false;
      set((state) => {
        const currentTarget = state.tasks.find((t) => t.id === taskId);
        if (!currentTarget || currentTarget.status === newStatus) return state;
        didMove = true;

        const updatedTasks = state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: newStatus,
                completedDate: newStatus === 'Done' ? getTodayIsoDate() : t.completedDate,
                progress: nextProgress,
                subtasksDone: nextSubtasksDone,
                updatedAt: nowTs,
                updatedAtLabel: 'Just now',
              }
            : t
        );

        const updatedProjects = state.projects.map((proj) => {
          if (proj.id !== currentTarget.projectId) return proj;
          const projProgress = getProjectProgress(proj, updatedTasks);
          return {
            ...proj,
            progress: projProgress,
          };
        });

        savePersistedTasks(updatedTasks);
        savePersistedProjects(updatedProjects);

        return {
          tasks: updatedTasks,
          projects: updatedProjects,
        };
      });

      if (didMove) {
        get().recordMovementEvent(taskId, prevStatus, newStatus);
        const stageLabel = newStatus === 'Backlog' ? 'To do' : newStatus;
        get().pushToast(`Moved "${target.code}" to ${stageLabel}`, target.title);
      }
    },

    assignTask: (taskId, assigneeId) => {
      const snapshot = get();
      const target = snapshot.tasks.find((t) => t.id === taskId);
      if (!target || target.assigneeId === assigneeId) return;

      const prevAssigneeId = target.assigneeId || null;
      const nowTs = getNowTimestamp();
      let didAssign = false;

      set((state) => {
        const currentTarget = state.tasks.find((t) => t.id === taskId);
        if (!currentTarget || currentTarget.assigneeId === assigneeId) return state;
        didAssign = true;

        const updatedTasks = state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                assigneeId,
                updatedAt: nowTs,
                updatedAtLabel: 'Just now',
              }
            : t
        );
        savePersistedTasks(updatedTasks);
        return { tasks: updatedTasks };
      });

      if (didAssign) {
        get().recordAssignmentEvent(taskId, prevAssigneeId, assigneeId);
      }
    },

    addTask: (input: NewTaskInput) => {
      const snapshot = get();
      const newId =
        input.id || `tsk-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = snapshot.tasks.find((t) => t.id === newId);
      if (existing) return existing;

      const nowTs = getNowTimestamp();
      const defaultProject = snapshot.projects[0];
      const nextCodeNum = 100 + snapshot.tasks.length;
      const status = input.status || 'Backlog';
      const targetProjectId = defaultProject?.id || 'prj-harbor';
      const assigneeId = input.assigneeId || snapshot.currentUser.id;
      const newTask: TaskItem = {
        id: newId,
        code: `PLT-${nextCodeNum}`,
        title: input.title.trim(),
        category: input.category.trim() || 'Engineering',
        projectId: targetProjectId,
        assigneeId,
        status,
        priority: input.priority,
        startDate: input.startDate || getTodayIsoDate(),
        dueDate: input.dueDate,
        completedDate: status === 'Done' ? getTodayIsoDate() : undefined,
        estimateHours: input.priority === 'High' ? 14 : input.priority === 'Medium' ? 10 : 6,
        loggedSeconds: 0,
        cycleDays: 5,
        onTime: true,
        progress: progressForTaskStatus(status, 15),
        subtasksDone: status === 'Done' ? 4 : 0,
        subtasksTotal: 4,
        weekdayIndex: getNow().getDay(),
        updatedAt: nowTs,
        updatedAtLabel: 'Just now',
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
          const projProgress = getProjectProgress(proj, nextTasks);
          return {
            ...proj,
            progress: projProgress,
          };
        });

        savePersistedTasks(nextTasks);
        savePersistedProjects(nextProjects);

        return { tasks: nextTasks, projects: nextProjects };
      });

      if (didInsert) {
        get().recordAssignmentEvent(newId, null, assigneeId);
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
        focusPromptFired: snapshot.focusPromptFired,
      };

      const nextTasks = snapshot.tasks.filter((t) => t.id !== taskId);
      savePersistedTasks(nextTasks);

      set({
        tasks: nextTasks,
      });

      get().pushToastWithUndo(`Task "${target.code}" deleted`, target.title, () =>
        get().restoreSnapshot(savedSnapshot)
      );
    },
  });
