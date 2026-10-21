import {
  Project,
  TaskItem,
  TeamMember,
  FocusSession,
  CalendarEvent,
  WorkspaceValidationReport,
  ValidationCheckResult,
} from '../types';
import { getTodayIsoDate, getIsoDateOffset, getNow, getNowTimestamp } from '../../lib/clock';
import { computeDaysAgoFromIso, computeDaysBetweenIso } from '../derivations/time';
import { getTaskFactorBand, isTaskCompletedInRange } from '../derivations/tasks';
import { getProjectProgress, getProjectStatus } from '../derivations/projects';
import { getMemberTaskCounts } from '../derivations/team';

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
      summary: 'Real-time fleet shipment tracking, analytics map, and route optimization.',
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
      dueDate: getIsoDateOffset(-19),
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
      dueDate: getIsoDateOffset(-1),
      estimateHours: 14,
      progress: 50,
      subtasksDone: 2,
      subtasksTotal: 4,
    },
    {
      id: 'tsk-f-4',
      code: 'PLT-102-D',
      title: 'Build habit tracking API',
      category: 'Engineering',
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
      category: 'Research',
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
      category: 'Engineering',
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
      category: 'Engineering',
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

const SEED_TASK_FACTORS: Record<string, number> = {
  'tsk-h-1': 0.62,
  'tsk-h-2': 0.6,
  'tsk-h-3': 0.625,
  'tsk-h-4': 0.6,
  'tsk-f-1': 0.6,
  'tsk-f-2': 0.625,
  'tsk-o-1': 0.6,
  'tsk-o-2': 0.625,
  'tsk-a-1': 0.6,
  'tsk-a-2': 0.6,
  'tsk-a-3': 0.6,
  'tsk-l-1': 0.625,
  'tsk-l-2': 0.6,
  'tsk-l-3': 0.625,
  'tsk-l-4': 0.6,
  'tsk-h-6': 0.575,
  'tsk-o-4': 0.55,
  'tsk-a-4': 0.575,
  'tsk-h-5': 1 / 3,
  'tsk-f-3': 0.3214,
  'tsk-f-4': 0.325,
  'tsk-o-3': 0.3182,
};

export function createSeedFocusSessions(tasks: TaskItem[], _projects?: Project[]): FocusSession[] {
  void _projects;
  const now = getNow();
  const nowMs = now.getTime();
  const todayIso = getTodayIsoDate();

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
    if (weekdayIdx === 0 || weekdayIdx === 6) continue;

    const defaultSessionMs = new Date(parts[0], parts[1] - 1, parts[2], 14, 0, 0).getTime();
    const baseTimeMs =
      daysAgo === 0 ? Math.min(nowMs - 15 * 60 * 1000, defaultSessionMs) : defaultSessionMs;
    if (baseTimeMs > nowMs) continue;

    weekdayByDate.set(dateStr, {
      dateStr,
      daysAgo,
      weekdayIdx,
      baseTimeMs,
    });
  }

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

    const eligibleSlots = Array.from(weekdayByDate.values())
      .filter((s) => s.dateStr >= startIso && s.dateStr <= endIso)
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    if (eligibleSlots.length === 0) return;

    const minChunks = Math.ceil(targetTenths / 30);
    const maxChunks = Math.max(1, Math.floor(targetTenths / 5));
    const desiredChunks = Math.round(targetTenths / 21);
    const k = Math.min(
      eligibleSlots.length,
      Math.max(minChunks, Math.min(maxChunks, desiredChunks))
    );

    const baseTenths = Math.floor(targetTenths / k);
    const remTenths = targetTenths % k;
    const chunkTenthsList: number[] = Array.from({ length: k }, (_, idx) =>
      idx < remTenths ? baseTenths + 1 : baseTenths
    );

    if (
      k >= 2 &&
      chunkTenthsList[0] + 1 <= 30 &&
      chunkTenthsList[k - 1] - 1 >= 5 &&
      chunkTenthsList[0] === chunkTenthsList[k - 1]
    ) {
      chunkTenthsList[0] += 1;
      chunkTenthsList[k - 1] -= 1;
    }

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

  for (const [dateStr, totalTenths] of teamDayTenths.entries()) {
    if (totalTenths > 120) {
      const scale = 120 / totalTenths;
      const dayChunks = draftChunks.filter((c) => c.slot.dateStr === dateStr);
      dayChunks.forEach((c) => {
        c.tenths = Math.max(5, Math.floor(c.tenths * scale));
      });
    }
  }

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

  const check5Passed = tasks.every((t) => teamIds.has(t.assigneeId));
  checks.push({
    id: 'assignees-exist',
    label: 'Task assignees exist in team',
    passed: check5Passed,
    details: check5Passed
      ? 'All task assignees map to valid team members.'
      : 'Unassigned or unknown team member IDs found on tasks.',
  });

  const check6Passed = events.every((e) => e.attendeeIds.every((attId) => teamIds.has(attId)));
  checks.push({
    id: 'event-attendees-valid',
    label: 'Event attendees exist in team',
    passed: check6Passed,
    details: check6Passed
      ? 'All event attendee IDs exist in team.'
      : 'Invalid event attendee IDs found.',
  });

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

  return report;
}
