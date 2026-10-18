import type { StateCreator } from 'zustand';
import type {
  AccentName,
  CalendarEvent,
  DerivedProjectStatus,
  FocusSession,
  NewEventInput,
  NewMemberInput,
  NewProjectInput,
  NewTaskInput,
  NotificationSettings,
  Project,
  RouteId,
  StoreSnapshot,
  TaskItem,
  TaskStatus,
  TeamMember,
  ToastNotice,
  UpdateProfileInput,
  WeekStart,
  WorkspaceValidationReport,
} from '../domain/types';

export interface ProjectsSlice {
  projects: Project[];
  lastAddedProjectId: string | null;
  addProject: (input: NewProjectInput) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  importProjects: (
    items: Array<{
      name: string;
      client: string;
      targetDate: string;
      status: DerivedProjectStatus;
    }>
  ) => { importedCount: number; skippedCount: number };
  importSampleBatch: () => Project;
  deleteProject: (projectId: string) => void;
}

export interface TasksSlice {
  tasks: TaskItem[];
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addTask: (input: NewTaskInput) => TaskItem;
  deleteTask: (taskId: string) => void;
}

export interface TeamSlice {
  team: TeamMember[];
  currentUser: TeamMember;
  addTeamMember: (input: NewMemberInput) => TeamMember;
  deleteMember: (memberId: string) => void;
  updateProfile: (input: UpdateProfileInput) => void;
}

export interface EventsSlice {
  events: CalendarEvent[];
  checkedInEventIds: string[];
  addEvent: (input: NewEventInput) => CalendarEvent;
  updateEvent: (eventId: string, input: Partial<NewEventInput>) => void;
  deleteEvent: (eventId: string) => void;
  toggleEventCheckIn: (eventId: string) => void;
}

export interface TimerSlice {
  focusSessions: FocusSession[];
  timerSeconds: number;
  timerRunning: boolean;
  timerTaskId: string;
  toggleTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  setTimerTask: (taskId: string) => void;
}

export interface PreferencesSlice {
  notifications: NotificationSettings;
  accent: AccentName;
  weekStart: WeekStart;
  railCollapsed: boolean;
  isSignedOut: boolean;
  setAccent: (
    accent: AccentName | 'Tide' | 'Moss' | 'Iris' | 'Signal',
    showToast?: boolean
  ) => void;
  setWeekStart: (weekStart: WeekStart, showToast?: boolean) => void;
  setRailCollapsed: (collapsed: boolean) => void;
  toggleRail: () => void;
  toggleNotification: (key: keyof NotificationSettings) => void;
  setSignedOut: (signedOut: boolean) => void;
}

export interface UiSlice {
  activeRoute: RouteId;
  searchQuery: string;
  toasts: ToastNotice[];
  newProjectModalOpen: boolean;
  newTaskModalOpen: boolean;
  commandPaletteOpen: boolean;
  selectedProfileMemberId: string | null;
  selectedProjectIdForDialog: string | null;
  importModalOpen: boolean;
  tourStep: number | null;
  setActiveRoute: (route: RouteId) => void;
  setSearchQuery: (query: string) => void;
  setNewProjectModalOpen: (open: boolean) => void;
  setNewTaskModalOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSelectedProfileMemberId: (id: string | null) => void;
  openProjectDialog: (id: string | null) => void;
  setImportModalOpen: (open: boolean) => void;
  setTourStep: (step: number | null) => void;
  pushToast: (title: string, detail?: string) => void;
  pushToastWithUndo: (title: string, detail?: string, undoAction?: () => void) => void;
  dismissToast: (id: string) => void;
  restoreSnapshot: (snapshot: StoreSnapshot) => void;
  resetDemoData: () => void;
  runValidationCheck: () => WorkspaceValidationReport;
}

export type WorkspaceState = ProjectsSlice &
  TasksSlice &
  TeamSlice &
  EventsSlice &
  TimerSlice &
  PreferencesSlice &
  UiSlice;

export type WorkspaceSliceCreator<T> = StateCreator<WorkspaceState, [], [], T>;
