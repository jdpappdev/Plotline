import { describe, expect, it } from 'vitest';
import { createSeedEvents, createSeedProjects } from '../../domain/seed';
import { computeEventsByDateMap, filterCalendarEvents, getNextUpEvent } from './calendar';

describe('calendar derivations', () => {
  const projects = createSeedProjects();
  const events = createSeedEvents(projects);

  it('computes calendar events map, filtered events, and next up event', () => {
    const filtered = filterCalendarEvents(events, 'Review', '');
    expect(filtered.length).toBeGreaterThan(0);
    const map = computeEventsByDateMap(events);
    expect(map.size).toBeGreaterThan(0);
    const nextUp = getNextUpEvent(events, projects);
    expect(nextUp).not.toBeNull();
  });
});
