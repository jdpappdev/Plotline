import type { Project, StoreSnapshot } from '../domain/types';
import {
  DEFAULT_PROJECT_BUDGET,
  IMPORTED_PROJECT_CODE_BASE,
  INITIAL_PROJECT_CODE_BASE,
  SAMPLE_BATCH_PROJECT_CODE_BASE,
} from '../domain/seed/constants';
import { getIsoDateOffset, getTodayIsoDate } from '../lib/dates';
import { dedupeById } from '../lib/format';
import { saveWorkspaceStorage } from '../lib/storage';
import type { ProjectsSlice, WorkspaceSliceCreator } from './types';

const SAMPLE_BATCH_OFFSET_DAYS = 45;
const SAMPLE_BATCH_PROGRESS = 18;
const SAMPLE_BATCH_BUDGET_ALLOCATED = 195000;
const SAMPLE_BATCH_BUDGET_SPENT = 35100;

export function createProjectsSlice(
  initialProjects: Project[]
): WorkspaceSliceCreator<ProjectsSlice> {
  return (set, get) => ({
    projects: initialProjects,
    lastAddedProjectId: null,

    addProject: (input) => {
      const snapshot = get();
      const newId =
        input.id || `prj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = snapshot.projects.find((p) => p.id === newId);
      if (existing) return existing;

      const nextNumber = INITIAL_PROJECT_CODE_BASE + snapshot.projects.length;
      const code = `PLT-${nextNumber}`;
      const newProject: Project = {
        id: newId,
        code,
        name: input.name.trim(),
        client: input.client?.trim() || 'Independent Partner',
        sector: input.sector?.trim() || 'Engineering & Operations',
        status: input.status || 'On Track',
        leadId: snapshot.currentUser.id,
        startDate: getTodayIsoDate(),
        targetDate: input.targetDate,
        progress: 0,
        budgetAllocated: DEFAULT_PROJECT_BUDGET,
        budgetSpent: 0,
        summary: `Newly chartered project (${code}) target completion ${input.targetDate}.`,
      };

      let didInsert = false;
      set((state) => {
        if (state.projects.some((p) => p.id === newId)) {
          return state;
        }
        didInsert = true;
        const nextProjects = dedupeById([newProject, ...state.projects]);
        saveWorkspaceStorage({ projects: nextProjects });
        return {
          projects: nextProjects,
          lastAddedProjectId: newId,
        };
      });

      if (didInsert) {
        get().pushToast(
          `Project "${newProject.name}" created`,
          `${newProject.code} added to active portfolio · Due ${newProject.targetDate}`
        );
      }

      return newProject;
    },

    updateProject: (id, updates) => {
      let updatedProjName = '';
      set((state) => {
        const nextProjects = state.projects.map((p) => {
          if (p.id !== id) return p;
          updatedProjName = updates.name !== undefined ? updates.name : p.name;
          const updated: Project = {
            ...p,
            ...updates,
            name: updates.name !== undefined ? updates.name.trim() : p.name,
            client: updates.client !== undefined ? updates.client.trim() : p.client,
            targetDate: updates.targetDate !== undefined ? updates.targetDate : p.targetDate,
            progress:
              updates.progress !== undefined
                ? Math.max(0, Math.min(100, updates.progress))
                : p.progress,
          };
          if (updates.statusOverride !== undefined) {
            updated.statusOverride = updates.statusOverride;
            updated.status = updates.statusOverride;
          }
          return updated;
        });
        saveWorkspaceStorage({ projects: nextProjects });
        return { projects: nextProjects };
      });
      if (updatedProjName) {
        get().pushToast(`Project "${updatedProjName}" updated`);
      }
    },

    importProjects: (items) => {
      const snapshot = get();
      let importedCount = 0;
      let skippedCount = 0;
      const newProjects: Project[] = [];

      const existingKeys = new Set(
        snapshot.projects.map((p) => `${p.name.trim().toLowerCase()}|${p.targetDate.trim()}`)
      );

      items.forEach((item, idx) => {
        const cleanName = item.name.trim();
        const cleanDate = item.targetDate.trim();
        const key = `${cleanName.toLowerCase()}|${cleanDate}`;
        if (!cleanName || existingKeys.has(key)) {
          skippedCount += 1;
          return;
        }
        existingKeys.add(key);
        importedCount += 1;

        const nextNum =
          IMPORTED_PROJECT_CODE_BASE + snapshot.projects.length + newProjects.length;
        const newPrj: Project = {
          id: `prj-imp-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          code: `PLT-${nextNum}`,
          name: cleanName,
          client: item.client.trim() || 'Imported Partner',
          sector: 'Specialized Operations',
          status: 'Pending',
          leadId: snapshot.currentUser.id,
          startDate: getTodayIsoDate(),
          targetDate: cleanDate,
          progress: 0,
          budgetAllocated: DEFAULT_PROJECT_BUDGET,
          budgetSpent: 0,
          summary: `Imported project stream (${cleanName}).`,
        };
        newProjects.push(newPrj);
      });

      if (newProjects.length > 0) {
        const nextProjects = dedupeById([...newProjects, ...snapshot.projects]);
        saveWorkspaceStorage({ projects: nextProjects });
        set({ projects: nextProjects });
      }

      const toastTitle = `${importedCount} ${importedCount === 1 ? 'project' : 'projects'} imported, ${skippedCount} skipped`;
      get().pushToast(
        toastTitle,
        importedCount > 0 ? 'Active portfolio updated' : 'No new projects added'
      );

      return { importedCount, skippedCount };
    },

    importSampleBatch: () => {
      const snapshot = get();
      const newId = `prj-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = snapshot.projects.find((p) => p.id === newId);
      if (existing) return existing;

      const nextNumber = SAMPLE_BATCH_PROJECT_CODE_BASE + snapshot.projects.length;
      const code = `PLT-${nextNumber}`;
      const importedProject: Project = {
        id: newId,
        code,
        name: 'Aethelgard Glacier Lidar Grid',
        client: 'Nordic Cryosphere Institute',
        sector: 'Glaciology & Remote Sensing',
        status: 'On Track',
        leadId: 'usr-mireia',
        startDate: getTodayIsoDate(),
        targetDate: getIsoDateOffset(SAMPLE_BATCH_OFFSET_DAYS),
        progress: SAMPLE_BATCH_PROGRESS,
        budgetAllocated: SAMPLE_BATCH_BUDGET_ALLOCATED,
        budgetSpent: SAMPLE_BATCH_BUDGET_SPENT,
        summary: 'Imported airborne altimetry mesh and crevasse drift ledger.',
      };

      let didInsert = false;
      set((state) => {
        if (state.projects.some((p) => p.id === newId)) {
          return state;
        }
        didInsert = true;
        const nextProjects = dedupeById([importedProject, ...state.projects]);
        saveWorkspaceStorage({ projects: nextProjects });
        return {
          projects: nextProjects,
          lastAddedProjectId: newId,
        };
      });

      if (didInsert) {
        get().pushToast(
          `Imported ${importedProject.code}: ${importedProject.name}`,
          'Portfolio metrics and projects updated.'
        );
      }

      return importedProject;
    },

    deleteProject: (projectId) => {
      const snapshot = get();
      const target = snapshot.projects.find((p) => p.id === projectId);
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

      const nextProjects = snapshot.projects.filter((p) => p.id !== projectId);
      const nextTasks = snapshot.tasks.filter((t) => t.projectId !== projectId);

      saveWorkspaceStorage({ projects: nextProjects, tasks: nextTasks });

      set({
        projects: nextProjects,
        tasks: nextTasks,
      });

      get().pushToastWithUndo(
        `Project "${target.name}" deleted`,
        'Associated deliverables removed',
        () => get().restoreSnapshot(savedSnapshot)
      );
    },
  });
}
