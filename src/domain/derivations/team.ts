import { Department, TaskItem, TeamMember } from '../types';

const DEFAULT_MEMBER_CAPACITY_HOURS = 60;

export function getMemberWorkload(memberId: string, tasks: TaskItem[]): number {
  const openTasks = tasks.filter(
    (t) => (t.assigneeId === memberId || t.coAssigneeId === memberId) && t.status !== 'Done'
  );
  const openHours = openTasks.reduce((sum, t) => sum + (t.estimateHours || 0), 0);
  return Math.round((openHours / DEFAULT_MEMBER_CAPACITY_HOURS) * 100);
}

export function getMemberTaskCounts(
  memberId: string,
  tasks: TaskItem[]
): { openCount: number; completedCount: number } {
  const openCount = tasks.filter(
    (t) => (t.assigneeId === memberId || t.coAssigneeId === memberId) && t.status !== 'Done'
  ).length;
  const completedCount = tasks.filter(
    (t) => (t.assigneeId === memberId || t.coAssigneeId === memberId) && t.status === 'Done'
  ).length;
  return { openCount, completedCount };
}

export function getMemberAssignedTasks(memberId: string, tasks: TaskItem[]): TaskItem[] {
  return tasks.filter((t) => t.assigneeId === memberId || t.coAssigneeId === memberId);
}

export function computeTeamMetrics(
  team: TeamMember[],
  tasks: TaskItem[]
): {
  totalCount: number;
  onlineCount: number;
  awayCount: number;
  offlineCount: number;
  avgWorkload: number;
} {
  const totalCount = team.length;
  const onlineCount = team.filter((m) => m.presence === 'online').length;
  const awayCount = team.filter((m) => m.presence === 'away').length;
  const offlineCount = team.filter((m) => m.presence === 'offline').length;
  const avgWorkload =
    totalCount > 0
      ? Math.round(team.reduce((acc, m) => acc + getMemberWorkload(m.id, tasks), 0) / totalCount)
      : 0;
  return { totalCount, onlineCount, awayCount, offlineCount, avgWorkload };
}

export function filterTeamMembers(
  team: TeamMember[],
  departmentFilter: 'All' | Department,
  searchQuery: string
): TeamMember[] {
  const q = searchQuery.trim().toLowerCase();
  return team.filter((member) => {
    const matchesDept = departmentFilter === 'All' || member.department === departmentFilter;
    const matchesQuery =
      !q ||
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      member.department.toLowerCase().includes(q);
    return matchesDept && matchesQuery;
  });
}
