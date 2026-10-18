import { describe, expect, it } from 'vitest';
import { createSeedEvents } from './seed/eventsSeed';
import { createSeedProjects } from './seed/projectsSeed';
import { createSeedFocusSessions } from './seed/sessionsSeed';
import { createSeedTasks } from './seed/tasksSeed';
import { SEED_TEAM } from './seed/teamSeed';
import { validateWorkspace } from './validation';

describe('validateWorkspace', () => {
  it('passes all 13 data integrity checks on the initial seed dataset', () => {
    const projects = createSeedProjects();
    const tasks = createSeedTasks();
    const team = [...SEED_TEAM];
    const events = createSeedEvents(projects);
    const focusSessions = createSeedFocusSessions(tasks, projects);

    const report = validateWorkspace(projects, tasks, team, events, focusSessions);
    expect(report.passed).toBe(true);
    expect(report.checks.length).toBe(13);
    expect(report.checks.every((c) => c.passed)).toBe(true);
  });

  it('detects duplicate IDs or unresolvable references in Check 1', () => {
    const projects = createSeedProjects();
    const tasks = createSeedTasks();
    const team = [...SEED_TEAM];
    const events = createSeedEvents(projects);
    const focusSessions = createSeedFocusSessions(tasks, projects);

    const dupProjects = [...projects, projects[0]];
    const report = validateWorkspace(dupProjects, tasks, team, events, focusSessions);
    const check1 = report.checks.find((c) => c.id === 'ids-unique');
    expect(check1?.passed).toBe(false);
    expect(report.passed).toBe(false);
  });

  it('detects project progress mismatch in Check 2', () => {
    const projects = createSeedProjects();
    const tasks = createSeedTasks();
    const team = [...SEED_TEAM];
    const events = createSeedEvents(projects);
    const focusSessions = createSeedFocusSessions(tasks, projects);

    const tamperedProjects = projects.map((p, i) =>
      i === 0 ? { ...p, progress: 99 } : p
    );
    const report = validateWorkspace(tamperedProjects, tasks, team, events, focusSessions);
    const check2 = report.checks.find((c) => c.id === 'statuses-progress');
    expect(check2?.passed).toBe(false);
  });

  it('detects weekend focus sessions in Check 3', () => {
    const projects = createSeedProjects();
    const tasks = createSeedTasks();
    const team = [...SEED_TEAM];
    const events = createSeedEvents(projects);
    const focusSessions = createSeedFocusSessions(tasks, projects);

    const badSessions = [
      ...focusSessions,
      {
        ...focusSessions[0],
        id: 'fcs-weekend-bad',
        weekdayIndex: 0,
      },
    ];
    const report = validateWorkspace(projects, tasks, team, events, badSessions);
    const check3 = report.checks.find((c) => c.id === 'sessions-valid');
    expect(check3?.passed).toBe(false);
  });

  it('detects unknown task assignee in Check 5', () => {
    const projects = createSeedProjects();
    const tasks = createSeedTasks();
    const team = [...SEED_TEAM];
    const events = createSeedEvents(projects);
    const focusSessions = createSeedFocusSessions(tasks, projects);

    const badTasks = tasks.map((t, i) =>
      i === 0 ? { ...t, assigneeId: 'usr-unknown' } : t
    );
    const report = validateWorkspace(projects, badTasks, team, events, focusSessions);
    const check5 = report.checks.find((c) => c.id === 'assignees-exist');
    expect(check5?.passed).toBe(false);
  });
});
