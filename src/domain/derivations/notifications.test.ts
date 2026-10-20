import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deriveNotifications } from './notifications';
import { TaskItem, CalendarEvent } from '../types';
import { EventLogEntry } from '../notifications';
import { getNowTimestamp, setClockOverride } from '../../lib/clock';
import { usePlotlineStore } from '../../store';

describe('deriveNotifications', () => {
  beforeEach(() => {
    setClockOverride(new Date(2026, 9, 18, 12, 0, 0));
  });

  afterEach(() => {
    setClockOverride(null);
  });

  const createMockTask = (overrides: Partial<TaskItem> = {}): TaskItem => ({
    id: 't1',
    code: 'TSK-01',
    title: 'Test Task',
    category: 'Telemetry',
    projectId: 'p1',
    assigneeId: 'u1',
    status: 'In Progress',
    priority: 'High',
    startDate: '2026-10-10',
    dueDate: '2026-10-19',
    estimateHours: 4,
    loggedSeconds: 0,
    progress: 50,
    subtasksDone: 1,
    subtasksTotal: 2,
    updatedAt: getNowTimestamp(),
    ...overrides,
  });

  it('derives overdue and due-soon tasks accurately including 47h, 48h, and 49h boundaries', () => {
    const now = getNowTimestamp();
    const overdueTask = createMockTask({
      id: 't-overdue',
      dueDate: new Date(now - 3600 * 1000).toISOString(),
    });
    const due47hTask = createMockTask({
      id: 't-47h',
      dueDate: new Date(now + 47 * 3600 * 1000).toISOString(),
    });
    const due48hTask = createMockTask({
      id: 't-48h',
      dueDate: new Date(now + 48 * 3600 * 1000).toISOString(),
    });
    const due49hTask = createMockTask({
      id: 't-49h',
      dueDate: new Date(now + 49 * 3600 * 1000).toISOString(),
    });
    const doneOverdueTask = createMockTask({
      id: 't-done-overdue',
      status: 'Done',
      dueDate: new Date(now - 24 * 3600 * 1000).toISOString(),
    });
    const doneDueSoonTask = createMockTask({
      id: 't-done-soon',
      status: 'Done',
      dueDate: new Date(now + 12 * 3600 * 1000).toISOString(),
    });

    const result = deriveNotifications(
      [overdueTask, due47hTask, due48hTask, due49hTask, doneOverdueTask, doneDueSoonTask],
      [],
      [],
      [],
      []
    );

    expect(result.find((n) => n.id === 'overdue-t-overdue')?.category).toBe('TaskOverdue');
    expect(result.find((n) => n.id === 'due-t-47h')?.category).toBe('TaskDueSoon');
    expect(result.find((n) => n.id === 'due-t-48h')?.category).toBe('TaskDueSoon');
    expect(result.find((n) => n.id === 'due-t-49h')).toBeUndefined();
    expect(result.find((n) => n.relatedId === 't-done-overdue')).toBeUndefined();
    expect(result.find((n) => n.relatedId === 't-done-soon')).toBeUndefined();
  });

  it('derives upcoming calendar events within 60 minutes including exact boundaries', () => {
    const pastEvent: CalendarEvent = {
      id: 'e-past',
      title: 'Past Sync',
      date: '2026-10-18',
      startTime: '11:59',
      endTime: '12:30',
      category: 'Review',
      projectId: 'p1',
      attendeeIds: [],
      location: 'Room A',
    };
    const nowEvent: CalendarEvent = {
      ...pastEvent,
      id: 'e-now',
      startTime: '12:00',
    };
    const soonEvent: CalendarEvent = {
      ...pastEvent,
      id: 'e-30m',
      startTime: '12:30',
    };
    const exact60mEvent: CalendarEvent = {
      ...pastEvent,
      id: 'e-60m',
      startTime: '13:00',
    };
    const after60mEvent: CalendarEvent = {
      ...pastEvent,
      id: 'e-61m',
      startTime: '13:01',
    };

    const result = deriveNotifications(
      [],
      [pastEvent, nowEvent, soonEvent, exact60mEvent, after60mEvent],
      [],
      [],
      []
    );

    expect(result.find((n) => n.id === 'event-e-past')).toBeUndefined();
    expect(result.find((n) => n.id === 'event-e-now')?.category).toBe('UpcomingEvent');
    expect(result.find((n) => n.id === 'event-e-30m')?.category).toBe('UpcomingEvent');
    expect(result.find((n) => n.id === 'event-e-60m')?.category).toBe('UpcomingEvent');
    expect(result.find((n) => n.id === 'event-e-61m')).toBeUndefined();
  });

  it('maps genuine eventLog entries for TaskAssigned and TaskMoved', () => {
    const now = getNowTimestamp();
    const logs: EventLogEntry[] = [
      {
        id: 'log1',
        type: 'StatusChanged',
        taskId: 't1',
        prevStatus: 'In Progress',
        nextStatus: 'Done',
        timestamp: now - 1000,
      },
      {
        id: 'log2',
        type: 'AssignmentChanged',
        taskId: 't2',
        prevAssigneeId: 'u1',
        nextAssigneeId: 'u2',
        timestamp: now - 500,
      },
    ];
    const result = deriveNotifications([], [], logs, [], ['movement-log1']);

    const moved = result.find((n) => n.id === 'movement-log1');
    const assigned = result.find((n) => n.id === 'assignment-log2');

    expect(moved?.read).toBe(true);
    expect(moved?.category).toBe('TaskMoved');
    expect(assigned?.read).toBe(false);
    expect(assigned?.category).toBe('TaskAssigned');
  });

  it('preserves stable identity, avoids duplicates on repeated derivation, and preserves read state', () => {
    const now = getNowTimestamp();
    const due47hTask = createMockTask({
      id: 't-dup',
      dueDate: new Date(now + 24 * 3600 * 1000).toISOString(),
    });
    const logs: EventLogEntry[] = [
      {
        id: 'log-dup',
        type: 'StatusChanged',
        taskId: 't-dup',
        prevStatus: 'Backlog',
        nextStatus: 'In Review',
        timestamp: now,
      },
    ];

    const firstPass = deriveNotifications(
      [due47hTask, due47hTask],
      [],
      [logs[0], logs[0]],
      [],
      ['due-t-dup']
    );
    const secondPass = deriveNotifications([due47hTask], [], logs, firstPass, ['due-t-dup']);

    expect(firstPass).toHaveLength(2);
    expect(firstPass.map((n) => n.id)).toEqual(secondPass.map((n) => n.id));
    expect(secondPass.find((n) => n.id === 'due-t-dup')?.read).toBe(true);
    expect(secondPass.find((n) => n.id === 'movement-log-dup')?.read).toBe(false);
  });
});

describe('Store transitions, read persistence, and focus prompt behavior', () => {
  beforeEach(() => {
    setClockOverride(new Date(2026, 9, 18, 12, 0, 0));
    usePlotlineStore.getState().resetDemoData();
  });

  afterEach(() => {
    setClockOverride(null);
  });

  it('records genuine task movement and assignment transitions without inventing history on no-ops', () => {
    const store = usePlotlineStore.getState();
    expect(store.eventLog).toHaveLength(0);

    // Moving a task to its current status should NOT record a transition
    const targetTask = store.tasks.find((t) => t.status === 'In Progress')!;
    store.moveTask(targetTask.id, 'In Progress');
    expect(usePlotlineStore.getState().eventLog).toHaveLength(0);

    // Genuine status transition records a StatusChanged movement event
    store.moveTask(targetTask.id, 'In Review');
    expect(usePlotlineStore.getState().eventLog).toHaveLength(1);
    expect(usePlotlineStore.getState().eventLog[0].type).toBe('StatusChanged');
    expect(usePlotlineStore.getState().eventLog[0].taskId).toBe(targetTask.id);

    // Assigning to the same assignee is a no-op
    store.assignTask(targetTask.id, targetTask.assigneeId);
    expect(usePlotlineStore.getState().eventLog).toHaveLength(1);

    // Genuine assignment transition records an AssignmentChanged event
    store.assignTask(targetTask.id, 'usr-mireia');
    expect(usePlotlineStore.getState().eventLog).toHaveLength(2);
    expect(usePlotlineStore.getState().eventLog[1].type).toBe('AssignmentChanged');
  });

  it('persists notification read state across re-derivations', () => {
    const store = usePlotlineStore.getState();
    store.syncNotifications();

    const initialUnread = usePlotlineStore.getState().unreadNotificationIds;
    expect(initialUnread.length).toBeGreaterThan(0);

    const firstId = initialUnread[0];
    store.markNotificationRead(firstId);

    expect(usePlotlineStore.getState().readNotificationIds).toContain(firstId);
    expect(usePlotlineStore.getState().unreadNotificationIds).not.toContain(firstId);

    // Re-syncing preserves read state
    usePlotlineStore.getState().syncNotifications();
    expect(usePlotlineStore.getState().unreadNotificationIds).not.toContain(firstId);

    // Mark all read clears remaining unread IDs
    usePlotlineStore.getState().markAllNotificationsRead();
    expect(usePlotlineStore.getState().unreadNotificationIds).toHaveLength(0);
  });

  it('fires the 90-minute focus session prompt once per session and resets only on a new session', () => {
    usePlotlineStore.setState({
      timerRunning: true,
      timerSeconds: 5399,
      focusPromptFired: false,
      toasts: [],
    });

    // Tick to 5400s (90 minutes) -> fires prompt toast once
    usePlotlineStore.getState().tickTimer();
    const after90m = usePlotlineStore.getState();
    expect(after90m.timerSeconds).toBe(5400);
    expect(after90m.focusPromptFired).toBe(true);
    const focusToasts = after90m.toasts.filter((t) => /90 minutes/i.test(t.title));
    expect(focusToasts).toHaveLength(1);

    // Subsequent ticks in the same session do not fire duplicate prompt toasts
    usePlotlineStore.getState().tickTimer();
    usePlotlineStore.getState().tickTimer();
    expect(
      usePlotlineStore.getState().toasts.filter((t) => /90 minutes/i.test(t.title))
    ).toHaveLength(1);

    // Pause and resume same session does not reset focusPromptFired
    usePlotlineStore.getState().toggleTimer();
    usePlotlineStore.getState().toggleTimer();
    usePlotlineStore.getState().tickTimer();
    expect(usePlotlineStore.getState().focusPromptFired).toBe(true);
    expect(
      usePlotlineStore.getState().toasts.filter((t) => /90 minutes/i.test(t.title))
    ).toHaveLength(1);

    // Resetting timer starts a genuinely new session and resets focusPromptFired
    usePlotlineStore.getState().resetTimer();
    expect(usePlotlineStore.getState().timerSeconds).toBe(0);
    expect(usePlotlineStore.getState().focusPromptFired).toBe(false);
  });
});
