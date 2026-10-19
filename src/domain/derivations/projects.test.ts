import { describe, expect, it } from 'vitest';
import { createSeedProjects, createSeedTasks, SEED_TEAM } from '../../domain/seed';
import {
  computeProjectStatusCounts,
  filterAndSortProjects,
  getProjectHealth,
  getProjectProgress,
  getProjectStatus,
  getProjectTaskSummary,
  getRingsProjects,
  parseAndValidateImportRows,
} from './projects';

describe('projects derivations', () => {
  const projects = createSeedProjects();
  const tasks = createSeedTasks();
  const team = [...SEED_TEAM];

  it('computes exact baseline project status counts and percentages for Dashboard', () => {
    const counts = computeProjectStatusCounts(projects, tasks);
    expect(counts).toEqual({
      totalCount: 6,
      endedCount: 1,
      runningCount: 4,
      pendingCount: 1,
      endedPct: 17,
      runningPct: 67,
      pendingPct: 17,
    });
  });

  it('computes exact baseline getProjectStatus and getProjectProgress for every seed project', () => {
    const summary = projects.map((p) => ({
      id: p.id,
      status: getProjectStatus(p, tasks),
      progress: getProjectProgress(p, tasks),
      health: getProjectHealth(p, tasks),
    }));
    expect(summary).toEqual([
      { id: 'prj-harbor', status: 'Running', progress: 57, health: 'On track' },
      { id: 'prj-fernlight', status: 'Running', progress: 40, health: 'At risk' },
      { id: 'prj-orchard', status: 'Running', progress: 40, health: 'On track' },
      { id: 'prj-atlas', status: 'Running', progress: 75, health: 'On track' },
      { id: 'prj-lumen', status: 'Ended', progress: 100, health: 'On track' },
      { id: 'prj-northwind', status: 'Pending', progress: 0, health: 'On track' },
    ]);
  });

  it('respects project.statusOverride in getProjectStatus', () => {
    const overridden = { ...projects[0], statusOverride: 'Ended' as const };
    expect(getProjectStatus(overridden, tasks)).toBe('Ended');
  });

  it('computes project task summary accurately', () => {
    const harborSummary = getProjectTaskSummary('prj-harbor', tasks);
    expect(harborSummary.totalCount).toBe(7);
    expect(harborSummary.doneCount).toBe(4);
    expect(harborSummary.openCount).toBe(3);
  });

  it('filters and sorts projects by status, dueDate, progress, and name', () => {
    const runningByDue = filterAndSortProjects(projects, tasks, team, {
      statusFilter: 'running',
      sortField: 'dueDate',
      searchQuery: '',
    });
    expect(runningByDue.map((p) => p.id)).toEqual([
      'prj-atlas',
      'prj-orchard',
      'prj-harbor',
      'prj-fernlight',
    ]);

    const byProgress = filterAndSortProjects(projects, tasks, team, {
      statusFilter: 'all',
      sortField: 'progress',
      searchQuery: 'harbor',
    });
    expect(byProgress.map((p) => p.id)).toEqual(['prj-harbor']);
  });

  it('computes completion rings for top 4 unfinished projects sorted by dueDate', () => {
    const rings = getRingsProjects(projects, tasks);
    expect(rings.map((r) => ({ id: r.project.id, progress: r.progress }))).toEqual([
      { id: 'prj-atlas', progress: 75 },
      { id: 'prj-orchard', progress: 40 },
      { id: 'prj-harbor', progress: 57 },
      { id: 'prj-fernlight', progress: 40 },
    ]);
  });

  it('parses and validates CSV/JSON import rows and deduplicates on name + due date', () => {
    const sampleCsv = [
      'name,client,targetDate,status',
      'Aurora Field Guide App, Aurora Outdoors, 2027-02-15, pending',
      'Aurora Field Guide App, Aurora Outdoors, 2027-02-15, running',
      'Bad Date Project, Client, not-a-date, pending',
    ].join('\n');
    const result = parseAndValidateImportRows(sampleCsv, projects);
    expect(result.validCount).toBe(1);
    expect(result.duplicateCount).toBe(1);
    expect(result.invalidCount).toBe(1);
    expect(result.validRows[0]).toEqual({
      name: 'Aurora Field Guide App',
      client: 'Aurora Outdoors',
      targetDate: '2027-02-15',
      status: 'Pending',
    });
  });
});
