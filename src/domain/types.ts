export type AccentName = 'tide' | 'moss' | 'iris' | 'signal';
export type WeekStart = 'monday' | 'sunday';
export type RouteId =
  | 'Dashboard'
  | 'Projects'
  | 'Tasks'
  | 'Calendar'
  | 'Analytics'
  | 'Team'
  | 'Settings'
  | 'Help'
  | 'NotFound';
export type Department = 'Engineering' | 'Design' | 'Marketing' | 'Management';
export type PresenceStatus = 'online' | 'away' | 'offline';
export type EventCategory = 'Meeting' | 'Team' | 'Review' | 'Deadline' | 'Social';
export type TaskStatus = 'Backlog' | 'In Progress' | 'In Review' | 'Done';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type DerivedProjectStatus = 'Pending' | 'Running' | 'Ended';
export type ProjectRecordStatus =
  | 'On Track'
  | 'At Risk'
  | 'Planning'
  | 'Completed'
  | DerivedProjectStatus;
export type AnalyticsRangeKey = '7D' | '30D' | '90D';
export type TaskFilterCriterion = 'my' | 'high' | 'week';
export type ProjectStatusFilter = 'all' | 'running' | 'pending' | 'ended';
export type ProjectSortField = 'dueDate' | 'progress' | 'name';

export interface AccentDefinition {
  id: AccentName;
  label: 'Tide' | 'Moss' | 'Iris' | 'Signal';
  description: string;
  hex: string;
  midHex: string;
  lightHex: string;
  softHex: string;
  borderHex: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: Department;
  presence: PresenceStatus;
  statusLabel: string;
  location: string;
  timezone: string;
  initials: string;
  capacityHours: number;
  email: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  sector: string;
  status: ProjectRecordStatus;
  statusOverride?: DerivedProjectStatus;
  leadId: string;
  startDate: string;
  targetDate: string;
  progress: number;
  budgetAllocated: number;
  budgetSpent: number;
  summary: string;
}

export interface TaskItem {
  id: string;
  code: string;
  title: string;
  category: string;
  projectId: string;
  assigneeId: string;
  coAssigneeId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  estimateHours: number;
  loggedSeconds?: number;
  cycleDays?: number;
  onTime?: boolean;
  completedDate?: string;
  progress: number;
  subtasksDone: number;
  subtasksTotal: number;
  weekdayIndex?: number;
  updatedAt?: number;
}

export interface FocusSession {
  id: string;
  taskId: string;
  projectId: string;
  memberId?: string;
  weekdayIndex: number;
  date: string;
  daysAgo?: number;
  seconds: number;
  hours: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  projectId?: string;
  date: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  attendeeIds: string[];
  location: string;
}

export interface NotificationSettings {
  emailDigests: boolean;
  milestoneAlerts: boolean;
  taskMentions: boolean;
  focusReminders: boolean;
  weeklyReport: boolean;
}

export interface ToastNotice {
  id: string;
  title: string;
  detail?: string;
  undoAction?: () => void;
}

export interface StoreSnapshot {
  projects: Project[];
  tasks: TaskItem[];
  team: TeamMember[];
  events: CalendarEvent[];
  focusSessions: FocusSession[];
  timerRunning: boolean;
  timerSeconds: number;
  timerTaskId: string;
}

export interface NewProjectInput {
  id?: string;
  name: string;
  targetDate: string;
  client?: string;
  sector?: string;
  status?: ProjectRecordStatus;
}

export interface NewTaskInput {
  id?: string;
  title: string;
  category: string;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
  startDate?: string;
  status?: TaskStatus;
}

export interface NewMemberInput {
  id?: string;
  name: string;
  role: string;
  department: Department;
  location?: string;
  email?: string;
}

export interface NewEventInput {
  id?: string;
  title: string;
  category: EventCategory;
  date: string;
  startTime: string;
  endTime: string;
  attendeeIds: string[];
  location?: string;
  projectId?: string;
}

export interface UpdateProfileInput {
  name: string;
  role: string;
  email: string;
}

export interface ValidationCheckResult {
  id: string;
  label: string;
  passed: boolean;
  details: string;
}

export interface WorkspaceValidationReport {
  timestamp: string;
  passed: boolean;
  checks: ValidationCheckResult[];
}
