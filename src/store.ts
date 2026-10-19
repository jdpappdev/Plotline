import { create } from 'zustand';
import { contourGlyph } from './utils/contourGlyph';

export { contourGlyph };

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).contourGlyph = contourGlyph;
}

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
  status: 'On Track' | 'At Risk' | 'Planning' | 'Completed' | 'Pending' | 'Running' | 'Ended';
  statusOverride?: 'Pending' | 'Running' | 'Ended';
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

const ACCENT_STORAGE_KEY = 'plotline-accent-v3';
const WEEK_START_STORAGE_KEY = 'plotline-week-start-v3';
const TASKS_STORAGE_KEY = 'plotline-tasks-v6';
const PROJECTS_STORAGE_KEY = 'plotline-projects-v6';
const TEAM_STORAGE_KEY = 'plotline-team-v6';
const EVENTS_STORAGE_KEY = 'plotline-events-v6';
const FOCUS_SESSIONS_STORAGE_KEY = 'plotline-focus-sessions-v6';
const NOTIFICATIONS_STORAGE_KEY = 'plotline-notifications-v3';
const CURRENT_USER_STORAGE_KEY = 'plotline-current-user-v3';
const SIGNED_OUT_STORAGE_KEY = 'plotline-signed-out-v3';
const RAIL_COLLAPSED_STORAGE_KEY = 'plotline-rail-collapsed-v3';
const CHECKED_IN_EVENTS_STORAGE_KEY = 'plotline-checked-in-events-v3';

import { getTodayIsoDate, getIsoDateOffset, getNow, getNowTimestamp } from './lib/clock';
import {
  computeDaysAgoFromIso,
  computeDaysBetweenIso,
  formatDuration,
} from './domain/derivations/time';
import {
  getTaskFactorBand,
  isTaskCompletedInRange,
} from './domain/derivations/tasks';
import {
  getProjectProgress,
  getProjectStatus,
} from './domain/derivations/projects';
import { getMemberTaskCounts } from './domain/derivations/team';

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

export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
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

// --- Benchmark Seed Dataset Generation ---
export const SEED_TEAM: TeamMember[] = [
  {
    id: 'usr-soren',
    name: 'Soren Lindqvist',
    role: 'Technical Director',
    discipline: 'Engineering',
    department: 'Engineering',
    presence: 'online',
    statusLabel: 'Active in Systems Lab',
    location: 'Stockholm, SE',
    timezone: 'CET (UTC+1)',
    initials: 'SL',
    capacityHours: 60,
    allocatedHours: 10,
    email: 'soren@plotline.studio',
  },
  {
    id: 'usr-mireia',
    name: 'Mireia Vance',
    role: 'Design Director',
    discipline: 'Design',
    department: 'Design',
    presence: 'online',
    statusLabel: 'Reviewing Mobile Specs',
    location: 'Barcelona, ES',
    timezone: 'CET (UTC+1)',
    initials: 'MV',
    capacityHours: 60,
    allocatedHours: 12,
    email: 'mireia@plotline.studio',
  },
  {
    id: 'usr-tarek',
    name: 'Tarek Al-Mansoor',
    role: 'Senior Frontend Engineer',
    discipline: 'Engineering',
    department: 'Engineering',
    presence: 'online',
    statusLabel: 'Building Map Components',
    location: 'Zurich, CH',
    timezone: 'CET (UTC+1)',
    initials: 'TA',
    capacityHours: 60,
    allocatedHours: 46,
    email: 'tarek@plotline.studio',
  },
  {
    id: 'usr-kaelen',
    name: 'Kaelen Okafor',
    role: 'Delivery Producer',
    discipline: 'Management',
    department: 'Management',
    presence: 'online',
    statusLabel: 'Sprint Planning',
    location: 'London, UK',
    timezone: 'GMT (UTC+0)',
    initials: 'KO',
    capacityHours: 60,
    allocatedHours: 6,
    email: 'kaelen@plotline.studio',
  },
  {
    id: 'usr-nadia',
    name: 'Nadia Kovalenko',
    role: 'Product Designer',
    discipline: 'Design',
    department: 'Design',
    presence: 'online',
    statusLabel: 'Prototyping Habits Flow',
    location: 'Tallinn, EE',
    timezone: 'EET (UTC+2)',
    initials: 'NK',
    capacityHours: 60,
    allocatedHours: 22,
    email: 'nadia@plotline.studio',
  },
  {
    id: 'usr-juno',
    name: 'Juno Takahashi',
    role: 'Brand & Marketing Lead',
    discipline: 'Marketing',
    department: 'Marketing',
    presence: 'away',
    statusLabel: 'Drafting Launch Copy',
    location: 'Kyoto, JP',
    timezone: 'JST (UTC+9)',
    initials: 'JT',
    capacityHours: 60,
    allocatedHours: 15,
    email: 'juno@plotline.studio',
  },
  {
    id: 'usr-jade',
    name: 'Jade Polo',
    role: 'Backend Engineer',
    discipline: 'Engineering',
    department: 'Engineering',
    presence: 'offline',
    statusLabel: 'API Integration',
    location: 'Lisbon, PT',
    timezone: 'WET (UTC+0)',
    initials: 'JP',
    capacityHours: 60,
    allocatedHours: 20,
    email: 'jade@plotline.studio',
  },
];

export function createSeedProjects(): Project[] {
  return [
    {
      id: 'prj-harbor',
      code: 'PLT-101',
      name: 'Harbor Mobile Banking Redesign',
      client: 'Harbor & Vale Credit Union',
      sector: 'Financial Technology',
      status: 'On Track',
      leadId: 'usr-mireia',
      startDate: getIsoDateOffset(-30),
      targetDate: getIsoDateOffset(21),
      progress: 57,
      budgetAllocated: 185000,
      budgetSpent: 105000,
      summary: 'Mobile banking application redesign and design system consolidation.',
    },
    {
      id: 'prj-fernlight',
      code: 'PLT-102',
      name: 'Fernlight Wellness App',
      client: 'Fernlight Health',
      sector: 'Healthcare & Wellness',
      status: 'At Risk',
      leadId: 'usr-nadia',
      startDate: getIsoDateOffset(-15),
      targetDate: getIsoDateOffset(35),
      progress: 40,
      budgetAllocated: 140000,
      budgetSpent: 56000,
      summary: 'Personal habit tracking, wellness diagnostic flows, and companion app.',
    },
    {
      id: 'prj-orchard',
      code: 'PLT-103',
      name: 'Orchard Logistics Dashboard',
      client: 'Orchard Freight',
      sector: 'Supply Chain & Freight',
      status: 'On Track',
      leadId: 'usr-soren',
      startDate: getIsoDateOffset(-25),
      targetDate: getIsoDateOffset(12),
      progress: 40,
      budgetAllocated: 210000,
      budgetSpent: 84000,
      summary: 'Real-time fleet shipment tracking, telemetry map, and route optimization.',
    },
    {
      id: 'prj-atlas',
      code: 'PLT-104',
      name: 'Atlas Travel Booking Flow',
      client: 'Atlas Journeys',
      sector: 'Travel & Transportation',
      status: 'On Track',
      leadId: 'usr-soren',
      startDate: getIsoDateOffset(-22),
      targetDate: getIsoDateOffset(9),
      progress: 75,
      budgetAllocated: 160000,
      budgetSpent: 120000,
      summary: 'Streamlined itinerary booking, seat reservation grid, and checkout.',
    },
    {
      id: 'prj-lumen',
      code: 'PLT-105',
      name: 'Lumen Museum Website',
      client: 'Lumen Museum of Design',
      sector: 'Arts & Culture',
      status: 'Completed',
      leadId: 'usr-kaelen',
      startDate: getIsoDateOffset(-35),
      targetDate: getIsoDateOffset(-7),
      progress: 100,
      budgetAllocated: 95000,
      budgetSpent: 95000,
      summary: 'Accessible digital gallery, exhibition archive, and ticketing platform.',
    },
    {
      id: 'prj-northwind',
      code: 'PLT-106',
      name: 'Northwind Brand Refresh',
      client: 'Northwind Coffee Roasters',
      sector: 'Consumer Goods & Retail',
      status: 'Planning',
      leadId: 'usr-mireia',
      startDate: getIsoDateOffset(8),
      targetDate: getIsoDateOffset(60),
      progress: 0,
      budgetAllocated: 110000,
      budgetSpent: 0,
      summary: 'Brand identity positioning, packaging system, and digital presence.',
    },
  ];
}

export function createSeedTasks(): TaskItem[] {
  return [
    // 1. Harbor (4 Done, 1 In Progress, 1 In Review, 1 To do)
    {
      id: 'tsk-h-1',
      code: 'PLT-101-A',
      title: 'Audit current app and competitor flows',
      category: 'Interface',
      projectId: 'prj-harbor',
      assigneeId: 'usr-mireia',
      status: 'Done',
      priority: 'Medium',
      startDate: getIsoDateOffset(-29),
      completedDate: getIsoDateOffset(-23),
      dueDate: getIsoDateOffset(-22),
      estimateHours: 10,
      progress: 100,
      subtasksDone: 3,
      subtasksTotal: 3,
    },
    {
      id: 'tsk-h-2',
      code: 'PLT-101-B',
      title: 'Define design principles and tone',
      category: 'Interface',
      projectId: 'prj-harbor',
      assigneeId: 'usr-mireia',
      status: 'Done',
      priority: 'Medium',
      startDate: getIsoDateOffset(-24),
      completedDate: getIsoDateOffset(-19),
      dueDate: getIsoDateOffset(-18),
      estimateHours: 6,
      progress: 100,
      subtasksDone: 2,
      subtasksTotal: 2,
    },
    {
      id: 'tsk-h-3',
      code: 'PLT-101-C',
      title: 'Build design system foundations',
      category: 'Interface',
      projectId: 'prj-harbor',
      assigneeId: 'usr-nadia',
      status: 'Done',
      priority: 'High',
      startDate: getIsoDateOffset(-25),
      completedDate: getIsoDateOffset(-17),
      dueDate: getIsoDateOffset(-19), // Finished 2 days late!
      onTime: false,
      estimateHours: 16,
      progress: 100,
      subtasksDone: 4,
      subtasksTotal: 4,
    },
    {
      id: 'tsk-h-4',
      code: 'PLT-101-D',
      title: 'Prototype account overview screens',
      category: 'Interface',
      projectId: 'prj-harbor',
      assigneeId: 'usr-nadia',
      status: 'Done',
      priority: 'High',
      startDate: getIsoDateOffset(-15),
      completedDate: getIsoDateOffset(-8),
      dueDate: getIsoDateOffset(-8),
      estimateHours: 14,
      progress: 100,
      subtasksDone: 4,
      subtasksTotal: 4,
    },
    {
      id: 'tsk-h-5',
      code: 'PLT-101-E',
      title: 'Implement account overview in React Native',
      category: 'Engineering',
      projectId: 'prj-harbor',
      assigneeId: 'usr-tarek',
      status: 'In Progress',
      priority: 'High',
      startDate: getIsoDateOffset(-6),
      dueDate: getIsoDateOffset(6),
      estimateHours: 18,
      progress: 55,
      subtasksDone: 2,
      subtasksTotal: 4,
    },
    {
      id: 'tsk-h-6',
      code: 'PLT-101-F',
      title: 'Usability test round 2 with 8 participants',
      category: 'Interface',
      projectId: 'prj-harbor',
      assigneeId: 'usr-nadia',
      status: 'In Review',
      priority: 'Medium',
      startDate: getIsoDateOffset(-5),
      dueDate: getIsoDateOffset(2),
      estimateHours: 8,
      progress: 80,
      subtasksDone: 3,
      subtasksTotal: 4,
    },
    {
      id: 'tsk-h-7',
      code: 'PLT-101-G',
      title: 'Accessibility pass on onboarding',
      category: 'Engineering',
      projectId: 'prj-harbor',
      assigneeId: 'usr-tarek',
      status: 'Backlog',
      priority: 'Low',
      startDate: getIsoDateOffset(2),
      dueDate: getIsoDateOffset(12),
      estimateHours: 6,
      progress: 15,
      subtasksDone: 0,
      subtasksTotal: 3,
    },

    // 2. Fernlight (2 Done, 2 In Progress, 1 To do)
    {
      id: 'tsk-f-1',
      code: 'PLT-102-A',
      title: 'Map user journeys from 12 interviews',
      category: 'Interface',
      projectId: 'prj-fernlight',
      assigneeId: 'usr-nadia',
      status: 'Done',
      priority: 'High',
      startDate: getIsoDateOffset(-18),
      completedDate: getIsoDateOffset(-11),
      dueDate: getIsoDateOffset(-10),
      estimateHours: 12,
      progress: 100,
      subtasksDone: 3,
      subtasksTotal: 3,
    },
    {
      id: 'tsk-f-2',
      code: 'PLT-102-B',
      title: 'Brand moodboard and tone of voice',
      category: 'Outreach',
      projectId: 'prj-fernlight',
      assigneeId: 'usr-juno',
      status: 'Done',
      priority: 'Medium',
      startDate: getIsoDateOffset(-13),
      completedDate: getIsoDateOffset(-8),
      dueDate: getIsoDateOffset(-8),
      estimateHours: 8,
      progress: 100,
      subtasksDone: 2,
      subtasksTotal: 2,
    },
    {
      id: 'tsk-f-3',
      code: 'PLT-102-C',
      title: 'Design onboarding and habit setup flow',
      category: 'Interface',
      projectId: 'prj-fernlight',
      assigneeId: 'usr-nadia',
      status: 'In Progress',
      priority: 'High',
      startDate: getIsoDateOffset(-8),
      dueDate: getIsoDateOffset(-1), // overdue!
      estimateHours: 14,
      progress: 50,
      subtasksDone: 2,
      subtasksTotal: 4,
    },
    {
      id: 'tsk-f-4',
      code: 'PLT-102-D',
      title: 'Build habit tracking API',
      category: 'Telemetry',
      projectId: 'prj-fernlight',
      assigneeId: 'usr-jade',
      status: 'In Progress',
      priority: 'High',
      startDate: getIsoDateOffset(-9),
      dueDate: getIsoDateOffset(14),
      estimateHours: 20,
      progress: 45,
      subtasksDone: 2,
      subtasksTotal: 5,
    },
    {
      id: 'tsk-f-5',
      code: 'PLT-102-E',
      title: 'Write App Store launch copy',
      category: 'Outreach',
      projectId: 'prj-fernlight',
      assigneeId: 'usr-juno',
      status: 'Backlog',
      priority: 'Low',
      startDate: getIsoDateOffset(5),
      dueDate: getIsoDateOffset(28),
      estimateHours: 5,
      progress: 10,
      subtasksDone: 0,
      subtasksTotal: 2,
    },

    // 3. Orchard (2 Done, 1 In Progress, 1 In Review, 1 To do)
    {
      id: 'tsk-o-1',
      code: 'PLT-103-A',
      title: 'Requirements workshop with ops team',
      category: 'Field Ops',
      projectId: 'prj-orchard',
      assigneeId: 'usr-kaelen',
      status: 'Done',
      priority: 'Medium',
      startDate: getIsoDateOffset(-26),
      completedDate: getIsoDateOffset(-21),
      dueDate: getIsoDateOffset(-20),
      estimateHours: 6,
      progress: 100,
      subtasksDone: 2,
      subtasksTotal: 2,
    },
    {
      id: 'tsk-o-2',
      code: 'PLT-103-B',
      title: 'Data model for shipments and routes',
      category: 'Architecture',
      projectId: 'prj-orchard',
      assigneeId: 'usr-jade',
      status: 'Done',
      priority: 'High',
      startDate: getIsoDateOffset(-19),
      completedDate: getIsoDateOffset(-13),
      dueDate: getIsoDateOffset(-12),
      estimateHours: 12,
      progress: 100,
      subtasksDone: 3,
      subtasksTotal: 3,
    },
    {
      id: 'tsk-o-3',
      code: 'PLT-103-C',
      title: 'Build live shipment map component',
      category: 'Cartography',
      projectId: 'prj-orchard',
      assigneeId: 'usr-tarek',
      status: 'In Progress',
      priority: 'High',
      startDate: getIsoDateOffset(-10),
      dueDate: getIsoDateOffset(7),
      estimateHours: 22,
      progress: 60,
      subtasksDone: 3,
      subtasksTotal: 5,
    },
    {
      id: 'tsk-o-4',
      code: 'PLT-103-D',
      title: 'Review route optimisation results with client',
      category: 'Architecture',
      projectId: 'prj-orchard',
      assigneeId: 'usr-soren',
      status: 'In Review',
      priority: 'Medium',
      startDate: getIsoDateOffset(-6),
      dueDate: getIsoDateOffset(1),
      estimateHours: 6,
      progress: 85,
      subtasksDone: 2,
      subtasksTotal: 3,
    },
    {
      id: 'tsk-o-5',
      code: 'PLT-103-E',
      title: 'Write delivery and QA plan for dashboard filters',
      category: 'Field Ops',
      projectId: 'prj-orchard',
      assigneeId: 'usr-kaelen',
      status: 'Backlog',
      priority: 'Low',
      startDate: getIsoDateOffset(3),
      dueDate: getIsoDateOffset(9),
      estimateHours: 6,
      progress: 15,
      subtasksDone: 0,
      subtasksTotal: 2,
    },

    // 4. Atlas (3 Done, 1 In Review)
    {
      id: 'tsk-a-1',
      code: 'PLT-104-A',
      title: 'Redesign search and filter experience',
      category: 'Interface',
      projectId: 'prj-atlas',
      assigneeId: 'usr-nadia',
      status: 'Done',
      priority: 'High',
      startDate: getIsoDateOffset(-29),
      completedDate: getIsoDateOffset(-21),
      dueDate: getIsoDateOffset(-20),
      estimateHours: 14,
      progress: 100,
      subtasksDone: 4,
      subtasksTotal: 4,
    },
    {
      id: 'tsk-a-2',
      code: 'PLT-104-B',
      title: 'Integrate payments sandbox',
      category: 'Telemetry',
      projectId: 'prj-atlas',
      assigneeId: 'usr-jade',
      status: 'Done',
      priority: 'High',
      startDate: getIsoDateOffset(-22),
      completedDate: getIsoDateOffset(-15),
      dueDate: getIsoDateOffset(-14),
      estimateHours: 12,
      progress: 100,
      subtasksDone: 3,
      subtasksTotal: 3,
    },
    {
      id: 'tsk-a-3',
      code: 'PLT-104-C',
      title: 'Build seat and extras selection',
      category: 'Interface',
      projectId: 'prj-atlas',
      assigneeId: 'usr-tarek',
      status: 'Done',
      priority: 'High',
      startDate: getIsoDateOffset(-13),
      completedDate: getIsoDateOffset(-6),
      dueDate: getIsoDateOffset(-5),
      estimateHours: 16,
      progress: 100,
      subtasksDone: 4,
      subtasksTotal: 4,
    },
    {
      id: 'tsk-a-4',
      code: 'PLT-104-D',
      title: 'Performance and accessibility review',
      category: 'Architecture',
      projectId: 'prj-atlas',
      assigneeId: 'usr-soren',
      status: 'In Review',
      priority: 'Medium',
      startDate: getIsoDateOffset(-5),
      dueDate: getIsoDateOffset(3),
      estimateHours: 4,
      progress: 80,
      subtasksDone: 2,
      subtasksTotal: 3,
    },

    // 5. Lumen (4 Done)
    {
      id: 'tsk-l-1',
      code: 'PLT-105-A',
      title: 'Content migration of 120 exhibition pages',
      category: 'Outreach',
      projectId: 'prj-lumen',
      assigneeId: 'usr-juno',
      status: 'Done',
      priority: 'Medium',
      startDate: getIsoDateOffset(-37),
      completedDate: getIsoDateOffset(-30),
      dueDate: getIsoDateOffset(-30),
      estimateHours: 16,
      progress: 100,
      subtasksDone: 4,
      subtasksTotal: 4,
    },
    {
      id: 'tsk-l-2',
      code: 'PLT-105-B',
      title: 'Build accessible gallery component',
      category: 'Interface',
      projectId: 'prj-lumen',
      assigneeId: 'usr-tarek',
      status: 'Done',
      priority: 'High',
      startDate: getIsoDateOffset(-28),
      completedDate: getIsoDateOffset(-21),
      dueDate: getIsoDateOffset(-21),
      estimateHours: 14,
      progress: 100,
      subtasksDone: 3,
      subtasksTotal: 3,
    },
    {
      id: 'tsk-l-3',
      code: 'PLT-105-C',
      title: 'Launch checklist and DNS cutover',
      category: 'Telemetry',
      projectId: 'prj-lumen',
      assigneeId: 'usr-jade',
      status: 'Done',
      priority: 'High',
      startDate: getIsoDateOffset(-15),
      completedDate: getIsoDateOffset(-11),
      dueDate: getIsoDateOffset(-11),
      estimateHours: 4,
      progress: 100,
      subtasksDone: 2,
      subtasksTotal: 2,
    },
    {
      id: 'tsk-l-4',
      code: 'PLT-105-D',
      title: 'Client handover and training session',
      category: 'Field Ops',
      projectId: 'prj-lumen',
      assigneeId: 'usr-kaelen',
      status: 'Done',
      priority: 'Medium',
      startDate: getIsoDateOffset(-13),
      completedDate: getIsoDateOffset(-9),
      dueDate: getIsoDateOffset(-9),
      estimateHours: 3,
      progress: 100,
      subtasksDone: 1,
      subtasksTotal: 1,
    },

    // 6. Northwind (2 To do)
    {
      id: 'tsk-n-1',
      code: 'PLT-106-A',
      title: 'Brand audit and stakeholder interviews',
      category: 'Outreach',
      projectId: 'prj-northwind',
      assigneeId: 'usr-juno',
      status: 'Backlog',
      priority: 'Medium',
      startDate: getIsoDateOffset(8),
      dueDate: getIsoDateOffset(16),
      estimateHours: 10,
      progress: 10,
      subtasksDone: 0,
      subtasksTotal: 2,
    },
    {
      id: 'tsk-n-2',
      code: 'PLT-106-B',
      title: 'Draft naming and positioning options',
      category: 'Interface',
      projectId: 'prj-northwind',
      assigneeId: 'usr-mireia',
      status: 'Backlog',
      priority: 'High',
      startDate: getIsoDateOffset(10),
      dueDate: getIsoDateOffset(24),
      estimateHours: 12,
      progress: 15,
      subtasksDone: 0,
      subtasksTotal: 3,
    },
  ];
}

// Per-task deterministic factor within each status band:
// Done: 0.55–0.70, In Review: 0.50–0.65, In Progress: 0.25–0.40, Backlog: 0
const SEED_TASK_FACTORS: Record<string, number> = {
  // Done (0.55–0.70)
  'tsk-h-1': 0.62, // 10h -> 6.2h
  'tsk-h-2': 0.6, // 6h -> 3.6h
  'tsk-h-3': 0.625, // 16h -> 10.0h
  'tsk-h-4': 0.6, // 14h -> 8.4h
  'tsk-f-1': 0.6, // 12h -> 7.2h
  'tsk-f-2': 0.625, // 8h -> 5.0h
  'tsk-o-1': 0.6, // 6h -> 3.6h
  'tsk-o-2': 0.625, // 12h -> 7.5h
  'tsk-a-1': 0.6, // 14h -> 8.4h
  'tsk-a-2': 0.6, // 12h -> 7.2h
  'tsk-a-3': 0.6, // 16h -> 9.6h
  'tsk-l-1': 0.625, // 16h -> 10.0h (previous 30D)
  'tsk-l-2': 0.6, // 14h -> 8.4h
  'tsk-l-3': 0.625, // 4h -> 2.5h
  'tsk-l-4': 0.6, // 3h -> 1.8h
  // In Review (0.50–0.65)
  'tsk-h-6': 0.575, // 8h -> 4.6h
  'tsk-o-4': 0.55, // 6h -> 3.3h
  'tsk-a-4': 0.575, // 4h -> 2.3h
  // In Progress (0.25–0.40)
  'tsk-h-5': 1 / 3, // 18h -> 6.0h (0.333)
  'tsk-f-3': 0.3214, // 14h -> 4.5h (0.321)
  'tsk-f-4': 0.325, // 20h -> 6.5h (0.325)
  'tsk-o-3': 0.3182, // 22h -> 7.0h (0.318)
};

export function createSeedFocusSessions(tasks: TaskItem[]): FocusSession[] {
  const now = getNow();
  const nowMs = now.getTime();
  const todayIso = getTodayIsoDate();

  // Reset loggedSeconds and populate cycleDays / onTime on all tasks
  tasks.forEach((task) => {
    task.loggedSeconds = 0;
    if (!task.startDate) {
      task.startDate = task.completedDate
        ? getIsoDateOffset(-Math.max(5, computeDaysAgoFromIso(task.completedDate) + 6))
        : getIsoDateOffset(-6);
    }
    if (task.status === 'Done' && task.completedDate) {
      task.cycleDays = computeDaysBetweenIso(task.startDate, task.completedDate);
      task.onTime = task.completedDate <= task.dueDate;
    }
  });

  // Build lookup of all past/current weekdays up to 60 days ago
  interface WeekdaySlot {
    dateStr: string;
    daysAgo: number;
    weekdayIdx: number;
    baseTimeMs: number;
  }
  const weekdayByDate = new Map<string, WeekdaySlot>();
  for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
    const dateStr = getIsoDateOffset(-daysAgo);
    const parts = dateStr.split('-').map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    const weekdayIdx = dateObj.getDay();
    if (weekdayIdx === 0 || weekdayIdx === 6) continue; // 0 on weekends

    const defaultSessionMs = new Date(parts[0], parts[1] - 1, parts[2], 14, 0, 0).getTime();
    const baseTimeMs =
      daysAgo === 0 ? Math.min(nowMs - 15 * 60 * 1000, defaultSessionMs) : defaultSessionMs;
    if (baseTimeMs > nowMs) continue; // nothing after now

    weekdayByDate.set(dateStr, {
      dateStr,
      daysAgo,
      weekdayIdx,
      baseTimeMs,
    });
  }

  // Track tenths of an hour (1 tenth = 0.1h = 360s) per person per day (max 60 = 6.0h) and team per day (max 120 = 12.0h)
  const personDayTenths = new Map<string, number>();
  const teamDayTenths = new Map<string, number>();

  const getPersonDayKey = (memberId: string, dateStr: string) => `${memberId}|${dateStr}`;
  const getPersonTenths = (memberId: string, dateStr: string) =>
    personDayTenths.get(getPersonDayKey(memberId, dateStr)) ?? 0;
  const getTeamTenths = (dateStr: string) => teamDayTenths.get(dateStr) ?? 0;

  interface DraftChunk {
    id: string;
    task: TaskItem;
    slot: WeekdaySlot;
    tenths: number;
    slotOrder: number;
  }
  const draftChunks: DraftChunk[] = [];

  tasks.forEach((task) => {
    if (task.status === 'Backlog') {
      task.loggedSeconds = 0;
      return;
    }

    const [minF, maxF] = getTaskFactorBand(task.status);
    const rawFactor = SEED_TASK_FACTORS[task.id] ?? (minF + maxF) / 2;
    const clampedFactor = Math.min(maxF, Math.max(minF, rawFactor));
    const targetTenths = Math.round(task.estimateHours * clampedFactor * 10);
    if (targetTenths <= 0) return;

    const startIso = task.startDate || getIsoDateOffset(-10);
    const endIso =
      task.status === 'Done' && task.completedDate
        ? task.completedDate <= todayIso
          ? task.completedDate
          : todayIso
        : todayIso;

    // Collect eligible weekdays in [startIso, endIso]
    const eligibleSlots = Array.from(weekdayByDate.values())
      .filter((s) => s.dateStr >= startIso && s.dateStr <= endIso)
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    if (eligibleSlots.length === 0) return;

    // Each chunk must be in [0.5h, 3.0h] -> [5, 30] tenths
    const minChunks = Math.ceil(targetTenths / 30);
    const maxChunks = Math.max(1, Math.floor(targetTenths / 5));
    const desiredChunks = Math.round(targetTenths / 21);
    const k = Math.min(
      eligibleSlots.length,
      Math.max(minChunks, Math.min(maxChunks, desiredChunks))
    );

    // Split targetTenths into k chunks in [5, 30] tenths
    const baseTenths = Math.floor(targetTenths / k);
    const remTenths = targetTenths % k;
    const chunkTenthsList: number[] = Array.from({ length: k }, (_, idx) =>
      idx < remTenths ? baseTenths + 1 : baseTenths
    );

    // Add slight natural variation (+0.1h / -0.1h) if chunks are uniform and stay inside [5, 30]
    if (
      k >= 2 &&
      chunkTenthsList[0] + 1 <= 30 &&
      chunkTenthsList[k - 1] - 1 >= 5 &&
      chunkTenthsList[0] === chunkTenthsList[k - 1]
    ) {
      chunkTenthsList[0] += 1;
      chunkTenthsList[k - 1] -= 1;
    }

    // Assign each chunk to a distinct weekday in eligibleSlots respecting max 6h/day (60 tenths) per person and balancing daily team totals
    const usedDates = new Set<string>();
    chunkTenthsList.forEach((cTenths, chunkIdx) => {
      const candidates = eligibleSlots
        .filter((s) => !usedDates.has(s.dateStr))
        .sort((a, b) => {
          const aPersonOk = getPersonTenths(task.assigneeId, a.dateStr) + cTenths <= 60 ? 0 : 1;
          const bPersonOk = getPersonTenths(task.assigneeId, b.dateStr) + cTenths <= 60 ? 0 : 1;
          if (aPersonOk !== bPersonOk) return aPersonOk - bPersonOk;

          const aTeam = getTeamTenths(a.dateStr);
          const bTeam = getTeamTenths(b.dateStr);
          if (aTeam !== bTeam) return aTeam - bTeam;

          return a.dateStr.localeCompare(b.dateStr);
        });

      const chosen = candidates[0] || eligibleSlots[chunkIdx % eligibleSlots.length];
      usedDates.add(chosen.dateStr);

      personDayTenths.set(
        getPersonDayKey(task.assigneeId, chosen.dateStr),
        getPersonTenths(task.assigneeId, chosen.dateStr) + cTenths
      );
      teamDayTenths.set(chosen.dateStr, getTeamTenths(chosen.dateStr) + cTenths);

      draftChunks.push({
        id: `fcs-seed-${chosen.dateStr}-${task.id}-${chunkIdx}`,
        task,
        slot: chosen,
        tenths: cTenths,
        slotOrder: chunkIdx,
      });
    });
  });

  // Safety scaling pass: if any weekday exceeds 12h (120 tenths), scale the chunks on that weekday
  for (const [dateStr, totalTenths] of teamDayTenths.entries()) {
    if (totalTenths > 120) {
      const scale = 120 / totalTenths;
      const dayChunks = draftChunks.filter((c) => c.slot.dateStr === dateStr);
      dayChunks.forEach((c) => {
        c.tenths = Math.max(5, Math.floor(c.tenths * scale));
      });
    }
  }

  // Convert draftChunks into FocusSession records and accumulate task.loggedSeconds
  const sessions: FocusSession[] = draftChunks
    .sort((a, b) => b.slot.daysAgo - a.slot.daysAgo || a.id.localeCompare(b.id))
    .map((chunk, idx) => {
      const secs = chunk.tenths * 360;
      const hrs = Number((chunk.tenths / 10).toFixed(1));
      chunk.task.loggedSeconds = (chunk.task.loggedSeconds || 0) + secs;

      const createdAtMs = Math.min(
        nowMs - (idx + 1) * 1000,
        chunk.slot.baseTimeMs + chunk.slotOrder * 1200000
      );

      return {
        id: chunk.id,
        taskId: chunk.task.id,
        projectId: chunk.task.projectId,
        memberId: chunk.task.assigneeId,
        weekdayIndex: chunk.slot.weekdayIdx,
        date: chunk.slot.dateStr,
        daysAgo: chunk.slot.daysAgo,
        seconds: secs,
        hours: hrs,
        createdAt: new Date(createdAtMs).toISOString(),
      };
    });

  return dedupeById(sessions);
}

export function createSeedEvents(projects: Project[]): CalendarEvent[] {
  const manualEvents: CalendarEvent[] = [
    {
      id: 'evt-1',
      title: 'Harbor design critique',
      category: 'Review',
      projectId: 'prj-harbor',
      date: getIsoDateOffset(0),
      startTime: '15:00',
      endTime: '16:00',
      attendeeIds: ['usr-mireia', 'usr-nadia', 'usr-tarek'],
      location: 'Design Studio B',
    },
    {
      id: 'evt-2',
      title: 'Orchard route review with client',
      category: 'Review',
      projectId: 'prj-orchard',
      date: getIsoDateOffset(1),
      startTime: '14:00',
      endTime: '15:00',
      attendeeIds: ['usr-soren', 'usr-kaelen', 'usr-tarek', 'usr-jade'],
      location: 'Client Sync Portal',
    },
    {
      id: 'evt-3',
      title: 'Harbor usability findings readout',
      category: 'Review',
      projectId: 'prj-harbor',
      date: getIsoDateOffset(2),
      startTime: '11:00',
      endTime: '12:00',
      attendeeIds: ['usr-mireia', 'usr-nadia', 'usr-kaelen'],
      location: 'Conference Room 01',
    },
    {
      id: 'evt-4',
      title: 'Fernlight sprint review',
      category: 'Review',
      projectId: 'prj-fernlight',
      date: getIsoDateOffset(5),
      startTime: '15:00',
      endTime: '16:00',
      attendeeIds: ['usr-nadia', 'usr-jade', 'usr-juno'],
      location: 'Virtual Lab',
    },
    {
      id: 'evt-5',
      title: 'Atlas launch readiness review',
      category: 'Review',
      projectId: 'prj-atlas',
      date: getIsoDateOffset(7),
      startTime: '10:00',
      endTime: '11:00',
      attendeeIds: ['usr-soren', 'usr-tarek', 'usr-jade', 'usr-kaelen'],
      location: 'Architecture Deck',
    },
    {
      id: 'evt-6',
      title: 'Northwind kickoff workshop',
      category: 'Meeting',
      projectId: 'prj-northwind',
      date: getIsoDateOffset(8),
      startTime: '13:00',
      endTime: '15:00',
      attendeeIds: ['usr-mireia', 'usr-juno', 'usr-kaelen'],
      location: 'Brand Studio',
    },
    {
      id: 'evt-7',
      title: 'Lumen project retrospective',
      category: 'Review',
      projectId: 'prj-lumen',
      date: getIsoDateOffset(-6),
      startTime: '14:00',
      endTime: '15:00',
      attendeeIds: ['usr-juno', 'usr-tarek', 'usr-jade', 'usr-kaelen'],
      location: 'Studio Commons',
    },
    {
      id: 'evt-8',
      title: 'studio lunch & learn',
      category: 'Social',
      date: getIsoDateOffset(6),
      startTime: '12:30',
      endTime: '13:30',
      attendeeIds: [
        'usr-soren',
        'usr-mireia',
        'usr-tarek',
        'usr-kaelen',
        'usr-nadia',
        'usr-juno',
        'usr-jade',
      ],
      location: 'Main Lounge',
    },
    {
      id: 'evt-9',
      title: 'daily standup',
      category: 'Team',
      date: getIsoDateOffset(0),
      startTime: '09:30',
      endTime: '09:45',
      attendeeIds: [
        'usr-soren',
        'usr-mireia',
        'usr-tarek',
        'usr-kaelen',
        'usr-nadia',
        'usr-juno',
        'usr-jade',
      ],
      location: 'Standup Circle',
    },
  ];

  // Auto-create Deadline events from project due dates
  const deadlineEvents: CalendarEvent[] = projects.map((p) => ({
    id: `evt-dl-${p.id}`,
    title: `Deadline: ${p.name}`,
    category: 'Deadline',
    projectId: p.id,
    date: p.targetDate,
    startTime: '17:00',
    endTime: '18:00',
    attendeeIds: [p.leadId],
    location: 'Project Milestone',
  }));

  return [...manualEvents, ...deadlineEvents];
}

// --- Workspace Data Validation Function ---
export function validateWorkspace(
  projects: Project[],
  tasks: TaskItem[],
  team: TeamMember[],
  events: CalendarEvent[],
  focusSessions: FocusSession[]
): WorkspaceValidationReport {
  const today = getTodayIsoDate();
  const nowMs = getNowTimestamp();
  const checks: ValidationCheckResult[] = [];

  // Check 1: All IDs resolve and are unique
  const projIds = new Set(projects.map((p) => p.id));
  const taskIds = new Set(tasks.map((t) => t.id));
  const teamIds = new Set(team.map((m) => m.id));
  const eventIds = new Set(events.map((e) => e.id));
  const sessionIds = new Set(focusSessions.map((s) => s.id));

  const projUnique = projIds.size === projects.length;
  const taskUnique = taskIds.size === tasks.length;
  const teamUnique = teamIds.size === team.length;
  const eventUnique = eventIds.size === events.length;
  const sessionUnique = sessionIds.size === focusSessions.length;

  const tasksProjectValid = tasks.every((t) => projIds.has(t.projectId));
  const focusTaskValid = focusSessions.every(
    (s) => taskIds.has(s.taskId) && projIds.has(s.projectId)
  );

  const check1Passed =
    projUnique &&
    taskUnique &&
    teamUnique &&
    eventUnique &&
    sessionUnique &&
    tasksProjectValid &&
    focusTaskValid;
  checks.push({
    id: 'ids-unique',
    label: 'All IDs resolve and are unique',
    passed: check1Passed,
    details: check1Passed
      ? `Projects (${projects.length}), Tasks (${tasks.length}), Team (${team.length}), Events (${events.length}), Sessions (${focusSessions.length}) unique and valid.`
      : 'Duplicate or unresolvable IDs detected.',
  });

  // Check 2: Statuses and progress match tasks (skipping statusOverride)
  let check2Passed = true;
  for (const p of projects) {
    if (p.statusOverride) continue;
    const calcProgress = getProjectProgress(p, tasks);
    if (p.progress !== calcProgress) {
      check2Passed = false;
    }
  }
  checks.push({
    id: 'statuses-progress',
    label: 'Project statuses and progress match tasks',
    passed: check2Passed,
    details: check2Passed
      ? 'All project progress percentages and derived statuses match task calculations.'
      : 'Mismatch between project status/progress and tasks.',
  });

  // Check 3: No weekend or future sessions, and no sessions for unstarted tasks
  const futureSessions = focusSessions.some(
    (s) => s.date > today || (s.createdAt ? new Date(s.createdAt).getTime() > nowMs : false)
  );
  const weekendSessions = focusSessions.some((s) => {
    const parts = s.date.split('-').map(Number);
    const dayOfWeek =
      parts.length === 3
        ? new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getDay()
        : s.weekdayIndex;
    return dayOfWeek === 0 || dayOfWeek === 6 || s.weekdayIndex === 0 || s.weekdayIndex === 6;
  });
  const unstartedSessions = focusSessions.some((s) => {
    const task = tasks.find((t) => t.id === s.taskId);
    return !task || task.status === 'Backlog';
  });
  const check3Passed = !futureSessions && !weekendSessions && !unstartedSessions;
  checks.push({
    id: 'sessions-valid',
    label: 'No weekend or future sessions, and no unstarted task sessions',
    passed: check3Passed,
    details: check3Passed
      ? 'All focus sessions logged on past/current weekdays only for active tasks.'
      : 'Weekend, future, or unstarted task focus sessions found.',
  });

  // Check 4: Done tasks have completion dates in the past and every task has a startDate
  const doneTasks = tasks.filter((t) => t.status === 'Done');
  const everyTaskHasStartDate = tasks.every((t) => Boolean(t.startDate));
  const check4Passed =
    everyTaskHasStartDate &&
    doneTasks.every((t) => Boolean(t.completedDate) && t.completedDate! <= today);
  checks.push({
    id: 'done-completion-dates',
    label: 'Every task has a start date and Done tasks have completion dates in the past',
    passed: check4Passed,
    details: check4Passed
      ? `All ${tasks.length} tasks have start dates and all ${doneTasks.length} completed tasks have valid completion dates in the past.`
      : 'Missing startDate or invalid completion date found.',
  });

  // Check 5: Assignees exist
  const check5Passed = tasks.every((t) => teamIds.has(t.assigneeId));
  checks.push({
    id: 'assignees-exist',
    label: 'Task assignees exist in team',
    passed: check5Passed,
    details: check5Passed
      ? 'All task assignees map to valid team members.'
      : 'Unassigned or unknown team member IDs found on tasks.',
  });

  // Check 6: Event attendees valid
  const check6Passed = events.every((e) => e.attendeeIds.every((attId) => teamIds.has(attId)));
  checks.push({
    id: 'event-attendees-valid',
    label: 'Event attendees exist in team',
    passed: check6Passed,
    details: check6Passed
      ? 'All event attendee IDs exist in team.'
      : 'Invalid event attendee IDs found.',
  });

  // Check 7: Stat cards sum to Total
  let endedCnt = 0;
  let runningCnt = 0;
  let pendingCnt = 0;
  projects.forEach((p) => {
    const st = getProjectStatus(p, tasks);
    if (st === 'Ended') endedCnt++;
    else if (st === 'Pending') pendingCnt++;
    else runningCnt++;
  });
  const totalCnt = projects.length;
  const check7Passed = endedCnt + runningCnt + pendingCnt === totalCnt;
  checks.push({
    id: 'stat-cards-sum',
    label: 'Stat cards sum to Total (Ended + Running + Pending = Total)',
    passed: check7Passed,
    details: check7Passed
      ? `Total (${totalCnt}) = Ended (${endedCnt}) + Running (${runningCnt}) + Pending (${pendingCnt}).`
      : `Sum mismatch: ${endedCnt} + ${runningCnt} + ${pendingCnt} != ${totalCnt}`,
  });

  // Check 8: Team, Profile, Dashboard and Tasks show identical counts per person
  let check8Passed = true;
  team.forEach((m) => {
    const { openCount, completedCount } = getMemberTaskCounts(m.id, tasks);
    const assignedOpen = tasks.filter(
      (t) => (t.assigneeId === m.id || t.coAssigneeId === m.id) && t.status !== 'Done'
    ).length;
    const assignedDone = tasks.filter(
      (t) => (t.assigneeId === m.id || t.coAssigneeId === m.id) && t.status === 'Done'
    ).length;
    if (openCount !== assignedOpen || completedCount !== assignedDone) {
      check8Passed = false;
    }
  });
  checks.push({
    id: 'identical-person-counts',
    label: 'Team, Profile, Dashboard, and Tasks show identical counts per person',
    passed: check8Passed,
    details: check8Passed
      ? 'Per-person task counts match perfectly across all screens.'
      : 'Mismatched task counts per person.',
  });

  // Check 9: For each filter chip, the count equals the number of rows shown
  const allFilterRows = projects.length;
  const pendingChipCount = projects.filter((p) => getProjectStatus(p, tasks) === 'Pending').length;
  const runningChipCount = projects.filter((p) => getProjectStatus(p, tasks) === 'Running').length;
  const endedChipCount = projects.filter((p) => getProjectStatus(p, tasks) === 'Ended').length;

  const check9Passed = pendingChipCount + runningChipCount + endedChipCount === allFilterRows;
  checks.push({
    id: 'filter-chip-counts',
    label: 'Filter chip counts equal number of rows shown for each status filter',
    passed: check9Passed,
    details: check9Passed
      ? `Filter chips equal rows shown: All (${allFilterRows}), Running (${runningChipCount}), Pending (${pendingChipCount}), Ended (${endedChipCount}).`
      : 'Mismatch between filter chip counts and status row counts.',
  });

  // Check 10: Analytics KPI task count equals count of store tasks completed in range, and contributor counts sum to it
  const rangeDays30 = 30;
  const tasksIn30D = tasks.filter((t) => isTaskCompletedInRange(t, 0, rangeDays30));
  const kpiTaskCount30D = tasksIn30D.length;
  const contributorCounts30D = team.map(
    (m) => tasksIn30D.filter((t) => t.assigneeId === m.id).length
  );
  const contributorSum30D = contributorCounts30D.reduce((a, b) => a + b, 0);
  const check10Passed =
    kpiTaskCount30D === tasksIn30D.length && contributorSum30D === kpiTaskCount30D;
  checks.push({
    id: 'analytics-kpi-contributor-tasks',
    label: 'KPI task count equals store tasks completed in range and contributor counts sum to it',
    passed: check10Passed,
    details: check10Passed
      ? `30D KPI tasks (${kpiTaskCount30D}) equals store tasks completed in range (${tasksIn30D.length}); contributor counts sum to ${contributorSum30D}.`
      : `Mismatch: KPI (${kpiTaskCount30D}) vs contributor sum (${contributorSum30D}).`,
  });

  // Check 11: Donut slices sum to total hours (and 100%)
  const sessionsIn30D = focusSessions.filter((s) => {
    const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
    return dAgo >= 0 && dAgo < rangeDays30;
  });
  const totalSeconds30D = sessionsIn30D.reduce(
    (acc, s) =>
      acc +
      (typeof s.seconds === 'number' ? Math.round(s.seconds) : Math.round((s.hours || 0) * 3600)),
    0
  );
  const totalHours30D = Number((totalSeconds30D / 3600).toFixed(1));
  const sliceSecondsList = projects
    .map((p) =>
      sessionsIn30D
        .filter((s) => s.projectId === p.id)
        .reduce(
          (acc, s) =>
            acc +
            (typeof s.seconds === 'number'
              ? Math.round(s.seconds)
              : Math.round((s.hours || 0) * 3600)),
          0
        )
    )
    .filter((secs) => secs > 0);
  const sliceSecondsSum = sliceSecondsList.reduce((a, b) => a + b, 0);
  const sliceHoursSum = Number(
    sliceSecondsList.reduce((acc, secs) => acc + Number((secs / 3600).toFixed(1)), 0).toFixed(1)
  );
  const check11Passed =
    sliceSecondsSum === totalSeconds30D && Math.abs(sliceHoursSum - totalHours30D) < 0.05;
  checks.push({
    id: 'donut-slices-sum-hours',
    label: 'Donut slices sum to total focus hours',
    passed: check11Passed,
    details: check11Passed
      ? `Donut slices sum to ${sliceHoursSum}h (${sliceSecondsSum}s), matching total ${totalHours30D}h.`
      : `Donut slices (${sliceHoursSum}h) do not match total hours (${totalHours30D}h).`,
  });

  // Check 12: Each task's logged hours falls inside its factor band and no task exceeds 1.2x estimate
  const taskBandViolations: string[] = [];
  let maxFactorObserved = 0;
  tasks.forEach((t) => {
    const taskSessionSeconds = focusSessions
      .filter((s) => s.taskId === t.id)
      .reduce(
        (acc, s) =>
          acc +
          (typeof s.seconds === 'number'
            ? Math.round(s.seconds)
            : Math.round((s.hours || 0) * 3600)),
        0
      );
    const loggedSeconds =
      typeof t.loggedSeconds === 'number' ? t.loggedSeconds : taskSessionSeconds;
    const loggedHours = loggedSeconds / 3600;
    const [minF, maxF] = getTaskFactorBand(t.status);
    const factor = t.estimateHours > 0 ? loggedHours / t.estimateHours : 0;
    if (factor > maxFactorObserved) maxFactorObserved = factor;

    const eps = 1e-4;
    const inBand =
      t.status === 'Backlog' ? loggedSeconds === 0 : factor + eps >= minF && factor - eps <= maxF;
    const underCap = factor - eps <= 1.2;

    if (!inBand || !underCap || Math.abs(loggedSeconds - taskSessionSeconds) > 1) {
      taskBandViolations.push(
        `${t.id} (${t.status}): ${loggedHours.toFixed(2)}h / ${t.estimateHours}h = ${factor.toFixed(3)} (expected ${minF}..${maxF})`
      );
    }
  });
  const check12Passed = taskBandViolations.length === 0;
  checks.push({
    id: 'task-factor-bands',
    label: 'Each task logged hours falls inside its factor band and <= 1.2x estimate',
    passed: check12Passed,
    details: check12Passed
      ? `All ${tasks.length} tasks fall strictly within their status factor bands (max observed ${(maxFactorObserved * 100).toFixed(1)}% of estimate, <= 120%).`
      : `Violations: ${taskBandViolations.join('; ')}`,
  });

  // Check 13: Weekly Output (Dashboard) for the current week equals the sum of Analytics 7D
  const sessions7D = focusSessions.filter((s) => {
    const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
    return dAgo >= 0 && dAgo < 7;
  });
  const analytics7DSeconds = sessions7D.reduce(
    (acc, s) =>
      acc +
      (typeof s.seconds === 'number' ? Math.round(s.seconds) : Math.round((s.hours || 0) * 3600)),
    0
  );
  const dashboardWeeklySeconds = [0, 1, 2, 3, 4, 5, 6].reduce((sum, dayIdx) => {
    const colSecs = focusSessions
      .filter((s) => {
        const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
        return dAgo >= 0 && dAgo < 7 && s.weekdayIndex === dayIdx;
      })
      .reduce(
        (acc, s) =>
          acc +
          (typeof s.seconds === 'number'
            ? Math.round(s.seconds)
            : Math.round((s.hours || 0) * 3600)),
        0
      );
    return sum + colSecs;
  }, 0);
  const check13Passed = dashboardWeeklySeconds === analytics7DSeconds;
  checks.push({
    id: 'weekly-output-equals-analytics-7d',
    label: 'Weekly Output (Dashboard) for the current week equals the sum of Analytics 7D',
    passed: check13Passed,
    details: check13Passed
      ? `Dashboard Weekly Output (${(dashboardWeeklySeconds / 3600).toFixed(1)}h / ${dashboardWeeklySeconds}s) equals Analytics 7D (${(analytics7DSeconds / 3600).toFixed(1)}h / ${analytics7DSeconds}s).`
      : `Mismatch: Dashboard (${dashboardWeeklySeconds}s) vs Analytics 7D (${analytics7DSeconds}s).`,
  });

  const overallPassed = checks.every((c) => c.passed);
  const report: WorkspaceValidationReport = {
    timestamp: getNow().toISOString(),
    passed: overallPassed,
    checks,
  };

  console.log('[Workspace Data Validation Report]', report);
  return report;
}

// --- Persistence Loaders with Benchmark Fallback ---
function loadPersistedProjects(): Project[] {
  if (typeof window === 'undefined') return createSeedProjects();
  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some((p) => p.id === 'prj-harbor')) {
        return dedupeById<Project>(parsed);
      }
    }
  } catch {
    // Ignore
  }
  return createSeedProjects();
}

function savePersistedProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(dedupeById(projects)));
  } catch {
    // Ignore
  }
}

function loadPersistedTasks(): TaskItem[] {
  if (typeof window === 'undefined') return createSeedTasks();
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some((t) => t.id === 'tsk-h-1' && Boolean(t.startDate))) {
        return dedupeById<TaskItem>(parsed);
      }
    }
  } catch {
    // Ignore
  }
  return createSeedTasks();
}

function savePersistedTasks(tasks: TaskItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(dedupeById(tasks)));
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
      if (Array.isArray(parsed) && parsed.some((m) => m.id === 'usr-soren')) {
        return dedupeById<TeamMember>(parsed);
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

function loadPersistedEvents(projects: Project[]): CalendarEvent[] {
  if (typeof window === 'undefined') return createSeedEvents(projects);
  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some((e) => e.id === 'evt-1')) {
        return dedupeById<CalendarEvent>(parsed);
      }
    }
  } catch {
    // Ignore
  }
  return createSeedEvents(projects);
}

function savePersistedEvents(events: CalendarEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(dedupeById(events)));
  } catch {
    // Ignore
  }
}

function loadPersistedFocusSessions(tasks: TaskItem[]): FocusSession[] {
  if (typeof window === 'undefined') return createSeedFocusSessions(tasks);
  try {
    const raw = window.localStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasWeekendOrInvalid = parsed.some((s: FocusSession) => {
          const parts = (s.date || '').split('-').map(Number);
          const day =
            parts.length === 3
              ? new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getDay()
              : s.weekdayIndex;
          return day === 0 || day === 6 || s.weekdayIndex === 0 || s.weekdayIndex === 6;
        });
        if (!hasWeekendOrInvalid) {
          // Sync task.loggedSeconds with persisted sessions
          tasks.forEach((t) => {
            t.loggedSeconds = parsed
              .filter((s: FocusSession) => s.taskId === t.id)
              .reduce(
                (acc: number, s: FocusSession) =>
                  acc +
                  (typeof s.seconds === 'number'
                    ? Math.round(s.seconds)
                    : Math.round((s.hours || 0) * 3600)),
                0
              );
          });
          return dedupeById<FocusSession>(parsed);
        }
      }
    }
  } catch {
    // Ignore
  }
  return createSeedFocusSessions(tasks);
}

function savePersistedFocusSessions(sessions: FocusSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(dedupeById(sessions)));
  } catch {
    // Ignore
  }
}

function loadInitialCurrentUser(): TeamMember {
  return SEED_TEAM[0];
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
  return 0;
}

function loadInitialTimerRunning(): boolean {
  return false;
}

function loadInitialTimerTaskId(): string {
  return 'tsk-h-5';
}

function loadInitialSignedOut(): boolean {
  return false;
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
  selectedProjectIdForDialog: string | null;
  importModalOpen: boolean;
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
  setNewProjectModalOpen: (open: boolean) => void;
  setNewTaskModalOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSelectedProfileMemberId: (id: string | null) => void;
  openProjectDialog: (id: string | null) => void;
  setImportModalOpen: (open: boolean) => void;
  setTourStep: (step: number | null) => void;
  setSignedOut: (signedOut: boolean) => void;
  updateProfile: (input: UpdateProfileInput) => void;
  toggleNotification: (key: keyof NotificationSettings) => void;
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
  resetDemoData: () => void;
  runValidationCheck: () => WorkspaceValidationReport;
}

export const usePlotlineStore = create<PlotlineState>((set, get) => {
  const initialProjects = loadPersistedProjects();
  const initialTasks = loadPersistedTasks();
  const initialTeam = loadPersistedTeam();
  const initialEvents = loadPersistedEvents(initialProjects);
  const initialFocusSessions = loadPersistedFocusSessions(initialTasks);

  // Run validation check on startup
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      validateWorkspace(
        initialProjects,
        initialTasks,
        initialTeam,
        initialEvents,
        initialFocusSessions
      );
    }, 100);
  }

  return {
    projects: initialProjects,
    tasks: initialTasks,
    team: initialTeam,
    events: initialEvents,
    focusSessions: initialFocusSessions,
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
    selectedProjectIdForDialog: null,
    importModalOpen: false,
    tourStep: null,
    isSignedOut: loadInitialSignedOut(),

    openProjectDialog: (id) => set({ selectedProjectIdForDialog: id }),
    setImportModalOpen: (importModalOpen) => set({ importModalOpen }),
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

      const updatedTeam = state.team.map((m) => (m.id === updatedUser.id ? updatedUser : m));

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
        input.id || `prj-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = snapshot.projects.find((p) => p.id === newId);
      if (existing) return existing;

      const nextNumber = 107 + snapshot.projects.length;
      const code = `PLT-${nextNumber}`;
      const newProject: Project = {
        id: newId,
        code,
        name: input.name.trim(),
        client: input.client?.trim() || 'Independent Partner',
        sector: input.sector?.trim() || 'Engineering & Operations',
        status: input.status || 'On Track',
        leadId: snapshot.currentUser.id,
        startDate: getTodayIsoDate(),
        targetDate: input.targetDate,
        progress: 0,
        budgetAllocated: 150000,
        budgetSpent: 0,
        summary: `Newly chartered project (${code}) target completion ${input.targetDate}.`,
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

    updateProject: (id, updates) => {
      let updatedProjName = '';
      set((state) => {
        const nextProjects = state.projects.map((p) => {
          if (p.id !== id) return p;
          updatedProjName = updates.name !== undefined ? updates.name : p.name;
          const updated = {
            ...p,
            ...updates,
            name: updates.name !== undefined ? updates.name.trim() : p.name,
            client: updates.client !== undefined ? updates.client.trim() : p.client,
            targetDate: updates.targetDate !== undefined ? updates.targetDate : p.targetDate,
            progress:
              updates.progress !== undefined
                ? Math.max(0, Math.min(100, updates.progress))
                : p.progress,
          };
          if (updates.statusOverride !== undefined) {
            updated.statusOverride = updates.statusOverride;
            updated.status = updates.statusOverride;
          }
          return updated;
        });
        savePersistedProjects(nextProjects);
        return { projects: nextProjects };
      });
      if (updatedProjName) {
        get().pushToast(`Project "${updatedProjName}" updated`);
      }
    },

    importProjects: (items) => {
      const snapshot = get();
      let importedCount = 0;
      let skippedCount = 0;
      const newProjects: Project[] = [];

      const existingKeys = new Set(
        snapshot.projects.map((p) => `${p.name.trim().toLowerCase()}|${p.targetDate.trim()}`)
      );

      items.forEach((item, idx) => {
        const cleanName = item.name.trim();
        const cleanDate = item.targetDate.trim();
        const key = `${cleanName.toLowerCase()}|${cleanDate}`;
        if (!cleanName || existingKeys.has(key)) {
          skippedCount++;
          return;
        }
        existingKeys.add(key);
        importedCount++;

        const nextNum = 110 + snapshot.projects.length + newProjects.length;
        const newPrj: Project = {
          id: `prj-imp-${getNowTimestamp()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          code: `PLT-${nextNum}`,
          name: cleanName,
          client: item.client.trim() || 'Imported Partner',
          sector: 'Specialized Operations',
          status: 'Pending',
          leadId: snapshot.currentUser.id,
          startDate: getTodayIsoDate(),
          targetDate: cleanDate,
          progress: 0,
          budgetAllocated: 150000,
          budgetSpent: 0,
          summary: `Imported project stream (${cleanName}).`,
        };
        newProjects.push(newPrj);
      });

      if (newProjects.length > 0) {
        const nextProjects = dedupeById([...newProjects, ...snapshot.projects]);
        savePersistedProjects(nextProjects);
        set({ projects: nextProjects });
      }

      const toastTitle = `${importedCount} ${importedCount === 1 ? 'project' : 'projects'} imported, ${skippedCount} skipped`;
      get().pushToast(
        toastTitle,
        importedCount > 0 ? 'Active portfolio updated' : 'No new projects added'
      );

      return { importedCount, skippedCount };
    },

    importSampleBatch: () => {
      const snapshot = get();
      const newId = `prj-imp-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
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
        targetDate: getIsoDateOffset(45),
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
          'Portfolio metrics and projects updated.'
        );
      }

      return importedProject;
    },

    moveTask: (taskId, newStatus) => {
      const snapshot = get();
      const target = snapshot.tasks.find((t) => t.id === taskId);
      if (!target || target.status === newStatus) return;

      const nowTs = getNowTimestamp();
      const nextProgress = progressForTaskStatus(newStatus, target.progress);
      const nextSubtasksDone =
        newStatus === 'Done'
          ? target.subtasksTotal
          : newStatus === 'Backlog'
            ? 0
            : Math.max(1, Math.min(target.subtasksTotal - 1, target.subtasksDone));

      set((state) => {
        const currentTarget = state.tasks.find((t) => t.id === taskId);
        if (!currentTarget || currentTarget.status === newStatus) return state;

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
          const projProgress = getProjectProgress(proj, updatedTasks);
          return {
            ...proj,
            progress: projProgress,
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
        input.id || `tsk-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = snapshot.tasks.find((t) => t.id === newId);
      if (existing) return existing;

      const nowTs = getNowTimestamp();
      const defaultProject = snapshot.projects[0];
      const nextCodeNum = 100 + snapshot.tasks.length;
      const status = input.status || 'Backlog';
      const targetProjectId = defaultProject?.id || 'prj-harbor';
      const newTask: TaskItem = {
        id: newId,
        code: `PLT-${nextCodeNum}`,
        title: input.title.trim(),
        category: input.category.trim() || 'Engineering',
        projectId: targetProjectId,
        assigneeId: input.assigneeId || snapshot.currentUser.id,
        status,
        priority: input.priority,
        startDate: input.startDate || getTodayIsoDate(),
        dueDate: input.dueDate,
        completedDate: status === 'Done' ? getTodayIsoDate() : undefined,
        estimateHours: input.priority === 'High' ? 14 : input.priority === 'Medium' ? 10 : 6,
        loggedSeconds: 0,
        cycleDays: 5,
        onTime: true,
        progress: progressForTaskStatus(status, 15),
        subtasksDone: status === 'Done' ? 4 : 0,
        subtasksTotal: 4,
        weekdayIndex: getNow().getDay(),
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
          const projProgress = getProjectProgress(proj, nextTasks);
          return {
            ...proj,
            progress: projProgress,
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
        input.id || `usr-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 5)}`;
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
        statusLabel: 'Newly onboarded specialist',
        location: input.location?.trim() || 'Remote · CET',
        timezone: 'CET (UTC+1)',
        initials,
        capacityHours: 60,
        allocatedHours: 20,
        email: input.email?.trim() || `${parts[0].toLowerCase()}@plotline.studio`,
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
        input.id || `evt-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = snapshot.events.find((e) => e.id === newId);
      if (existing) return existing;

      const newEvent: CalendarEvent = {
        id: newId,
        title: input.title.trim(),
        category: input.category,
        projectId: input.projectId || snapshot.projects[0]?.id || 'prj-harbor',
        date: input.date,
        startTime: input.startTime || '10:00',
        endTime: input.endTime || '11:00',
        attendeeIds: input.attendeeIds.length > 0 ? input.attendeeIds : [snapshot.currentUser.id],
        location: input.location?.trim() || 'Studio Room 01',
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
      const nextTasks = snapshot.tasks.filter((t) => t.projectId !== projectId);

      savePersistedProjects(nextProjects);
      savePersistedTasks(nextTasks);

      set({
        projects: nextProjects,
        tasks: nextTasks,
      });

      get().pushToastWithUndo(
        `Project "${target.name}" deleted`,
        'Associated deliverables removed',
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
          nextAssignee = 'usr-soren';
          updated = true;
        }
        if (t.coAssigneeId === memberId) {
          nextCoAssignee = undefined;
          updated = true;
        }

        return updated ? { ...t, assigneeId: nextAssignee, coAssigneeId: nextCoAssignee } : t;
      });

      savePersistedTeam(nextTeam);
      savePersistedTasks(nextTasks);

      set({
        team: nextTeam,
        tasks: nextTasks,
      });

      get().pushToastWithUndo(
        `Specialist "${target.name}" deleted`,
        'Assigned tasks reallocated',
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
      savePersistedTasks(nextTasks);

      set({
        tasks: nextTasks,
      });

      get().pushToastWithUndo(`Task "${target.code}" deleted`, target.title, () =>
        get().restoreSnapshot(savedSnapshot)
      );
    },

    restoreSnapshot: (snapshot) => {
      savePersistedProjects(snapshot.projects);
      savePersistedTasks(snapshot.tasks);
      savePersistedTeam(snapshot.team);
      savePersistedEvents(snapshot.events);
      savePersistedFocusSessions(snapshot.focusSessions);

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

      get().pushToast('Deletion undone', 'Restored dataset record.');
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
          isCheckedIn
            ? `Meeting ended: ${targetEvent.title}`
            : `Meeting started: ${targetEvent.title}`,
          `${targetEvent.startTime}–${targetEvent.endTime} · ${targetEvent.location}`
        );
      }
    },

    toggleTimer: () => {
      set((state) => {
        const nextRunning = !state.timerRunning;
        const nextSeconds = state.timerSeconds;
        return { timerRunning: nextRunning, timerSeconds: nextSeconds };
      });
    },

    resetTimer: () => {
      const snapshot = get();
      const elapsedSeconds =
        snapshot.timerSeconds > 0 ? snapshot.timerSeconds : snapshot.timerRunning ? 1 : 0;
      const activeTask =
        snapshot.tasks.find((t) => t.id === snapshot.timerTaskId) || snapshot.tasks[0];

      if (elapsedSeconds > 0 && activeTask) {
        const newSessionId = `fcs-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
        const nowTs = getNowTimestamp();
        const todayWeekday = getNow().getDay();
        const newSession: FocusSession = {
          id: newSessionId,
          taskId: activeTask.id,
          projectId: activeTask.projectId,
          memberId: activeTask.assigneeId || snapshot.currentUser.id,
          weekdayIndex: todayWeekday === 0 ? 5 : todayWeekday === 6 ? 5 : todayWeekday,
          date: getTodayIsoDate(),
          daysAgo: 0,
          seconds: elapsedSeconds,
          hours: elapsedSeconds / 3600,
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
        return { timerSeconds: nextSeconds };
      });
    },

    setTimerTask: (timerTaskId) => {
      set({ timerTaskId });
    },

    pushToast: (title, detail) => {
      const id = `tst-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
      set((state) => ({
        toasts: [...state.toasts, { id, title, detail }],
      }));
      setTimeout(() => {
        get().dismissToast(id);
      }, 4200);
    },

    pushToastWithUndo: (title, detail, undoAction) => {
      const id = `tst-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
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

    resetDemoData: () => {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(PROJECTS_STORAGE_KEY);
          window.localStorage.removeItem(TASKS_STORAGE_KEY);
          window.localStorage.removeItem(TEAM_STORAGE_KEY);
          window.localStorage.removeItem(EVENTS_STORAGE_KEY);
          window.localStorage.removeItem(FOCUS_SESSIONS_STORAGE_KEY);
          window.localStorage.removeItem(CHECKED_IN_EVENTS_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }

      const freshProjects = createSeedProjects();
      const freshTasks = createSeedTasks();
      const freshTeam = SEED_TEAM;
      const freshEvents = createSeedEvents(freshProjects);
      const freshSessions = createSeedFocusSessions(freshTasks);

      set({
        projects: freshProjects,
        tasks: freshTasks,
        team: freshTeam,
        events: freshEvents,
        focusSessions: freshSessions,
        checkedInEventIds: [],
        timerSeconds: 0,
        timerRunning: false,
        timerTaskId: 'tsk-h-5',
      });

      validateWorkspace(freshProjects, freshTasks, freshTeam, freshEvents, freshSessions);
      get().pushToast('Demo data reset', 'Restored initial benchmark dataset.');
    },

    runValidationCheck: () => {
      const state = get();
      return validateWorkspace(
        state.projects,
        state.tasks,
        state.team,
        state.events,
        state.focusSessions
      );
    },
  };
});

export const useStore = usePlotlineStore;
