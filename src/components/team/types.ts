import { Department, PresenceStatus, TaskItem, TeamMember } from '../../domain/types';

export const DEPARTMENT_FILTERS: Array<'All' | Department> = [
  'All',
  'Engineering',
  'Design',
  'Marketing',
  'Management',
];

export interface EnrichedTeamMember {
  member: TeamMember;
  memberTasks: TaskItem[];
  openCount: number;
  completedCount: number;
  workloadPct: number;
}

export function presenceDotColor(presence: PresenceStatus): string {
  switch (presence) {
    case 'online':
      return '#16A34A';
    case 'away':
      return '#D97706';
    case 'offline':
    default:
      return '#9CA3AF';
  }
}

export function presenceTextLabel(presence: PresenceStatus): string {
  switch (presence) {
    case 'online':
      return 'Online';
    case 'away':
      return 'Away';
    case 'offline':
    default:
      return 'Offline';
  }
}
