import type {
  TaskItem,
  CalendarEvent,
  Project,
  TeamMember,
  FocusSession,
  NotificationSettings,
  ToastNotice,
  AccentName,
  RouteId,
  WeekStart,
  NewProjectInput,
  NewTaskInput,
  NewMemberInput,
  NewEventInput,
  UpdateProfileInput,
  StoreSnapshot,
  WorkspaceValidationReport,
} from '../domain/types';
import type { EventLogEntry } from '../domain/notifications';

export interface TasksSlice {
  tasks: TaskItem[];
  newTaskModalOpen: boolean;
  setNewTaskModalOpen: (open: boolean) => void;
  moveTask: (taskId: string, newStatus: TaskItem['status']) => void;
  assignTask: (taskId: string, assigneeId: string) => void;
  addTask: (input: NewTaskInput) => TaskItem;
  deleteTask: (taskId: string) => void;
}

export interface ProjectsSlice {
  projects: Project[];
  lastAddedProjectId: string | null;
  selectedProjectIdForDialog: string | null;
  newProjectModalOpen: boolean;
  importModalOpen: boolean;
  openProjectDialog: (id: string | null) => void;
  setImportModalOpen: (open: boolean) => void;
  setNewProjectModalOpen: (open: boolean) => void;
  addProject: (input: NewProjectInput) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  importProjects: (
    items: Array<{
      name: string;
      client: string;
      targetDate: string;
      status: 'Pending' | 'Running' | 'Ended';
    }>
  ) => { importedCount: number; skippedCount: number };
  importSampleBatch: () => Project;
  deleteProject: (projectId: string) => void;
}

export interface TeamSlice {
  team: TeamMember[];
  currentUser: TeamMember;
  selectedProfileMemberId: string | null;
  setSelectedProfileMemberId: (id: string | null) => void;
  addTeamMember: (input: NewMemberInput) => TeamMember;
  deleteMember: (memberId: string) => void;
  updateProfile: (updates: UpdateProfileInput) => void;
}

export interface CalendarSlice {
  events: CalendarEvent[];
  checkedInEventIds: string[];
  addEvent: (input: NewEventInput) => CalendarEvent;
  updateEvent: (eventId: string, input: Partial<NewEventInput>) => void;
  deleteEvent: (eventId: string) => void;
  toggleEventCheckIn: (eventId: string) => void;
}

export interface TimerSlice {
  focusSessions: FocusSession[];
  timerRunning: boolean;
  timerSeconds: number;
  timerTaskId: string;
  focusPromptFired: boolean;
  tickTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setTimerTask: (taskId: string) => void;
}

export interface UISlice {
  notifications: NotificationSettings;
  accent: AccentName;
  weekStart: WeekStart;
  activeRoute: RouteId;
  railCollapsed: boolean;
  searchQuery: string;
  toasts: ToastNotice[];
  commandPaletteOpen: boolean;
  tourStep: number | null;
  isSignedOut: boolean;
  setAccent: (
    accent: AccentName | 'Tide' | 'Moss' | 'Iris' | 'Signal',
    showToast?: boolean
  ) => void;
  setWeekStart: (weekStart: WeekStart, showToast?: boolean) => void;
  setActiveRoute: (route: RouteId) => void;
  setRailCollapsed: (collapsed: boolean) => void;
  toggleRail: () => void;
  setSearchQuery: (query: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTourStep: (step: number | null) => void;
  setSignedOut: (signedOut: boolean) => void;
  toggleNotification: (key: keyof NotificationSettings) => void;
  pushToast: (title: string, detail?: string) => void;
  pushToastWithUndo: (title: string, detail?: string, undoAction?: () => void) => void;
  dismissToast: (id: string) => void;
}

export interface EventLogSlice {
  eventLog: EventLogEntry[];
  recordAssignmentEvent: (
    taskId: string,
    prevAssigneeId: string | null,
    nextAssigneeId: string | null
  ) => void;
  recordMovementEvent: (taskId: string, prevStatus: string, nextStatus: string) => void;
}

export interface NotificationsSlice {
  unreadNotificationIds: string[];
  readNotificationIds: string[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids?: string[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (ids?: string[]) => void;
  syncNotifications: () => void;
}

export interface PlotlineState
  extends
    ProjectsSlice,
    TasksSlice,
    TeamSlice,
    CalendarSlice,
    TimerSlice,
    UISlice,
    EventLogSlice,
    NotificationsSlice {
  restoreSnapshot: (snapshot: StoreSnapshot) => void;
  resetDemoData: () => void;
  runValidationCheck: () => WorkspaceValidationReport;
}
