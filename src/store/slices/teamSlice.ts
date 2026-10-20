import { StateCreator } from 'zustand';
import type { TeamMember, StoreSnapshot } from '../../domain/types';
import type { PlotlineState, TeamSlice } from '../sliceTypes';
import { getNowTimestamp } from '../../lib/clock';
import { dedupeById, SEED_TEAM } from '../../domain/seed/index';
import { computeInitials } from '../../utils/string';
import { TEAM_STORAGE_KEY, CURRENT_USER_STORAGE_KEY, savePersistedTasks } from '../persistence';

export function loadPersistedTeam(): TeamMember[] {
  if (typeof window === 'undefined') return SEED_TEAM;
  try {
    const raw = window.localStorage.getItem(TEAM_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some((m) => m.id === 'usr-soren')) {
        return dedupeById<TeamMember>(parsed);
      }
    }
  } catch {
    // Ignore
  }
  return SEED_TEAM;
}

export function savePersistedTeam(team: TeamMember[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(dedupeById(team)));
  } catch {
    // Ignore
  }
}

export function loadInitialCurrentUser(): TeamMember {
  return SEED_TEAM[0];
}

export const createTeamSlice =
  (
    initialTeam: TeamMember[] = loadPersistedTeam(),
    initialCurrentUser: TeamMember = loadInitialCurrentUser()
  ): StateCreator<PlotlineState, [], [], TeamSlice> =>
  (set, get) => ({
    team: initialTeam,
    currentUser: initialCurrentUser,
    selectedProfileMemberId: null,

    setSelectedProfileMemberId: (selectedProfileMemberId) => set({ selectedProfileMemberId }),

    addTeamMember: (input) => {
      const snapshot = get();
      const newId =
        input.id || `usr-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 5)}`;
      const existing = snapshot.team.find((m) => m.id === newId);
      if (existing) return existing;

      const cleanName = input.name.trim();
      const initials = computeInitials(cleanName);
      const parts = cleanName.split(/\s+/);

      const newMember: TeamMember = {
        id: newId,
        name: cleanName,
        role: input.role.trim() || 'Specialist',
        discipline: input.department,
        department: input.department,
        presence: 'online',
        statusLabel: 'Newly onboarded specialist',
        location: input.location?.trim() || 'Remote · CET',
        timezone: 'CET (UTC+1)',
        initials,
        capacityHours: 60,
        allocatedHours: 20,
        email: input.email?.trim() || `${parts[0].toLowerCase()}@plotline.studio`,
      };

      let didInsert = false;
      set((state) => {
        if (state.team.some((m) => m.id === newId)) {
          return state;
        }
        didInsert = true;
        const nextTeam = dedupeById([...state.team, newMember]);
        savePersistedTeam(nextTeam);
        return { team: nextTeam };
      });

      if (didInsert) {
        get().pushToast(`Invited ${newMember.name}`, `${newMember.role} · ${newMember.department}`);
      }
      return newMember;
    },

    deleteMember: (memberId) => {
      const snapshot = get();
      if (memberId === snapshot.currentUser.id) return;
      const target = snapshot.team.find((m) => m.id === memberId);
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

      const nextTeam = snapshot.team.filter((m) => m.id !== memberId);
      const nextTasks = snapshot.tasks.map((t) => {
        let updated = false;
        let nextAssignee = t.assigneeId;
        let nextCoAssignee = t.coAssigneeId;

        if (t.assigneeId === memberId) {
          nextAssignee = 'usr-soren';
          updated = true;
        }
        if (t.coAssigneeId === memberId) {
          nextCoAssignee = undefined;
          updated = true;
        }

        return updated ? { ...t, assigneeId: nextAssignee, coAssigneeId: nextCoAssignee } : t;
      });

      savePersistedTeam(nextTeam);
      savePersistedTasks(nextTasks);

      set({
        team: nextTeam,
        tasks: nextTasks,
      });

      get().pushToastWithUndo(
        `Specialist "${target.name}" deleted`,
        'Assigned tasks reallocated',
        () => get().restoreSnapshot(savedSnapshot)
      );
    },

    updateProfile: (input) => {
      const state = get();
      const cleanName = input.name.trim() || state.currentUser.name;
      const cleanRole = input.role.trim() || state.currentUser.role;
      const cleanEmail = input.email.trim() || state.currentUser.email;
      const initials = computeInitials(cleanName);

      const updatedUser: TeamMember = {
        ...state.currentUser,
        name: cleanName,
        role: cleanRole,
        email: cleanEmail,
        initials,
      };

      const updatedTeam = state.team.map((m) => (m.id === updatedUser.id ? updatedUser : m));

      try {
        window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));
      } catch {
        // Ignore
      }
      savePersistedTeam(updatedTeam);

      set({
        currentUser: updatedUser,
        team: updatedTeam,
      });

      get().pushToast('Profile saved', `${updatedUser.name} · ${updatedUser.role}`);
    },
  });
