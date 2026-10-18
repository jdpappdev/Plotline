import type { StoreSnapshot, TeamMember } from '../domain/types';
import { DEFAULT_MEMBER_CAPACITY_HOURS } from '../domain/seed/constants';
import { computeInitials, dedupeById } from '../lib/format';
import { saveWorkspaceStorage } from '../lib/storage';
import type { TeamSlice, WorkspaceSliceCreator } from './types';

export function createTeamSlice(
  initialTeam: TeamMember[],
  initialCurrentUser: TeamMember
): WorkspaceSliceCreator<TeamSlice> {
  return (set, get) => ({
    team: initialTeam,
    currentUser: initialCurrentUser,

    addTeamMember: (input) => {
      const snapshot = get();
      const newId =
        input.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      const existing = snapshot.team.find((m) => m.id === newId);
      if (existing) return existing;

      const cleanName = input.name.trim();
      const initials = computeInitials(cleanName);
      const parts = cleanName.split(/\s+/);

      const newMember: TeamMember = {
        id: newId,
        name: cleanName,
        role: input.role.trim() || 'Specialist',
        department: input.department,
        presence: 'online',
        statusLabel: 'Newly onboarded specialist',
        location: input.location?.trim() || 'Remote · CET',
        timezone: 'CET (UTC+1)',
        initials,
        capacityHours: DEFAULT_MEMBER_CAPACITY_HOURS,
        email: input.email?.trim() || `${parts[0].toLowerCase()}@plotline.studio`,
      };

      let didInsert = false;
      set((state) => {
        if (state.team.some((m) => m.id === newId)) {
          return state;
        }
        didInsert = true;
        const nextTeam = dedupeById([...state.team, newMember]);
        saveWorkspaceStorage({ team: nextTeam });
        return { team: nextTeam };
      });

      if (didInsert) {
        get().pushToast(
          `Invited ${newMember.name}`,
          `${newMember.role} · ${newMember.department}`
        );
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

        return updated
          ? { ...t, assigneeId: nextAssignee, coAssigneeId: nextCoAssignee }
          : t;
      });

      saveWorkspaceStorage({ team: nextTeam, tasks: nextTasks });

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

      const updatedTeam = state.team.map((m) =>
        m.id === updatedUser.id ? updatedUser : m
      );

      saveWorkspaceStorage({
        currentUser: updatedUser,
        team: updatedTeam,
      });

      set({
        currentUser: updatedUser,
        team: updatedTeam,
      });

      get().pushToast('Profile saved', `${updatedUser.name} · ${updatedUser.role}`);
    },
  });
}
