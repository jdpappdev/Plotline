import type { CalendarEvent, Project } from '../types';
import { getIsoDateOffset } from '../../lib/dates';

const DEADLINE_START_TIME = '17:00';
const DEADLINE_END_TIME = '18:00';
const DEADLINE_LOCATION = 'Project Milestone';

const ALL_TEAM_IDS = [
  'usr-soren',
  'usr-mireia',
  'usr-tarek',
  'usr-kaelen',
  'usr-nadia',
  'usr-juno',
  'usr-jade',
];

export function createProjectDeadlineEvents(projects: Project[]): CalendarEvent[] {
  return projects.map((p) => ({
    id: `evt-dl-${p.id}`,
    title: `Deadline: ${p.name}`,
    category: 'Deadline',
    projectId: p.id,
    date: p.targetDate,
    startTime: DEADLINE_START_TIME,
    endTime: DEADLINE_END_TIME,
    attendeeIds: [p.leadId],
    location: DEADLINE_LOCATION,
  }));
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
      attendeeIds: ALL_TEAM_IDS,
      location: 'Main Lounge',
    },
    {
      id: 'evt-9',
      title: 'daily standup',
      category: 'Team',
      date: getIsoDateOffset(0),
      startTime: '09:30',
      endTime: '09:45',
      attendeeIds: ALL_TEAM_IDS,
      location: 'Standup Circle',
    },
  ];

  return [...manualEvents, ...createProjectDeadlineEvents(projects)];
}
