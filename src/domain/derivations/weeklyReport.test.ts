import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  WEEKLY_REPORT_HEADERS,
  escapeCsvCell,
  deriveWeeklyReportRows,
  generateWeeklyReportCsv,
} from './weeklyReport';
import {
  buildMailtoUrl,
  formatEmailClipboardText,
  isValidRecipientEmail,
} from '../../components/team/TeamMessageDialog';
import { FocusSession, Project, TaskItem } from '../types';
import { createSeedProjects, createSeedTasks, createSeedFocusSessions } from '../seed/index';
import { setClockOverride } from '../../lib/clock';

describe('weeklyReport CSV derivation', () => {
  beforeEach(() => {
    setClockOverride(new Date(2026, 9, 18, 12, 0, 0));
  });

  afterEach(() => {
    setClockOverride(null);
  });

  const mockProject: Project = {
    id: 'prj-1',
    code: 'PLT-01',
    name: 'Horizon Array, Phase "Alpha"',
    client: 'Nordic Geo',
    sector: 'Geodesy',
    status: 'On Track',
    leadId: 'usr-soren',
    startDate: '2026-10-01',
    targetDate: '2026-10-25',
    progress: 60,
    budgetAllocated: 120000,
    budgetSpent: 48000,
    summary: 'Test project',
  };

  it('includes exact required CSV headers and handles empty data sensibly', () => {
    expect(WEEKLY_REPORT_HEADERS).toEqual([
      'Task Title',
      'Project',
      'Category',
      'Completion Date',
      'Logged Hours',
    ]);

    const emptyCsv = generateWeeklyReportCsv([], [], []);
    expect(emptyCsv).toBe('Task Title,Project,Category,Completion Date,Logged Hours');
  });

  it('escapes commas, quotation marks, and line breaks per RFC 4180', () => {
    expect(escapeCsvCell('Simple value')).toBe('Simple value');
    expect(escapeCsvCell('Value, with comma')).toBe('"Value, with comma"');
    expect(escapeCsvCell('Value with "quotes"')).toBe('"Value with ""quotes"""');
    expect(escapeCsvCell('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
    expect(escapeCsvCell('Line 1\r\n"Quoted", comma')).toBe('"Line 1\r\n""Quoted"", comma"');
  });

  it('filters to the previous 7-day reporting window and exports actual task completion and focus-time data', () => {
    const tasks: TaskItem[] = [
      {
        id: 'tsk-recent-done',
        code: 'TSK-01',
        title: 'Calibrate " Alpha ", sensor\narray',
        category: 'Field operations',
        projectId: 'prj-1',
        assigneeId: 'usr-soren',
        status: 'Done',
        priority: 'High',
        startDate: '2026-10-10',
        dueDate: '2026-10-18',
        completedDate: '2026-10-17', // 1 day ago (in 7-day window)
        estimateHours: 6,
        loggedSeconds: 7200,
        progress: 100,
        subtasksDone: 3,
        subtasksTotal: 3,
      },
      {
        id: 'tsk-active-focus',
        code: 'TSK-02',
        title: 'Active focus stream',
        category: 'Signal Processing',
        projectId: 'prj-1',
        assigneeId: 'usr-soren',
        status: 'In Progress',
        priority: 'Medium',
        startDate: '2026-10-12',
        dueDate: '2026-10-20',
        estimateHours: 4,
        loggedSeconds: 3600,
        progress: 50,
        subtasksDone: 1,
        subtasksTotal: 2,
      },
      {
        id: 'tsk-old-done',
        code: 'TSK-03',
        title: 'Old completed task outside 7d window',
        category: 'Archive',
        projectId: 'prj-1',
        assigneeId: 'usr-soren',
        status: 'Done',
        priority: 'Low',
        startDate: '2026-09-20',
        dueDate: '2026-10-01',
        completedDate: '2026-10-02', // 16 days ago (outside 7-day window)
        estimateHours: 3,
        loggedSeconds: 10800,
        progress: 100,
        subtasksDone: 2,
        subtasksTotal: 2,
      },
    ];

    const sessions: FocusSession[] = [
      {
        id: 'fs-1',
        date: '2026-10-17',
        daysAgo: 1,
        weekdayIndex: 6,
        projectId: 'prj-1',
        memberId: 'usr-soren',
        taskId: 'tsk-recent-done',
        hours: 3.5,
        seconds: 12600,
        createdAt: '2026-10-17T10:00:00Z',
      },
      {
        id: 'fs-2',
        date: '2026-10-18',
        daysAgo: 0,
        weekdayIndex: 0,
        projectId: 'prj-1',
        memberId: 'usr-soren',
        taskId: 'tsk-active-focus',
        hours: 1.25,
        seconds: 4500,
        createdAt: '2026-10-18T10:00:00Z',
      },
      {
        id: 'fs-old',
        date: '2026-10-02',
        daysAgo: 16,
        weekdayIndex: 5,
        projectId: 'prj-1',
        memberId: 'usr-soren',
        taskId: 'tsk-old-done',
        hours: 5,
        seconds: 18000,
        createdAt: '2026-10-02T10:00:00Z',
      },
    ];

    const rows = deriveWeeklyReportRows(tasks, [mockProject], sessions);
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.taskTitle.includes('Calibrate'))).toEqual({
      taskTitle: 'Calibrate " Alpha ", sensor\narray',
      project: 'Horizon Array, Phase "Alpha"',
      category: 'Field operations',
      completionDate: '2026-10-17',
      loggedHours: 3.5,
    });
    expect(rows.find((r) => r.taskTitle === 'Active focus stream')).toEqual({
      taskTitle: 'Active focus stream',
      project: 'Horizon Array, Phase "Alpha"',
      category: 'Signal Processing',
      completionDate: '',
      loggedHours: 1.25,
    });

    const csv = generateWeeklyReportCsv(tasks, [mockProject], sessions);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Task Title,Project,Category,Completion Date,Logged Hours');
    expect(csv).toContain(
      '"Calibrate "" Alpha "", sensor\narray","Horizon Array, Phase ""Alpha""",Field operations,2026-10-17,3.5'
    );
  });

  it('exports real seed store data accurately', () => {
    const projects = createSeedProjects();
    const tasks = createSeedTasks();
    const sessions = createSeedFocusSessions(tasks, projects);
    const rows = deriveWeeklyReportRows(tasks, projects, sessions);
    expect(rows.length).toBeGreaterThan(0);
  });
});

describe('TeamMessageDialog mailto, clipboard formatting, and wording requirements', () => {
  it('validates recipient email addresses without inventing missing ones', () => {
    expect(isValidRecipientEmail('soren@plotline.studio')).toBe(true);
    expect(isValidRecipientEmail('  mireia@plotline.studio  ')).toBe(true);
    expect(isValidRecipientEmail('')).toBe(false);
    expect(isValidRecipientEmail('invalid-email')).toBe(false);
    expect(isValidRecipientEmail(undefined)).toBe(false);
  });

  it('builds properly encoded mailto URLs and complete clipboard email representations', () => {
    const url = buildMailtoUrl(
      'soren@plotline.studio',
      'Sync & Review: Phase 1',
      'Hi Soren,\nPlease review line #4.'
    );
    expect(url).toBe(
      'mailto:soren@plotline.studio?subject=Sync%20%26%20Review%3A%20Phase%201&body=Hi%20Soren%2C%0APlease%20review%20line%20%234.'
    );

    const clip = formatEmailClipboardText(
      'soren@plotline.studio',
      'Sync & Review: Phase 1',
      'Hi Soren,\nPlease review line #4.'
    );
    expect(clip).toBe(
      'To: soren@plotline.studio\nSubject: Sync & Review: Phase 1\n\nHi Soren,\nPlease review line #4.'
    );
  });

  it('uses plain-language wording in SettingsScreen.tsx and DashboardScreen.tsx', () => {
    const settingsSource = fs.readFileSync(
      path.resolve(__dirname, '../../components/SettingsScreen.tsx'),
      'utf8'
    );
    const dashboardSource = fs.readFileSync(
      path.resolve(__dirname, '../../components/DashboardScreen.tsx'),
      'utf8'
    );

    expect(settingsSource).toContain('Weekly digest reports');
    expect(settingsSource).not.toContain('Field Digest');
    expect(settingsSource).toContain('Requires email setup');
    expect(settingsSource).toContain('Download weekly report');

    expect(dashboardSource).toContain('Activity notifications');
    expect(dashboardSource).not.toMatch(/dispatch/i);
  });
});
