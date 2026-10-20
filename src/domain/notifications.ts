export type NotificationCategory =
  'TaskAssigned' | 'TaskMoved' | 'TaskDueSoon' | 'TaskOverdue' | 'UpcomingEvent';

export interface NotificationRecord {
  id: string;
  category: NotificationCategory;
  title: string;
  detail: string;
  timestamp: number;
  read: boolean;
  relatedId: string; // ID of the task or event
}

export interface AssignmentEvent {
  id: string;
  type: 'AssignmentChanged';
  taskId: string;
  prevAssigneeId: string | null;
  nextAssigneeId: string | null;
  timestamp: number;
}

export interface MovementEvent {
  id: string;
  type: 'StatusChanged';
  taskId: string;
  prevStatus: string;
  nextStatus: string;
  timestamp: number;
}

export type EventLogEntry = AssignmentEvent | MovementEvent;
