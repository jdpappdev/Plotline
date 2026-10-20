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

export const ACCENT_THEMES: Record<AccentName, AccentDefinition> = {
  tide: {
    id: 'tide',
    label: 'Tide',
    description: 'Deep marine chart blue (Default)',
    hex: '#204282',
    midHex: '#2c52a3',
    lightHex: '#789ce2',
    softHex: '#e9effa',
    borderHex: '#b8ccf2',
  },
  moss: {
    id: 'moss',
    label: 'Moss',
    description: 'Alpine forestry & botanical index',
    hex: '#2E6B47',
    midHex: '#3b8559',
    lightHex: '#84c29d',
    softHex: '#E8F2EC',
    borderHex: '#A7CBB5',
  },
  iris: {
    id: 'iris',
    label: 'Iris',
    description: 'High-altitude twilight contour violet',
    hex: '#5B43B8',
    midHex: '#6f56d1',
    lightHex: '#a594eb',
    softHex: '#EEEBF9',
    borderHex: '#BEB2EB',
  },
  signal: {
    id: 'signal',
    label: 'Signal',
    description: 'Signal-orange survey marker',
    hex: '#BE3A15',
    midHex: '#d94b24',
    lightHex: '#f59d84',
    softHex: '#FCECE7',
    borderHex: '#F3B7A5',
  },
};

export type TaskStatus = 'Backlog' | 'In Progress' | 'In Review' | 'Done';
export type ProjectStatusFilter = 'all' | 'running' | 'pending' | 'ended';
export type ProjectSortField = 'dueDate' | 'progress' | 'name';
export type DerivedProjectStatus = 'Ended' | 'Pending' | 'Running';

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  sector: string;
  status: 'On Track' | 'At Risk' | 'Planning' | 'Completed' | 'Pending' | 'Running' | 'Ended';
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
  priority: 'High' | 'Medium' | 'Low';
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
  updatedAtLabel?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  discipline: string;
  department: Department;
  presence: PresenceStatus;
  statusLabel: string;
  location: string;
  timezone: string;
  initials: string;
  capacityHours: number;
  allocatedHours: number;
  email: string;
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
  type?: 'Milestone' | 'Field Review' | 'Client Sync' | 'Architecture';
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
  focusPromptFired?: boolean;
}

export interface NewProjectInput {
  id?: string;
  name: string;
  targetDate: string;
  client?: string;
  sector?: string;
  status?: Project['status'];
}

export interface NewTaskInput {
  id?: string;
  title: string;
  category: string;
  priority: TaskItem['priority'];
  assigneeId: string;
  dueDate: string;
  startDate?: string;
  status?: TaskItem['status'];
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
