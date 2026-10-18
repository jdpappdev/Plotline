import { create } from 'zustand';
import { contourGlyph, hashSeed, mulberry32 } from './utils/contourGlyph';

export { contourGlyph };

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).contourGlyph = contourGlyph;
}

export type AccentName = 'tide' | 'moss' | 'iris' | 'signal';
export type WeekStart = 'monday' | 'sunday';
export type RouteId =
  | 'Dashboard'
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

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  sector: string;
  status: 'On Track' | 'At Risk' | 'Planning' | 'Completed';
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
  status: 'Backlog' | 'In Progress' | 'In Review' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
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
  tasksCompletedCount?: number;
  cycleDays?: number;
  onTimeCount?: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  projectId: string;
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

const ACCENT_STORAGE_KEY = 'plotline-accent-v2';
const WEEK_START_STORAGE_KEY = 'plotline-week-start';
const TIMER_SECONDS_STORAGE_KEY = 'plotline-timer-seconds-v2';
const TIMER_RUNNING_STORAGE_KEY = 'plotline-timer-running-v2';
const TIMER_TASK_STORAGE_KEY = 'plotline-timer-task-v2';
const TASKS_STORAGE_KEY = 'plotline-tasks-v3';
const PROJECTS_STORAGE_KEY = 'plotline-projects-v3';
const TEAM_STORAGE_KEY = 'plotline-team-v3';
const EVENTS_STORAGE_KEY = 'plotline-events-v2';
const FOCUS_SESSIONS_STORAGE_KEY = 'plotline-focus-sessions-v3';
const NOTIFICATIONS_STORAGE_KEY = 'plotline-notifications-v1';
const CURRENT_USER_STORAGE_KEY = 'plotline-current-user-v1';
const SIGNED_OUT_STORAGE_KEY = 'plotline-signed-out-v1';
const RAIL_COLLAPSED_STORAGE_KEY = 'plotline-rail-collapsed-v1';
const CHECKED_IN_EVENTS_STORAGE_KEY = 'plotline-checked-in-events-v1';

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getIsoDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDuration(totalSeconds: number): string {
  const secs = Math.max(0, Math.round(totalSeconds || 0));
  if (secs === 0) return '0m';
  if (secs < 60) return '<1m';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  return `${(secs / 3600).toFixed(1)}h`;
}

export function formatLoggedDuration(seconds: number): string {
  return formatDuration(seconds);
}

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (item && typeof item.id === 'string' && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

export function computeInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return 'PL';
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function normalizeAccent(value: string | null | undefined): AccentName {
  if (!value) return 'tide';
  const lower = value.toLowerCase().trim();
  if (lower === 'tide' || lower === 'moss' || lower === 'iris' || lower === 'signal') {
    return lower;
  }
  return 'tide';
}

export function applyAccentCssVariables(accent: AccentName): void {
  if (typeof document === 'undefined') return;
  const theme = ACCENT_THEMES[accent] || ACCENT_THEMES.tide;
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.hex);
  root.style.setProperty('--accent-mid', theme.midHex);
  root.style.setProperty('--accent-light', theme.lightHex);
  root.style.setProperty('--accent-deep', 'color-mix(in oklab, var(--accent) 68%, black)');
  root.style.setProperty(
    '--surface-accent',
    'linear-gradient(155deg, var(--accent) 0%, var(--accent-deep) 100%)'
  );
  root.style.setProperty('--accent-hover', theme.midHex);
  root.style.setProperty('--accent-soft', theme.softHex);
  root.style.setProperty('--accent-border', theme.borderHex);
  root.setAttribute('data-accent', theme.id);
}

function loadInitialAccent(): AccentName {
  if (typeof window === 'undefined') return 'tide';
  try {
    const saved = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    const resolved = normalizeAccent(saved);
    applyAccentCssVariables(resolved);
    return resolved;
  } catch {
    return 'tide';
  }
}

function loadInitialWeekStart(): WeekStart {
  if (typeof window === 'undefined') return 'monday';
  try {
    const saved = window.localStorage.getItem(WEEK_START_STORAGE_KEY);
    return saved === 'sunday' ? 'sunday' : 'monday';
  } catch {
    return 'monday';
  }
}

function loadInitialTimerSeconds(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = window.localStorage.getItem(TIMER_SECONDS_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
    }
    return 0;
  } catch {
    return 0;
  }
}

function loadInitialTimerRunning(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(TIMER_RUNNING_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function loadInitialTimerTaskId(): string {
  if (typeof window === 'undefined') return 'tsk-401';
  try {
    const saved = window.localStorage.getItem(TIMER_TASK_STORAGE_KEY);
    return saved || 'tsk-401';
  } catch {
    return 'tsk-401';
  }
}

function loadInitialSignedOut(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SIGNED_OUT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function loadInitialRailCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(RAIL_COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function loadInitialCheckedInEvents(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CHECKED_IN_EVENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore
  }
  return [];
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailDigests: true,
  milestoneAlerts: true,
  taskMentions: true,
  focusReminders: false,
  weeklyReport: true,
};

function loadInitialNotifications(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_NOTIFICATIONS;
}

const SEED_TEAM: TeamMember[] = [
  {
    id: 'usr-soren',
    name: 'Soren Lindqvist',
    role: 'Principal Systems Architect',
    discipline: 'Spatial Computing & Cartography',
    department: 'Engineering',
    presence: 'online',
    statusLabel: 'Active in Cartography Lab',
    location: 'Stockholm, SE',
    timezone: 'CET (UTC+1)',
    initials: 'SL',
    capacityHours: 40,
    allocatedHours: 32,
    email: 'soren@plotline.studio',
  },
  {
    id: 'usr-mireia',
    name: 'Mireia Vance',
    role: 'Design Director',
    discipline: 'Industrial & Interface Design',
    department: 'Design',
    presence: 'online',
    statusLabel: 'Reviewing Bridge UI Specs',
    location: 'Barcelona, ES',
    timezone: 'CET (UTC+1)',
    initials: 'MV',
    capacityHours: 40,
    allocatedHours: 30,
    email: 'mireia@plotline.studio',
  },
  {
    id: 'usr-tarek',
    name: 'Tarek Al-Mansoor',
    role: 'Lead Telemetry Engineer',
    discipline: 'Embedded & Edge Data',
    department: 'Engineering',
    presence: 'online',
    statusLabel: 'Monitoring Wellhead #07',
    location: 'Zurich, CH',
    timezone: 'CET (UTC+1)',
    initials: 'TA',
    capacityHours: 40,
    allocatedHours: 34,
    email: 'tarek@plotline.studio',
  },
  {
    id: 'usr-kaelen',
    name: 'Kaelen Okafor',
    role: 'Delivery Producer',
    discipline: 'Operations & Client Strategy',
    department: 'Management',
    presence: 'online',
    statusLabel: 'Client Charter Alignment',
    location: 'London, UK',
    timezone: 'GMT (UTC+0)',
    initials: 'KO',
    capacityHours: 40,
    allocatedHours: 28,
    email: 'kaelen@plotline.studio',
  },
  {
    id: 'usr-nadia',
    name: 'Nadia Kovalenko',
    role: 'Senior Visualization Engineer',
    discipline: 'Visualization & WebGL',
    department: 'Engineering',
    presence: 'away',
    statusLabel: 'Shader Profiling Session',
    location: 'Tallinn, EE',
    timezone: 'EET (UTC+2)',
    initials: 'NK',
    capacityHours: 36,
    allocatedHours: 26,
    email: 'nadia@plotline.studio',
  },
  {
    id: 'usr-juno',
    name: 'Juno Takahashi',
    role: 'Partner Communications Lead',
    discipline: 'Technical Publications & Outreach',
    department: 'Marketing',
    presence: 'offline',
    statusLabel: 'Kyoto Field Documentation',
    location: 'Kyoto, JP',
    timezone: 'JST (UTC+9)',
    initials: 'JT',
    capacityHours: 40,
    allocatedHours: 24,
    email: 'juno@plotline.studio',
  },
];

function loadInitialCurrentUser(): TeamMember {
  if (typeof window === 'undefined') return SEED_TEAM[0];
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.name) return parsed;
    }
  } catch {
    // Ignore
  }
  return SEED_TEAM[0];
}

const SEED_PROJECTS: Project[] = [
  {
    id: 'prj-kestrel',
    code: 'PLT-101',
    name: 'Kestrel Bathymetric Atlas',
    client: 'North Sea Hydrographic Consortium',
    sector: 'Marine Cartography',
    status: 'On Track',
    leadId: 'usr-soren',
    startDate: '2026-09-01',
    targetDate: '2026-12-15',
    progress: 68,
    budgetAllocated: 185000,
    budgetSpent: 121400,
    summary: 'Sub-meter sonar contour pipeline and deck officer tablet interface for deep-shelf cable routing.',
  },
  {
    id: 'prj-caldera',
    code: 'PLT-104',
    name: 'Caldera Borehole Telemetry',
    client: 'Reykjanes Thermal Collective',
    sector: 'Geothermal Energy',
    status: 'At Risk',
    leadId: 'usr-tarek',
    startDate: '2026-08-14',
    targetDate: '2026-11-20',
    progress: 54,
    budgetAllocated: 240000,
    budgetSpent: 164000,
    summary: 'Real-time pressure and silica scaling diagnostics across 18 high-enthalpy geothermal wellheads.',
  },
  {
    id: 'prj-nacre',
    code: 'PLT-108',
    name: 'Nacre Reference Console',
    client: 'Atelier Onda Acoustics',
    sector: 'Precision Audio Hardware',
    status: 'On Track',
    leadId: 'usr-mireia',
    startDate: '2026-09-18',
    targetDate: '2027-01-30',
    progress: 42,
    budgetAllocated: 145000,
    budgetSpent: 58200,
    summary: 'Embedded rotary control grammar and room-mode calibration workbench for studio monitors.',
  },
  {
    id: 'prj-sable',
    code: 'PLT-112',
    name: 'Sable Seedbank Ledger',
    client: 'Svalbard Arid Flora Trust',
    sector: 'Botanical Preservation',
    status: 'On Track',
    leadId: 'usr-nadia',
    startDate: '2026-10-01',
    targetDate: '2027-02-14',
    progress: 29,
    budgetAllocated: 110000,
    budgetSpent: 31900,
    summary: 'Cryogenic vault provenance index, germination audit schedules, and offline field collection kit.',
  },
  {
    id: 'prj-vespera',
    code: 'PLT-115',
    name: 'Vespera Horizon Array',
    client: 'Atacama Submillimeter Observatory',
    sector: 'Astrophysics Instrumentation',
    status: 'Planning',
    leadId: 'usr-kaelen',
    startDate: '2026-10-20',
    targetDate: '2027-04-10',
    progress: 12,
    budgetAllocated: 310000,
    budgetSpent: 28500,
    summary: 'Baseline interferometer scheduling matrix and high-altitude dish maintenance dispatcher.',
  },
];

const SEED_BASE_TIMESTAMP = 1760000000000;

const SEED_TASKS: TaskItem[] = [
  {
    id: 'tsk-401',
    code: 'PLT-101-A',
    title: 'Calibrate multi-beam contour smoothing kernel for 400m shelf drop',
    category: 'Cartography',
    projectId: 'prj-kestrel',
    assigneeId: 'usr-soren',
    coAssigneeId: 'usr-nadia',
    status: 'In Progress',
    priority: 'High',
    dueDate: getIsoDateOffset(2),
    estimateHours: 14,
    loggedSeconds: 0,
    cycleDays: 2.1,
    onTime: true,
    progress: 62,
    subtasksDone: 3,
    subtasksTotal: 5,
    weekdayIndex: 1,
    updatedAt: SEED_BASE_TIMESTAMP - 18 * 60_000,
    updatedAtLabel: '18m ago',
  },
  {
    id: 'tsk-402',
    code: 'PLT-101-B',
    title: 'Validate night-watch low-luminance palette on bridge display hardware',
    category: 'Interface',
    projectId: 'prj-kestrel',
    assigneeId: 'usr-mireia',
    status: 'In Review',
    priority: 'Medium',
    dueDate: getIsoDateOffset(4),
    estimateHours: 16,
    loggedSeconds: 0,
    cycleDays: 2.6,
    onTime: true,
    progress: 85,
    subtasksDone: 5,
    subtasksTotal: 6,
    weekdayIndex: 2,
    updatedAt: SEED_BASE_TIMESTAMP - 42 * 60_000,
    updatedAtLabel: '42m ago',
  },
  {
    id: 'tsk-403',
    code: 'PLT-104-A',
    title: 'Isolate packet jitter on Wellhead #07 fiber-optic transceiver ring',
    category: 'Telemetry',
    projectId: 'prj-caldera',
    assigneeId: 'usr-tarek',
    coAssigneeId: 'usr-soren',
    status: 'In Progress',
    priority: 'High',
    dueDate: getIsoDateOffset(1),
    estimateHours: 20,
    loggedSeconds: 0,
    cycleDays: 3.2,
    onTime: true,
    progress: 50,
    subtasksDone: 2,
    subtasksTotal: 4,
    weekdayIndex: 3,
    updatedAt: SEED_BASE_TIMESTAMP - 60 * 60_000,
    updatedAtLabel: '1h ago',
  },
  {
    id: 'tsk-404',
    code: 'PLT-104-B',
    title: 'Draft thermal threshold escalation protocol with Reykjanes safety lead',
    category: 'Field Ops',
    projectId: 'prj-caldera',
    assigneeId: 'usr-kaelen',
    status: 'Backlog',
    priority: 'High',
    dueDate: getIsoDateOffset(5),
    estimateHours: 17,
    loggedSeconds: 0,
    cycleDays: 2.8,
    onTime: false,
    progress: 20,
    subtasksDone: 1,
    subtasksTotal: 4,
    weekdayIndex: 4,
    updatedAt: SEED_BASE_TIMESTAMP - 120 * 60_000,
    updatedAtLabel: '2h ago',
  },
  {
    id: 'tsk-405',
    code: 'PLT-108-A',
    title: 'Prepare acoustic field dossier & partner launch brief for Atelier Onda',
    category: 'Outreach',
    projectId: 'prj-nacre',
    assigneeId: 'usr-juno',
    coAssigneeId: 'usr-mireia',
    status: 'In Review',
    priority: 'Medium',
    dueDate: getIsoDateOffset(3),
    estimateHours: 15,
    loggedSeconds: 0,
    cycleDays: 1.9,
    onTime: true,
    progress: 78,
    subtasksDone: 4,
    subtasksTotal: 5,
    weekdayIndex: 5,
    updatedAt: SEED_BASE_TIMESTAMP - 180 * 60_000,
    updatedAtLabel: '3h ago',
  },
  {
    id: 'tsk-406',
    code: 'PLT-108-B',
    title: 'Build WebGL waterfall decay plot with 120fps tabular cursor readout',
    category: 'Visualization',
    projectId: 'prj-nacre',
    assigneeId: 'usr-nadia',
    status: 'Done',
    priority: 'Medium',
    dueDate: getIsoDateOffset(-1),
    completedDate: getIsoDateOffset(-1),
    estimateHours: 12,
    loggedSeconds: 0,
    cycleDays: 2.2,
    onTime: true,
    progress: 100,
    subtasksDone: 4,
    subtasksTotal: 4,
    weekdayIndex: 6,
    updatedAt: SEED_BASE_TIMESTAMP - 300 * 60_000,
    updatedAtLabel: '5h ago',
  },
  {
    id: 'tsk-407',
    code: 'PLT-112-A',
    title: 'Define offline IndexedDB sync schema for remote desert specimen intake',
    category: 'Architecture',
    projectId: 'prj-sable',
    assigneeId: 'usr-soren',
    status: 'Done',
    priority: 'Medium',
    dueDate: getIsoDateOffset(-2),
    completedDate: getIsoDateOffset(-2),
    estimateHours: 11,
    loggedSeconds: 0,
    cycleDays: 1.8,
    onTime: true,
    progress: 100,
    subtasksDone: 3,
    subtasksTotal: 3,
    weekdayIndex: 0,
    updatedAt: SEED_BASE_TIMESTAMP - 86400_000,
    updatedAtLabel: 'Yesterday',
  },
  {
    id: 'tsk-408',
    code: 'PLT-115-A',
    title: 'Finalize Chajnantor plateau wind-load telemetry ingestion specification',
    category: 'Telemetry',
    projectId: 'prj-vespera',
    assigneeId: 'usr-kaelen',
    status: 'Backlog',
    priority: 'Low',
    dueDate: getIsoDateOffset(9),
    estimateHours: 9,
    loggedSeconds: 0,
    cycleDays: 3.1,
    onTime: true,
    progress: 12,
    subtasksDone: 0,
    subtasksTotal: 3,
    weekdayIndex: 2,
    updatedAt: SEED_BASE_TIMESTAMP - 90000_000,
    updatedAtLabel: 'Yesterday',
  },
];

/**
 * Generates a deterministic 180-day history of focus sessions for completed past days
 * (daysAgo 1..179). Today (daysAgo 0) starts at 0s so live Focus Timer sessions on today
 * are reflected with exact second-level precision.
 */
function buildSeededFocusHistory(): FocusSession[] {
  const rand = mulberry32(hashSeed('plotline-90d-analytics-history-v3'));
  const sessions: FocusSession[] = [];
  const projectIds = ['prj-kestrel', 'prj-caldera', 'prj-nacre', 'prj-sable', 'prj-vespera'];
  const taskIds = ['tsk-401', 'tsk-403', 'tsk-405', 'tsk-407', 'tsk-408', 'tsk-402', 'tsk-406'];
  const memberIds = ['usr-soren', 'usr-tarek', 'usr-mireia', 'usr-nadia', 'usr-kaelen', 'usr-juno'];

  // Days 1..179 ago (today starts clean at 0s)
  for (let daysAgo = 179; daysAgo >= 1; daysAgo--) {
    const dateStr = getIsoDateOffset(-daysAgo);
    const dObj = new Date(`${dateStr}T12:00:00`);
    const weekdayIndex = dObj.getDay();

    // Create 2 to 3 sessions per day
    const sessionCount = weekdayIndex === 0 || weekdayIndex === 6 ? 2 : 3;
    for (let sIdx = 0; sIdx < sessionCount; sIdx++) {
      const pIdx = (daysAgo + sIdx * 2) % (daysAgo < 25 ? 4 : 5);
      const projectId = projectIds[pIdx];
      const taskId = taskIds[(daysAgo + sIdx) % taskIds.length];
      const memberId = memberIds[(daysAgo + sIdx * 3) % memberIds.length];

      // Slight upward velocity in recent 30 days vs older days so deltas are distinct per range
      const recencyBoost = daysAgo < 7 ? 1.18 : daysAgo < 30 ? 1.08 : daysAgo < 90 ? 0.96 : 0.85;
      const baseHours = (1.1 + rand() * 1.65) * recencyBoost;
      const seconds = Math.round(Number(baseHours.toFixed(1)) * 3600);
      const hours = seconds / 3600;
      const tasksCompletedCount = rand() > (daysAgo < 30 ? 0.42 : 0.54) ? 1 : 0;
      const cycleDays = Number((1.6 + rand() * 2.1 * (daysAgo < 30 ? 0.88 : 1.08)).toFixed(1));
      const onTimeCount = tasksCompletedCount > 0 ? (rand() > (daysAgo < 30 ? 0.08 : 0.16) ? 1 : 0) : 0;

      sessions.push({
        id: `fcs-hist-${daysAgo}-${sIdx}`,
        taskId,
        projectId,
        memberId,
        weekdayIndex,
        date: dateStr,
        daysAgo,
        seconds,
        hours,
        tasksCompletedCount,
        cycleDays,
        onTimeCount,
        createdAt: `${dateStr}T10:00:00Z`,
      });
    }
  }

  return sessions;
}

const SEED_FOCUS_SESSIONS: FocusSession[] = buildSeededFocusHistory();

const SEED_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-01',
    title: 'North Sea Bathymetric Mesh Sign-Off',
    projectId: 'prj-kestrel',
    date: getTodayIsoDate(),
    startTime: '09:30',
    endTime: '10:45',
    category: 'Review',
    type: 'Milestone',
    attendeeIds: ['usr-soren', 'usr-mireia', 'usr-kaelen'],
    location: 'Room 04 · Cartography Lab',
  },
  {
    id: 'evt-02',
    title: 'Wellhead #07 Transceiver Telemetry Sync',
    projectId: 'prj-caldera',
    date: getTodayIsoDate(),
    startTime: '14:00',
    endTime: '15:00',
    category: 'Meeting',
    type: 'Field Review',
    attendeeIds: ['usr-tarek', 'usr-soren'],
    location: 'Telemetry Bridge / Remote Link',
  },
  {
    id: 'evt-03',
    title: 'Studio Calibration Coffee & Fika',
    projectId: 'prj-nacre',
    date: getTodayIsoDate(),
    startTime: '16:30',
    endTime: '17:15',
    category: 'Social',
    type: 'Client Sync',
    attendeeIds: ['usr-soren', 'usr-mireia', 'usr-nadia', 'usr-juno'],
    location: 'Commons Courtyard',
  },
  {
    id: 'evt-04',
    title: 'Atelier Onda Acoustic Enclosure Listening Session',
    projectId: 'prj-nacre',
    date: getIsoDateOffset(1),
    startTime: '11:00',
    endTime: '12:30',
    category: 'Review',
    type: 'Client Sync',
    attendeeIds: ['usr-mireia', 'usr-juno', 'usr-nadia'],
    location: 'Anechoic Studio B',
  },
  {
    id: 'evt-05',
    title: 'Reykjanes Silica Scaling Deadline',
    projectId: 'prj-caldera',
    date: getIsoDateOffset(2),
    startTime: '17:00',
    endTime: '18:00',
    category: 'Deadline',
    type: 'Milestone',
    attendeeIds: ['usr-tarek', 'usr-kaelen'],
    location: 'Reykjanes Field Sector',
  },
  {
    id: 'evt-06',
    title: 'All-Hands Cartography & Instrumentation Standup',
    projectId: 'prj-kestrel',
    date: getIsoDateOffset(3),
    startTime: '10:00',
    endTime: '11:00',
    category: 'Team',
    type: 'Architecture',
    attendeeIds: ['usr-soren', 'usr-mireia', 'usr-tarek', 'usr-kaelen', 'usr-nadia'],
    location: 'Main Drafting Hall',
  },
  {
    id: 'evt-07',
    title: 'Svalbard Vault Taxonomy & Barcode Audit',
    projectId: 'prj-sable',
    date: getIsoDateOffset(5),
    startTime: '15:00',
    endTime: '16:30',
    category: 'Review',
    type: 'Architecture',
    attendeeIds: ['usr-nadia', 'usr-soren'],
    location: 'Room 02 · Archive Wing',
  },
  {
    id: 'evt-08',
    title: 'Q4 Instrument Charter Freeze',
    projectId: 'prj-vespera',
    date: getIsoDateOffset(7),
    startTime: '18:00',
    endTime: '19:00',
    category: 'Deadline',
    type: 'Milestone',
    attendeeIds: ['usr-kaelen', 'usr-soren'],
    location: 'Client Portal',
  },
  {
    id: 'evt-09',
    title: 'Design Critique: Bridge Low-Light Tokens',
    projectId: 'prj-kestrel',
    date: getIsoDateOffset(-2),
    startTime: '13:00',
    endTime: '14:15',
    category: 'Team',
    type: 'Field Review',
    attendeeIds: ['usr-mireia', 'usr-nadia'],
    location: 'Design Crit Wall',
  },
  {
    id: 'evt-10',
    title: 'Hydrographic Partner Roundtable',
    projectId: 'prj-kestrel',
    date: getIsoDateOffset(2),
    startTime: '09:00',
    endTime: '10:00',
    category: 'Meeting',
    type: 'Client Sync',
    attendeeIds: ['usr-soren', 'usr-kaelen'],
    location: 'Briefing Room A',
  },
  {
    id: 'evt-11',
    title: 'Wellhead Fiber Ring Stress Test',
    projectId: 'prj-caldera',
    date: getIsoDateOffset(2),
    startTime: '11:30',
    endTime: '12:30',
    category: 'Review',
    type: 'Field Review',
    attendeeIds: ['usr-tarek', 'usr-nadia'],
    location: 'Telemetry Lab',
  },
  {
    id: 'evt-12',
    title: 'Nordic Field Crew Dinner',
    projectId: 'prj-sable',
    date: getIsoDateOffset(2),
    startTime: '19:30',
    endTime: '21:00',
    category: 'Social',
    type: 'Client Sync',
    attendeeIds: ['usr-soren', 'usr-mireia', 'usr-tarek', 'usr-kaelen'],
    location: 'Skeppsholmen Pier',
  },
];

function loadPersistedTasks(): TaskItem[] {
  if (typeof window === 'undefined') return SEED_TASKS;
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = dedupeById<TaskItem>(parsed)
          .filter(
            (t) =>
              !t.title?.startsWith('Establish baseline survey & instrumentation charter for ') &&
              !t.title?.startsWith('Verify imported point-cloud checksums for ')
          )
          .map((t, idx) => ({
            ...t,
            updatedAt:
              typeof t.updatedAt === 'number'
                ? t.updatedAt
                : SEED_BASE_TIMESTAMP - (idx + 1) * 60_000,
          }));
        if (cleaned.length !== parsed.length) {
          savePersistedTasks(cleaned);
        }
        return cleaned;
      }
    }
  } catch {
    // Ignore
  }
  return SEED_TASKS;
}

function savePersistedTasks(tasks: TaskItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(dedupeById(tasks)));
  } catch {
    // Ignore
  }
}

function loadPersistedProjects(): Project[] {
  if (typeof window === 'undefined') return SEED_PROJECTS;
  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const deduped = dedupeById<Project>(parsed);
        if (deduped.length !== parsed.length) {
          savePersistedProjects(deduped);
        }
        return deduped;
      }
    }
  } catch {
    // Ignore
  }
  return SEED_PROJECTS;
}

function savePersistedProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(dedupeById(projects)));
  } catch {
    // Ignore
  }
}

function loadPersistedTeam(): TeamMember[] {
  if (typeof window === 'undefined') return SEED_TEAM;
  try {
    const raw = window.localStorage.getItem(TEAM_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const deduped = dedupeById<TeamMember>(parsed);
        if (deduped.length !== parsed.length) {
          savePersistedTeam(deduped);
        }
        return deduped;
      }
    }
  } catch {
    // Ignore
  }
  return SEED_TEAM;
}

function savePersistedTeam(team: TeamMember[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(dedupeById(team)));
  } catch {
    // Ignore
  }
}

function loadPersistedEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return SEED_EVENTS;
  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const deduped = dedupeById<CalendarEvent>(parsed);
        if (deduped.length !== parsed.length) {
          savePersistedEvents(deduped);
        }
        return deduped;
      }
    }
  } catch {
    // Ignore
  }
  return SEED_EVENTS;
}

function savePersistedEvents(events: CalendarEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(dedupeById(events)));
  } catch {
    // Ignore
  }
}

function loadPersistedFocusSessions(): FocusSession[] {
  if (typeof window === 'undefined') return SEED_FOCUS_SESSIONS;
  try {
    const raw = window.localStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const normalized = dedupeById<FocusSession>(parsed)
          .filter((s) => !s.id?.startsWith('fcs-hist-0-'))
          .map((s) => {
            const secs =
              typeof s.seconds === 'number' && s.seconds >= 0
                ? Math.round(s.seconds)
                : Math.round((s.hours || 0) * 3600);
            return {
              ...s,
              seconds: secs,
              hours: secs / 3600,
            };
          });
        savePersistedFocusSessions(normalized);
        return normalized;
      }
    }
  } catch {
    // Ignore
  }
  return SEED_FOCUS_SESSIONS;
}

function savePersistedFocusSessions(sessions: FocusSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(dedupeById(sessions)));
  } catch {
    // Ignore
  }
}

function progressForTaskStatus(status: TaskItem['status'], currentProgress: number): number {
  switch (status) {
    case 'Done':
      return 100;
    case 'In Review':
      return Math.max(75, Math.min(90, currentProgress || 80));
    case 'In Progress':
      return Math.max(35, Math.min(70, currentProgress === 100 ? 55 : currentProgress || 50));
    case 'Backlog':
    default:
      return Math.min(25, currentProgress === 100 ? 15 : currentProgress || 15);
  }
}

export interface PlotlineState {
  projects: Project[];
  tasks: TaskItem[];
  team: TeamMember[];
  events: CalendarEvent[];
  focusSessions: FocusSession[];
  notifications: NotificationSettings;
  accent: AccentName;
  weekStart: WeekStart;
  activeRoute: RouteId;
  railCollapsed: boolean;
  searchQuery: string;
  currentUser: TeamMember;
  lastAddedProjectId: string | null;
  checkedInEventIds: string[];
  timerSeconds: number;
  timerRunning: boolean;
  timerTaskId: string;
  toasts: ToastNotice[];
  newProjectModalOpen: boolean;
  newTaskModalOpen: boolean;
  commandPaletteOpen: boolean;
  selectedProfileMemberId: string | null;
  tourStep: number | null;
  isSignedOut: boolean;
  setAccent: (accent: AccentName | 'Tide' | 'Moss' | 'Iris' | 'Signal', showToast?: boolean) => void;
  setWeekStart: (weekStart: WeekStart, showToast?: boolean) => void;
  setActiveRoute: (route: RouteId) => void;
  setRailCollapsed: (collapsed: boolean) => void;
  toggleRail: () => void;
  setSearchQuery: (query: string) => void;
  setNewProjectModalOpen: (open: boolean) => void;
  setNewTaskModalOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSelectedProfileMemberId: (id: string | null) => void;
  setTourStep: (step: number | null) => void;
  setSignedOut: (signedOut: boolean) => void;
  updateProfile: (input: UpdateProfileInput) => void;
  toggleNotification: (key: keyof NotificationSettings) => void;
  addProject: (input: NewProjectInput) => Project;
  importSampleBatch: () => Project;
  moveTask: (taskId: string, newStatus: TaskItem['status']) => void;
  addTask: (input: NewTaskInput) => TaskItem;
  addTeamMember: (input: NewMemberInput) => TeamMember;
  addEvent: (input: NewEventInput) => CalendarEvent;
  updateEvent: (eventId: string, input: Partial<NewEventInput>) => void;
  deleteProject: (projectId: string) => void;
  deleteMember: (memberId: string) => void;
  deleteEvent: (eventId: string) => void;
  deleteTask: (taskId: string) => void;
  restoreSnapshot: (snapshot: StoreSnapshot) => void;
  toggleEventCheckIn: (eventId: string) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  setTimerTask: (taskId: string) => void;
  pushToast: (title: string, detail?: string) => void;
  pushToastWithUndo: (title: string, detail?: string, undoAction?: () => void) => void;
  dismissToast: (id: string) => void;
}

export const usePlotlineStore = create<PlotlineState>((set, get) => ({
  projects: loadPersistedProjects(),
  tasks: loadPersistedTasks(),
  team: loadPersistedTeam(),
  events: loadPersistedEvents(),
  focusSessions: loadPersistedFocusSessions(),
  notifications: loadInitialNotifications(),
  accent: loadInitialAccent(),
  weekStart: loadInitialWeekStart(),
  activeRoute: 'Dashboard',
  railCollapsed: loadInitialRailCollapsed(),
  searchQuery: '',
  currentUser: loadInitialCurrentUser(),
  lastAddedProjectId: null,
  checkedInEventIds: loadInitialCheckedInEvents(),
  timerSeconds: loadInitialTimerSeconds(),
  timerRunning: loadInitialTimerRunning(),
  timerTaskId: loadInitialTimerTaskId(),
  toasts: [],
  newProjectModalOpen: false,
  newTaskModalOpen: false,
  commandPaletteOpen: false,
  selectedProfileMemberId: null,
  tourStep: null,
  isSignedOut: loadInitialSignedOut(),

  setAccent: (rawAccent, showToast = false) => {
    const normalized = normalizeAccent(rawAccent);
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, normalized);
    } catch {
      // Ignore
    }
    applyAccentCssVariables(normalized);
    set({ accent: normalized });
    if (showToast) {
      const label = ACCENT_THEMES[normalized].label;
      get().pushToast(`Accent set to ${label}`, ACCENT_THEMES[normalized].description);
    }
  },

  setWeekStart: (weekStart, showToast = false) => {
    try {
      window.localStorage.setItem(WEEK_START_STORAGE_KEY, weekStart);
    } catch {
      // Ignore
    }
    set({ weekStart });
    if (showToast) {
      get().pushToast(
        `Week start set to ${weekStart === 'monday' ? 'Monday' : 'Sunday'}`,
        'Calendar grid and Weekly Output columns updated.'
      );
    }
  },

  setActiveRoute: (activeRoute) => set({ activeRoute }),
  setRailCollapsed: (railCollapsed) => {
    try {
      window.localStorage.setItem(RAIL_COLLAPSED_STORAGE_KEY, String(railCollapsed));
    } catch {
      // Ignore
    }
    set({ railCollapsed });
  },
  toggleRail: () =>
    set((state) => {
      const next = !state.railCollapsed;
      try {
        window.localStorage.setItem(RAIL_COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // Ignore
      }
      return { railCollapsed: next };
    }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setNewProjectModalOpen: (newProjectModalOpen) => set({ newProjectModalOpen }),
  setNewTaskModalOpen: (newTaskModalOpen) => set({ newTaskModalOpen }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setSelectedProfileMemberId: (selectedProfileMemberId) => set({ selectedProfileMemberId }),
  setTourStep: (tourStep) => set({ tourStep }),

  setSignedOut: (isSignedOut) => {
    try {
      window.localStorage.setItem(SIGNED_OUT_STORAGE_KEY, String(isSignedOut));
    } catch {
      // Ignore
    }
    set({ isSignedOut });
  },

  updateProfile: (input) => {
    const state = get();
    const cleanName = input.name.trim() || state.currentUser.name;
    const cleanRole = input.role.trim() || state.currentUser.role;
    const cleanEmail = input.email.trim() || state.currentUser.email;
    const initials = computeInitials(cleanName);

    const updatedUser: TeamMember = {
      ...state.currentUser,
      name: cleanName,
      role: cleanRole,
      email: cleanEmail,
      initials,
    };

    const updatedTeam = state.team.map((m) =>
      m.id === updatedUser.id ? updatedUser : m
    );

    try {
      window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch {
      // Ignore
    }
    savePersistedTeam(updatedTeam);

    set({
      currentUser: updatedUser,
      team: updatedTeam,
    });

    get().pushToast('Profile saved', `${updatedUser.name} · ${updatedUser.role}`);
  },

  toggleNotification: (key) => {
    const state = get();
    const next: NotificationSettings = {
      ...state.notifications,
      [key]: !state.notifications[key],
    };
    try {
      window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
    set({ notifications: next });
  },

  addProject: (input) => {
    const snapshot = get();
    const newId =
      input.id || `prj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = snapshot.projects.find((p) => p.id === newId);
    if (existing) return existing;

    const nextNumber = 116 + snapshot.projects.length;
    const code = `PLT-${nextNumber}`;
    const newProject: Project = {
      id: newId,
      code,
      name: input.name.trim(),
      client: input.client?.trim() || 'Independent Field Commission',
      sector: input.sector?.trim() || 'Spatial Engineering',
      status: input.status || 'On Track',
      leadId: snapshot.currentUser.id,
      startDate: getTodayIsoDate(),
      targetDate: input.targetDate,
      progress: 8,
      budgetAllocated: 160000,
      budgetSpent: 12800,
      summary: `Newly chartered delivery stream (${code}) scheduled for completion by ${input.targetDate}.`,
    };

    let didInsert = false;
    set((state) => {
      if (state.projects.some((p) => p.id === newId)) {
        return state;
      }
      didInsert = true;
      const nextProjects = dedupeById([newProject, ...state.projects]);
      savePersistedProjects(nextProjects);
      return {
        projects: nextProjects,
        lastAddedProjectId: newId,
      };
    });

    if (didInsert) {
      get().pushToast(
        `Project "${newProject.name}" created`,
        `${newProject.code} added to active portfolio · Due ${newProject.targetDate}`
      );
    }

    return newProject;
  },

  importSampleBatch: () => {
    const snapshot = get();
    const newId = `prj-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = snapshot.projects.find((p) => p.id === newId);
    if (existing) return existing;

    const nextNumber = 120 + snapshot.projects.length;
    const code = `PLT-${nextNumber}`;
    const importedProject: Project = {
      id: newId,
      code,
      name: 'Aethelgard Glacier Lidar Grid',
      client: 'Nordic Cryosphere Institute',
      sector: 'Glaciology & Remote Sensing',
      status: 'On Track',
      leadId: 'usr-mireia',
      startDate: getTodayIsoDate(),
      targetDate: '2027-03-18',
      progress: 18,
      budgetAllocated: 195000,
      budgetSpent: 35100,
      summary: 'Imported airborne altimetry mesh and crevasse drift ledger.',
    };

    let didInsert = false;
    set((state) => {
      if (state.projects.some((p) => p.id === newId)) {
        return state;
      }
      didInsert = true;
      const nextProjects = dedupeById([importedProject, ...state.projects]);
      savePersistedProjects(nextProjects);
      return {
        projects: nextProjects,
        lastAddedProjectId: newId,
      };
    });

    if (didInsert) {
      get().pushToast(
        `Imported ${importedProject.code}: ${importedProject.name}`,
        'Portfolio metrics, project rings, and project list updated.'
      );
    }

    return importedProject;
  },

  moveTask: (taskId, newStatus) => {
    const snapshot = get();
    const target = snapshot.tasks.find((t) => t.id === taskId);
    if (!target || target.status === newStatus) return;

    const nowTs = Date.now();
    const nextProgress = progressForTaskStatus(newStatus, target.progress);
    const nextSubtasksDone =
      newStatus === 'Done'
        ? target.subtasksTotal
        : newStatus === 'Backlog'
        ? Math.min(1, target.subtasksDone)
        : Math.max(1, Math.min(target.subtasksTotal - 1, target.subtasksDone));

    set((state) => {
      const currentTarget = state.tasks.find((t) => t.id === taskId);
      if (!currentTarget || currentTarget.status === newStatus) return state;

      // Preserve original array order (do not reorder on drag); update in place with updatedAt timestamp
      const updatedTasks = state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completedDate: newStatus === 'Done' ? getTodayIsoDate() : t.completedDate,
              progress: nextProgress,
              subtasksDone: nextSubtasksDone,
              updatedAt: nowTs,
              updatedAtLabel: 'Just now',
            }
          : t
      );

      const updatedProjects = state.projects.map((proj) => {
        if (proj.id !== currentTarget.projectId) return proj;
        const projTasks = updatedTasks.filter((t) => t.projectId === proj.id);
        if (projTasks.length === 0) return proj;
        const avgTaskProgress = Math.round(
          projTasks.reduce((sum, t) => sum + t.progress, 0) / projTasks.length
        );
        return {
          ...proj,
          progress: avgTaskProgress,
        };
      });

      savePersistedTasks(updatedTasks);
      savePersistedProjects(updatedProjects);

      return {
        tasks: updatedTasks,
        projects: updatedProjects,
      };
    });

    const stageLabel = newStatus === 'Backlog' ? 'To do' : newStatus;
    get().pushToast(`Moved "${target.code}" to ${stageLabel}`, target.title);
  },

  addTask: (input) => {
    const snapshot = get();
    const newId =
      input.id || `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = snapshot.tasks.find((t) => t.id === newId);
    if (existing) return existing;

    const nowTs = Date.now();
    const defaultProject = snapshot.projects[0];
    const nextCodeNum = 410 + snapshot.tasks.length;
    const status = input.status || 'Backlog';
    const targetProjectId = defaultProject?.id || 'prj-kestrel';
    const newTask: TaskItem = {
      id: newId,
      code: `PLT-${nextCodeNum}`,
      title: input.title.trim(),
      category: input.category.trim() || 'Engineering',
      projectId: targetProjectId,
      assigneeId: input.assigneeId || snapshot.currentUser.id,
      status,
      priority: input.priority,
      dueDate: input.dueDate,
      estimateHours: input.priority === 'High' ? 14 : input.priority === 'Medium' ? 10 : 6,
      loggedSeconds: 0,
      cycleDays: 2.2,
      onTime: true,
      progress: progressForTaskStatus(status, 15),
      subtasksDone: status === 'Done' ? 4 : 1,
      subtasksTotal: 4,
      weekdayIndex: new Date().getDay(),
      updatedAt: nowTs,
      updatedAtLabel: 'Just now',
    };

    let didInsert = false;
    set((state) => {
      if (state.tasks.some((t) => t.id === newId)) {
        return state;
      }
      didInsert = true;
      const nextTasks = dedupeById([newTask, ...state.tasks]);
      const nextProjects = state.projects.map((proj) => {
        if (proj.id !== targetProjectId) return proj;
        const projTasks = nextTasks.filter((t) => t.projectId === proj.id);
        if (projTasks.length === 0) return proj;
        const avgTaskProgress = Math.round(
          projTasks.reduce((sum, t) => sum + t.progress, 0) / projTasks.length
        );
        return {
          ...proj,
          progress: avgTaskProgress,
        };
      });

      savePersistedTasks(nextTasks);
      savePersistedProjects(nextProjects);
      return { tasks: nextTasks, projects: nextProjects };
    });

    if (didInsert) {
      get().pushToast(`Task "${newTask.code}" created`, newTask.title);
    }
    return newTask;
  },

  addTeamMember: (input) => {
    const snapshot = get();
    const newId =
      input.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const existing = snapshot.team.find((m) => m.id === newId);
    if (existing) return existing;

    const cleanName = input.name.trim();
    const initials = computeInitials(cleanName);
    const parts = cleanName.split(/\s+/);

    const newMember: TeamMember = {
      id: newId,
      name: cleanName,
      role: input.role.trim() || 'Specialist',
      discipline: input.department,
      department: input.department,
      presence: 'online',
      statusLabel: 'Newly onboarded to studio',
      location: input.location?.trim() || 'Remote · CET',
      timezone: 'CET (UTC+1)',
      initials,
      capacityHours: 40,
      allocatedHours: 20,
      email:
        input.email?.trim() ||
        `${parts[0].toLowerCase()}@plotline.studio`,
    };

    let didInsert = false;
    set((state) => {
      if (state.team.some((m) => m.id === newId)) {
        return state;
      }
      didInsert = true;
      const nextTeam = dedupeById([...state.team, newMember]);
      savePersistedTeam(nextTeam);
      return { team: nextTeam };
    });

    if (didInsert) {
      get().pushToast(`Invited ${newMember.name}`, `${newMember.role} · ${newMember.department}`);
    }
    return newMember;
  },

  addEvent: (input) => {
    const snapshot = get();
    const newId =
      input.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = snapshot.events.find((e) => e.id === newId);
    if (existing) return existing;

    const newEvent: CalendarEvent = {
      id: newId,
      title: input.title.trim(),
      category: input.category,
      projectId: input.projectId || snapshot.projects[0]?.id || 'prj-kestrel',
      date: input.date,
      startTime: input.startTime || '10:00',
      endTime: input.endTime || '11:00',
      attendeeIds:
        input.attendeeIds.length > 0 ? input.attendeeIds : [snapshot.currentUser.id],
      location: input.location?.trim() || 'Studio Room 01 · Hybrid',
    };

    let didInsert = false;
    set((state) => {
      if (state.events.some((e) => e.id === newId)) {
        return state;
      }
      didInsert = true;
      const nextEvents = dedupeById([newEvent, ...state.events]);
      savePersistedEvents(nextEvents);
      return { events: nextEvents };
    });

    if (didInsert) {
      get().pushToast(
        `Event "${newEvent.title}" scheduled`,
        `${newEvent.date} · ${newEvent.startTime}–${newEvent.endTime}`
      );
    }
    return newEvent;
  },

  updateEvent: (eventId, input) => {
    const state = get();
    const nextEvents = state.events.map((evt) => {
      if (evt.id !== eventId) return evt;
      return {
        ...evt,
        title: input.title !== undefined ? input.title.trim() : evt.title,
        category: input.category !== undefined ? input.category : evt.category,
        date: input.date !== undefined ? input.date : evt.date,
        startTime: input.startTime !== undefined ? input.startTime : evt.startTime,
        endTime: input.endTime !== undefined ? input.endTime : evt.endTime,
        attendeeIds: input.attendeeIds !== undefined ? input.attendeeIds : evt.attendeeIds,
        location: input.location !== undefined ? input.location : evt.location,
      };
    });
    savePersistedEvents(nextEvents);
    set({ events: nextEvents });
    get().pushToast('Event updated');
  },

  deleteProject: (projectId) => {
    const snapshot = get();
    const target = snapshot.projects.find((p) => p.id === projectId);
    if (!target) return;

    const savedSnapshot: StoreSnapshot = {
      projects: [...snapshot.projects],
      tasks: [...snapshot.tasks],
      team: [...snapshot.team],
      events: [...snapshot.events],
      focusSessions: [...snapshot.focusSessions],
      timerRunning: snapshot.timerRunning,
      timerSeconds: snapshot.timerSeconds,
      timerTaskId: snapshot.timerTaskId,
    };

    const nextProjects = snapshot.projects.filter((p) => p.id !== projectId);
    const deletedTaskIds = new Set(
      snapshot.tasks.filter((t) => t.projectId === projectId).map((t) => t.id)
    );
    const nextTasks = snapshot.tasks.filter((t) => t.projectId !== projectId);

    let nextTimerRunning = snapshot.timerRunning;
    let nextTimerSeconds = snapshot.timerSeconds;
    if (deletedTaskIds.has(snapshot.timerTaskId)) {
      nextTimerRunning = false;
      nextTimerSeconds = 0;
      try {
        window.localStorage.setItem(TIMER_RUNNING_STORAGE_KEY, 'false');
        window.localStorage.setItem(TIMER_SECONDS_STORAGE_KEY, '0');
      } catch {
        // Ignore
      }
    }

    savePersistedProjects(nextProjects);
    savePersistedTasks(nextTasks);

    set({
      projects: nextProjects,
      tasks: nextTasks,
      timerRunning: nextTimerRunning,
      timerSeconds: nextTimerSeconds,
    });

    get().pushToastWithUndo(
      `Project "${target.name}" deleted`,
      'Associated tasks removed',
      () => get().restoreSnapshot(savedSnapshot)
    );
  },

  deleteMember: (memberId) => {
    const snapshot = get();
    if (memberId === snapshot.currentUser.id) return;
    const target = snapshot.team.find((m) => m.id === memberId);
    if (!target) return;

    const savedSnapshot: StoreSnapshot = {
      projects: [...snapshot.projects],
      tasks: [...snapshot.tasks],
      team: [...snapshot.team],
      events: [...snapshot.events],
      focusSessions: [...snapshot.focusSessions],
      timerRunning: snapshot.timerRunning,
      timerSeconds: snapshot.timerSeconds,
      timerTaskId: snapshot.timerTaskId,
    };

    const nextTeam = snapshot.team.filter((m) => m.id !== memberId);
    const nextTasks = snapshot.tasks.map((t) => {
      let updated = false;
      let nextAssignee = t.assigneeId;
      let nextCoAssignee = t.coAssigneeId;

      if (t.assigneeId === memberId) {
        nextAssignee = '';
        updated = true;
      }
      if (t.coAssigneeId === memberId) {
        nextCoAssignee = undefined;
        updated = true;
      }

      return updated
        ? { ...t, assigneeId: nextAssignee, coAssigneeId: nextCoAssignee }
        : t;
    });

    savePersistedTeam(nextTeam);
    savePersistedTasks(nextTasks);

    const nextProfileId =
      snapshot.selectedProfileMemberId === memberId
        ? null
        : snapshot.selectedProfileMemberId;

    set({
      team: nextTeam,
      tasks: nextTasks,
      selectedProfileMemberId: nextProfileId,
    });

    get().pushToastWithUndo(
      `Specialist "${target.name}" deleted`,
      'Assigned tasks moved to Unassigned',
      () => get().restoreSnapshot(savedSnapshot)
    );
  },

  deleteEvent: (eventId) => {
    const snapshot = get();
    const target = snapshot.events.find((e) => e.id === eventId);
    if (!target) return;

    const savedSnapshot: StoreSnapshot = {
      projects: [...snapshot.projects],
      tasks: [...snapshot.tasks],
      team: [...snapshot.team],
      events: [...snapshot.events],
      focusSessions: [...snapshot.focusSessions],
      timerRunning: snapshot.timerRunning,
      timerSeconds: snapshot.timerSeconds,
      timerTaskId: snapshot.timerTaskId,
    };

    const nextEvents = snapshot.events.filter((e) => e.id !== eventId);
    savePersistedEvents(nextEvents);

    set({ events: nextEvents });

    get().pushToastWithUndo(
      `Event "${target.title}" deleted`,
      `${target.date} · ${target.startTime}–${target.endTime}`,
      () => get().restoreSnapshot(savedSnapshot)
    );
  },

  deleteTask: (taskId) => {
    const snapshot = get();
    const target = snapshot.tasks.find((t) => t.id === taskId);
    if (!target) return;

    const savedSnapshot: StoreSnapshot = {
      projects: [...snapshot.projects],
      tasks: [...snapshot.tasks],
      team: [...snapshot.team],
      events: [...snapshot.events],
      focusSessions: [...snapshot.focusSessions],
      timerRunning: snapshot.timerRunning,
      timerSeconds: snapshot.timerSeconds,
      timerTaskId: snapshot.timerTaskId,
    };

    const nextTasks = snapshot.tasks.filter((t) => t.id !== taskId);

    let nextTimerRunning = snapshot.timerRunning;
    let nextTimerSeconds = snapshot.timerSeconds;
    if (snapshot.timerTaskId === taskId) {
      nextTimerRunning = false;
      nextTimerSeconds = 0;
      try {
        window.localStorage.setItem(TIMER_RUNNING_STORAGE_KEY, 'false');
        window.localStorage.setItem(TIMER_SECONDS_STORAGE_KEY, '0');
      } catch {
        // Ignore
      }
    }

    savePersistedTasks(nextTasks);

    set({
      tasks: nextTasks,
      timerRunning: nextTimerRunning,
      timerSeconds: nextTimerSeconds,
    });

    get().pushToastWithUndo(
      `Task "${target.code}" deleted`,
      target.title,
      () => get().restoreSnapshot(savedSnapshot)
    );
  },

  restoreSnapshot: (snapshot) => {
    savePersistedProjects(snapshot.projects);
    savePersistedTasks(snapshot.tasks);
    savePersistedTeam(snapshot.team);
    savePersistedEvents(snapshot.events);
    savePersistedFocusSessions(snapshot.focusSessions);

    try {
      window.localStorage.setItem(
        TIMER_RUNNING_STORAGE_KEY,
        String(snapshot.timerRunning)
      );
      window.localStorage.setItem(
        TIMER_SECONDS_STORAGE_KEY,
        String(snapshot.timerSeconds)
      );
      window.localStorage.setItem(
        TIMER_TASK_STORAGE_KEY,
        snapshot.timerTaskId
      );
    } catch {
      // Ignore
    }

    set({
      projects: snapshot.projects,
      tasks: snapshot.tasks,
      team: snapshot.team,
      events: snapshot.events,
      focusSessions: snapshot.focusSessions,
      timerRunning: snapshot.timerRunning,
      timerSeconds: snapshot.timerSeconds,
      timerTaskId: snapshot.timerTaskId,
    });

    get().pushToast('Deletion undone', 'Restored record and all cascaded changes.');
  },

  toggleEventCheckIn: (eventId) => {
    const state = get();
    const isCheckedIn = state.checkedInEventIds.includes(eventId);
    const targetEvent = state.events.find((e) => e.id === eventId);
    const nextIds = isCheckedIn
      ? state.checkedInEventIds.filter((id) => id !== eventId)
      : [...state.checkedInEventIds, eventId];

    try {
      window.localStorage.setItem(CHECKED_IN_EVENTS_STORAGE_KEY, JSON.stringify(nextIds));
    } catch {
      // Ignore
    }
    set({ checkedInEventIds: nextIds });

    if (targetEvent) {
      get().pushToast(
        isCheckedIn ? `Meeting ended: ${targetEvent.title}` : `Meeting started: ${targetEvent.title}`,
        `${targetEvent.startTime}–${targetEvent.endTime} · ${targetEvent.location}`
      );
    }
  },

  toggleTimer: () => {
    set((state) => {
      const nextRunning = !state.timerRunning;
      const nextSeconds = state.timerSeconds;
      try {
        window.localStorage.setItem(TIMER_RUNNING_STORAGE_KEY, String(nextRunning));
        window.localStorage.setItem(TIMER_SECONDS_STORAGE_KEY, String(nextSeconds));
      } catch {
        // Ignore
      }
      return { timerRunning: nextRunning, timerSeconds: nextSeconds };
    });
  },

  resetTimer: () => {
    const snapshot = get();
    const elapsedSeconds =
      snapshot.timerSeconds > 0
        ? snapshot.timerSeconds
        : snapshot.timerRunning
        ? 1
        : 0;
    const activeTask =
      snapshot.tasks.find((t) => t.id === snapshot.timerTaskId) || snapshot.tasks[0];

    try {
      window.localStorage.setItem(TIMER_SECONDS_STORAGE_KEY, '0');
      window.localStorage.setItem(TIMER_RUNNING_STORAGE_KEY, 'false');
    } catch {
      // Ignore
    }

    if (elapsedSeconds > 0 && activeTask) {
      const newSessionId = `fcs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const nowTs = Date.now();
      const todayWeekday = new Date().getDay();
      const newSession: FocusSession = {
        id: newSessionId,
        taskId: activeTask.id,
        projectId: activeTask.projectId,
        memberId: activeTask.assigneeId || snapshot.currentUser.id,
        weekdayIndex: todayWeekday,
        date: getTodayIsoDate(),
        daysAgo: 0,
        seconds: elapsedSeconds,
        hours: elapsedSeconds / 3600,
        tasksCompletedCount: 0,
        cycleDays: 2.0,
        onTimeCount: 0,
        createdAt: new Date(nowTs).toISOString(),
      };

      let didLog = false;
      set((state) => {
        if (state.focusSessions.some((s) => s.id === newSessionId)) {
          return { timerSeconds: 0, timerRunning: false };
        }
        didLog = true;
        const nextSessions = dedupeById([...state.focusSessions, newSession]);
        savePersistedFocusSessions(nextSessions);

        const nextTasks = state.tasks.map((t) => {
          if (t.id !== activeTask.id) return t;
          const prevLogged = t.loggedSeconds || 0;
          const nextLogged = prevLogged + elapsedSeconds;
          return {
            ...t,
            loggedSeconds: nextLogged,
            updatedAt: nowTs,
            updatedAtLabel: 'Just now',
          };
        });
        savePersistedTasks(nextTasks);

        return {
          timerSeconds: 0,
          timerRunning: false,
          focusSessions: nextSessions,
          tasks: nextTasks,
        };
      });

      if (didLog) {
        get().pushToast(
          `Logged ${formatDuration(elapsedSeconds)} focus session`,
          `${activeTask.code} · ${activeTask.title}`
        );
      }
      return;
    }

    set({ timerSeconds: 0, timerRunning: false });
  },

  tickTimer: () => {
    set((state) => {
      if (!state.timerRunning) return state;
      const nextSeconds = state.timerSeconds + 1;
      try {
        window.localStorage.setItem(TIMER_SECONDS_STORAGE_KEY, String(nextSeconds));
      } catch {
        // Ignore
      }
      return { timerSeconds: nextSeconds };
    });
  },

  setTimerTask: (timerTaskId) => {
    try {
      window.localStorage.setItem(TIMER_TASK_STORAGE_KEY, timerTaskId);
    } catch {
      // Ignore
    }
    set({ timerTaskId });
  },

  pushToast: (title, detail) => {
    const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, detail }],
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 4200);
  },

  pushToastWithUndo: (title, detail, undoAction) => {
    const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, detail, undoAction }],
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 6000);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export const useStore = usePlotlineStore;
