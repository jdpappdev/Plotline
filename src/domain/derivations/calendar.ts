import { CalendarEvent, EventCategory, Project } from '../types';
import { getNow, getTodayIsoDate } from '../../lib/clock';

export function getNextUpEvent(events: CalendarEvent[], projects: Project[]): CalendarEvent | null {
  const now = getNow();
  const todayIso = getTodayIsoDate();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const deadlineEvents: CalendarEvent[] = projects.map((p) => ({
    id: `evt-dl-${p.id}`,
    title: `Deadline: ${p.name}`,
    category: 'Deadline' as EventCategory,
    projectId: p.id,
    date: p.targetDate,
    startTime: '17:00',
    endTime: '18:00',
    attendeeIds: [p.leadId],
    location: 'Project Milestone',
  }));

  const allEvents = [...events, ...deadlineEvents];

  const upcoming = allEvents.filter((e) => {
    if (e.date > todayIso) return true;
    if (e.date === todayIso && e.startTime >= currentHHMM) return true;
    return false;
  });

  upcoming.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return upcoming[0] || allEvents[0] || null;
}

export function filterCalendarEvents(
  events: CalendarEvent[],
  categoryFilter: 'All' | EventCategory,
  searchQuery: string
): CalendarEvent[] {
  const q = searchQuery.trim().toLowerCase();
  return events.filter((e) => {
    if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      (e.location ? e.location.toLowerCase().includes(q) : false) ||
      e.category.toLowerCase().includes(q)
    );
  });
}

export function computeEventsByDateMap(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const list = map.get(event.date) || [];
    list.push(event);
    map.set(event.date, list);
  }
  return map;
}
