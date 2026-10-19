import { describe, expect, it } from 'vitest';
import { createSeedTasks } from '../../domain/seed';
import {
  computeTaskFilterCounts,
  filterTasksForBoard,
  getDoneTasksGrouped,
  getTaskCycleDays,
  groupTasksByStatus,
  isTaskCompletedInRange,
  isTaskCompletedOnTime,
  progressForTaskStatus,
} from './tasks';

describe('tasks derivations', () => {
  const tasks = createSeedTasks();

  it('computes exact baseline tasks board grouping and Done recent/earlier split', () => {
    const grouped = groupTasksByStatus(tasks);
    expect(grouped.Backlog.length).toBe(5);
    expect(grouped['In Progress'].length).toBe(4);
    expect(grouped['In Review'].length).toBe(3);
    expect(grouped.Done.length).toBe(15);

    const doneGroups = getDoneTasksGrouped(tasks);
    expect(doneGroups.recentDone.length).toBe(7);
    expect(doneGroups.earlierDone.length).toBe(8);
  });

  it('computes task filter counts and filters board tasks accurately', () => {
    const counts = computeTaskFilterCounts(tasks, 'usr-soren');
    expect(counts).toEqual({
      myCount: 2,
      highCount: 14,
      weekCount: 5,
    });

    const filteredMy = filterTasksForBoard(tasks, 'usr-soren', ['my'], '', '');
    expect(filteredMy.length).toBe(2);
  });

  it('computes task cycle days, on-time completion, and status progress transitions', () => {
    const lateTask = tasks.find((t) => t.id === 'tsk-h-3')!;
    expect(isTaskCompletedOnTime(lateTask)).toBe(false);
    expect(getTaskCycleDays(lateTask)).toBe(8);

    const onTimeTask = tasks.find((t) => t.id === 'tsk-h-1')!;
    expect(isTaskCompletedOnTime(onTimeTask)).toBe(true);
    expect(isTaskCompletedInRange(onTimeTask, 0, 30)).toBe(true);

    expect(progressForTaskStatus('Done', 20)).toBe(100);
    expect(progressForTaskStatus('In Review', 50)).toBe(75);
    expect(progressForTaskStatus('In Progress', 100)).toBe(55);
    expect(progressForTaskStatus('Backlog', 100)).toBe(15);
  });
});
