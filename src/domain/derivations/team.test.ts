import { describe, expect, it } from 'vitest';
import { createSeedTasks, SEED_TEAM } from '../../domain/seed';
import {
  computeTeamMetrics,
  filterTeamMembers,
  getMemberAssignedTasks,
  getMemberTaskCounts,
  getMemberWorkload,
} from './team';

describe('team derivations', () => {
  const team = [...SEED_TEAM];
  const tasks = createSeedTasks();

  it('computes exact baseline workloads, member task counts, and team metrics', () => {
    const summary = team.map((m) => {
      const counts = getMemberTaskCounts(m.id, tasks);
      return {
        id: m.id,
        workload: getMemberWorkload(m.id, tasks),
        openCount: counts.openCount,
        completedCount: counts.completedCount,
      };
    });

    expect(summary).toEqual([
      { id: 'usr-soren', workload: 17, openCount: 2, completedCount: 0 },
      { id: 'usr-mireia', workload: 20, openCount: 1, completedCount: 2 },
      { id: 'usr-tarek', workload: 77, openCount: 3, completedCount: 2 },
      { id: 'usr-kaelen', workload: 10, openCount: 1, completedCount: 2 },
      { id: 'usr-nadia', workload: 37, openCount: 2, completedCount: 4 },
      { id: 'usr-juno', workload: 25, openCount: 2, completedCount: 2 },
      { id: 'usr-jade', workload: 33, openCount: 1, completedCount: 3 },
    ]);

    const teamMetrics = computeTeamMetrics(team, tasks);
    expect(teamMetrics).toEqual({
      totalCount: 7,
      onlineCount: 5,
      awayCount: 1,
      offlineCount: 1,
      avgWorkload: 31,
    });

    expect(filterTeamMembers(team, 'Engineering', '').length).toBe(3);
    expect(getMemberAssignedTasks('usr-nadia', tasks).length).toBe(6);
  });
});
