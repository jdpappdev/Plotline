import { TaskItem, CalendarEvent } from '../types';
import { NotificationRecord, EventLogEntry } from '../notifications';
import { getNowTimestamp } from '../../lib/clock';

function parseTaskDueTimestamp(dueDate: string): number {
  const trimmed = (dueDate || '').trim();
  if (!trimmed) return Number.NaN;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T12:00:00`).getTime();
  }
  return new Date(trimmed).getTime();
}

export function deriveNotifications(
  tasks: TaskItem[],
  events: CalendarEvent[],
  eventLog: EventLogEntry[],
  existingNotifications: NotificationRecord[] = [],
  readNotificationIds: string[] = []
): NotificationRecord[] {
  const now = getNowTimestamp();
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;
  const sixtyMinutesMs = 60 * 60 * 1000;

  const existingById = new Map<string, NotificationRecord>();
  for (const item of existingNotifications) {
    if (item && typeof item.id === 'string') {
      existingById.set(item.id, item);
    }
  }
  const readSet = new Set<string>(readNotificationIds);
  const taskById = new Map<string, TaskItem>();
  for (const task of tasks) {
    if (task && typeof task.id === 'string' && !taskById.has(task.id)) {
      taskById.set(task.id, task);
    }
  }

  const candidateNotifications: NotificationRecord[] = [];
  const seenIds = new Set<string>();

  const pushUnique = (record: NotificationRecord) => {
    if (seenIds.has(record.id)) return;
    seenIds.add(record.id);
    const existing = existingById.get(record.id);
    const isRead = Boolean(existing?.read) || readSet.has(record.id) || record.read;
    candidateNotifications.push({
      ...record,
      timestamp: existing ? existing.timestamp : record.timestamp,
      read: isRead,
    });
  };

  // 1. Due Soon & Overdue
  tasks.forEach((task) => {
    if (!task || task.status === 'Done') return;

    const dueDate = parseTaskDueTimestamp(task.dueDate);
    if (Number.isNaN(dueDate)) return;
    const timeDiff = dueDate - now;

    if (timeDiff < 0) {
      pushUnique({
        id: `overdue-${task.id}`,
        category: 'TaskOverdue',
        title: 'Task Overdue',
        detail: `Task "${task.title}" was due on ${task.dueDate}.`,
        timestamp: now,
        read: false,
        relatedId: task.id,
      });
    } else if (timeDiff <= fortyEightHoursMs) {
      pushUnique({
        id: `due-${task.id}`,
        category: 'TaskDueSoon',
        title: 'Task Due Soon',
        detail: `Task "${task.title}" is due on ${task.dueDate}.`,
        timestamp: now,
        read: false,
        relatedId: task.id,
      });
    }
  });

  // 2. Upcoming Events (starting within 60 minutes)
  events.forEach((event) => {
    if (!event || !event.date || !event.startTime) return;
    const eventDateTime = new Date(`${event.date}T${event.startTime}`).getTime();
    if (Number.isNaN(eventDateTime)) return;
    const timeDiff = eventDateTime - now;

    if (timeDiff >= 0 && timeDiff <= sixtyMinutesMs) {
      pushUnique({
        id: `event-${event.id}`,
        category: 'UpcomingEvent',
        title: 'Upcoming Event',
        detail: `Event "${event.title}" starts at ${event.startTime}.`,
        timestamp: now,
        read: false,
        relatedId: event.id,
      });
    }
  });

  // 3. Assignment & Movement Events from genuine recorded transitions
  eventLog.forEach((event) => {
    if (!event) return;
    const matchedTask = taskById.get(event.taskId);
    const taskLabel = matchedTask?.title || event.taskId;

    if (event.type === 'AssignmentChanged') {
      if (event.prevAssigneeId === event.nextAssigneeId) return;
      pushUnique({
        id: `assignment-${event.id}`,
        category: 'TaskAssigned',
        title: 'Task Assigned',
        detail: `Task "${taskLabel}" assigned.`,
        timestamp: event.timestamp,
        read: false,
        relatedId: event.taskId,
      });
    } else if (event.type === 'StatusChanged') {
      if (event.prevStatus === event.nextStatus) return;
      pushUnique({
        id: `movement-${event.id}`,
        category: 'TaskMoved',
        title: 'Task Moved',
        detail: `Task "${taskLabel}" moved from ${event.prevStatus} to ${event.nextStatus}.`,
        timestamp: event.timestamp,
        read: false,
        relatedId: event.taskId,
      });
    }
  });

  return candidateNotifications;
}
