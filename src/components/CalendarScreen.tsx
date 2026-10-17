import React, { useMemo, useRef, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  CalendarEvent,
  EventCategory,
  getTodayIsoDate,
  TeamMember,
  usePlotlineStore,
} from '../store';
import { ContourGlyph } from '../utils/contourGlyph';

const EVENT_CATEGORIES: EventCategory[] = [
  'Meeting',
  'Team',
  'Review',
  'Deadline',
  'Social',
];

export function categoryChipStyles(category: EventCategory | undefined): {
  bg: string;
  fg: string;
  border: string;
  dot: string;
} {
  switch (category) {
    case 'Meeting':
      return {
        bg: 'var(--accent-soft)',
        fg: 'var(--accent)',
        border: 'var(--accent-border)',
        dot: 'var(--accent)',
      };
    case 'Team':
      return {
        bg: '#E8F4EC',
        fg: '#216E3E',
        border: '#B5DFC4',
        dot: '#216E3E',
      };
    case 'Review':
      return {
        bg: '#FEF5E6',
        fg: '#9B5B0B',
        border: '#F5D69E',
        dot: '#B86B14',
      };
    case 'Deadline':
      return {
        bg: '#FBECEE',
        fg: '#B43342',
        border: '#F1B9C0',
        dot: '#C9352B',
      };
    case 'Social':
    default:
      return {
        bg: '#EEEBF9',
        fg: '#5B43B8',
        border: '#BEB2EB',
        dot: '#5B43B8',
      };
  }
}

function toIsoDateString(year: number, monthIndex: number, day: number): string {
  const d = new Date(year, monthIndex, day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
}

function formatDateBadge(isoDate: string): { monthShort: string; dayNum: string } {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return { monthShort: 'OCT', dayNum: '01' };
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(d.getTime())) return { monthShort: 'OCT', dayNum: '01' };
  return {
    monthShort: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    dayNum: String(d.getDate()).padStart(2, '0'),
  };
}

export default function CalendarScreen() {
  const {
    events,
    team,
    weekStart,
    currentUser,
    addEvent,
    updateEvent,
    deleteEvent,
  } = usePlotlineStore();

  const todayIso = getTodayIsoDate();
  const initialDateParts = todayIso.split('-').map(Number);

  const [viewYear, setViewYear] = useState<number>(initialDateParts[0] || 2026);
  const [viewMonth, setViewMonth] = useState<number>((initialDateParts[1] || 10) - 1);
  const [expandedDayIso, setExpandedDayIso] = useState<string | null>(null);

  // Modal State (handles both "New event" and "Edit/Delete event")
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState<EventCategory>('Meeting');
  const [evtDate, setEvtDate] = useState(todayIso);
  const [evtStart, setEvtStart] = useState('10:00');
  const [evtEnd, setEvtEnd] = useState('11:00');
  const [evtLocation, setEvtLocation] = useState('Room 04 · Cartography Lab');
  const [evtAttendees, setEvtAttendees] = useState<string[]>([currentUser.id]);
  const [formError, setFormError] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const teamMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    for (const m of team) {
      map.set(m.id, m);
    }
    return map;
  }, [team]);

  const weekdayHeaders = useMemo(() => {
    return weekStart === 'monday'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }, [weekStart]);

  // Build 42-cell month grid respecting weekStart
  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const rawFirstWeekday = firstOfMonth.getDay(); // 0 (Sun) .. 6 (Sat)
    const leadingOffset =
      weekStart === 'monday' ? (rawFirstWeekday + 6) % 7 : rawFirstWeekday;

    const cells: Array<{
      iso: string;
      dayNumber: number;
      inCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    for (let i = 0; i < 42; i++) {
      const dayOffset = i - leadingOffset + 1;
      const cellDate = new Date(viewYear, viewMonth, dayOffset);
      const iso = toIsoDateString(
        cellDate.getFullYear(),
        cellDate.getMonth(),
        cellDate.getDate()
      );
      cells.push({
        iso,
        dayNumber: cellDate.getDate(),
        inCurrentMonth: cellDate.getMonth() === viewMonth,
        isToday: iso === todayIso,
      });
    }

    return cells;
  }, [viewYear, viewMonth, weekStart, todayIso]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const evt of events) {
      const list = map.get(evt.date) || [];
      list.push(evt);
      map.set(evt.date, list);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
      map.set(k, list);
    }
    return map;
  }, [events]);

  const todayEvents = useMemo(
    () => eventsByDate.get(todayIso) || [],
    [eventsByDate, todayIso]
  );

  const comingUpEvents = useMemo(() => {
    return [...events]
      .filter((e) => e.date > todayIso)
      .sort((a, b) =>
        a.date === b.date
          ? a.startTime.localeCompare(b.startTime)
          : a.date.localeCompare(b.date)
      )
      .slice(0, 6);
  }, [events, todayIso]);

  const monthTitle = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const parts = todayIso.split('-').map(Number);
    setViewYear(parts[0]);
    setViewMonth(parts[1] - 1);
  };

  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const savingEventRef = useRef(false);

  const openNewEventModal = (dateIso: string) => {
    savingEventRef.current = false;
    setIsSavingEvent(false);
    setEditingEventId(null);
    setEvtTitle('');
    setEvtCategory('Meeting');
    setEvtDate(dateIso);
    setEvtStart('10:00');
    setEvtEnd('11:00');
    setEvtLocation('Room 04 · Cartography Lab');
    setEvtAttendees([currentUser.id]);
    setFormError('');
    setModalOpen(true);
    setTimeout(() => titleInputRef.current?.focus(), 30);
  };

  const openEditEventModal = (evt: CalendarEvent) => {
    savingEventRef.current = false;
    setIsSavingEvent(false);
    setEditingEventId(evt.id);
    setEvtTitle(evt.title);
    setEvtCategory(evt.category || 'Meeting');
    setEvtDate(evt.date);
    setEvtStart(evt.startTime);
    setEvtEnd(evt.endTime);
    setEvtLocation(evt.location || 'Studio Room 01');
    setEvtAttendees(evt.attendeeIds.length > 0 ? evt.attendeeIds : [currentUser.id]);
    setFormError('');
    setModalOpen(true);
    setTimeout(() => titleInputRef.current?.focus(), 30);
  };

  const toggleAttendee = (memberId: string) => {
    setEvtAttendees((prev) =>
      prev.includes(memberId)
        ? prev.length > 1
          ? prev.filter((id) => id !== memberId)
          : prev
        : [...prev, memberId]
    );
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (savingEventRef.current || isSavingEvent) return;
    if (!evtTitle.trim()) {
      setFormError('Event title is required.');
      return;
    }
    if (!evtDate) {
      setFormError('Date is required.');
      return;
    }
    if (evtStart && evtEnd && evtEnd < evtStart) {
      setFormError('End time must be after start time.');
      return;
    }

    savingEventRef.current = true;
    setIsSavingEvent(true);

    if (editingEventId) {
      updateEvent(editingEventId, {
        title: evtTitle.trim(),
        category: evtCategory,
        date: evtDate,
        startTime: evtStart,
        endTime: evtEnd,
        attendeeIds: evtAttendees,
        location: evtLocation.trim() || 'Studio Room 01',
      });
    } else {
      const newId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      addEvent({
        id: newId,
        title: evtTitle.trim(),
        category: evtCategory,
        date: evtDate,
        startTime: evtStart,
        endTime: evtEnd,
        attendeeIds: evtAttendees,
        location: evtLocation.trim() || 'Studio Room 01',
      });
    }

    setModalOpen(false);
    setIsSavingEvent(false);
    savingEventRef.current = false;
  };

  const handleDeleteCurrentEvent = () => {
    if (!editingEventId) return;
    deleteEvent(editingEventId);
    setModalOpen(false);
  };

  return (
    <div className="max-w-[1360px] mx-auto space-y-4 pb-6 min-w-0">
      {/* Header Row */}
      <div
        style={{ '--stagger-index': 0 } as React.CSSProperties}
        className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
            Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5">
            Meetings, reviews and deadlines across the team
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleGoToday}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-full p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-full text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span
              data-testid="calendar-month-label"
              className="px-3 text-xs sm:text-sm font-semibold text-[var(--ink-primary)] min-w-[132px] text-center"
            >
              {monthTitle}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-full text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => openNewEventModal(todayIso)}
            style={{ backgroundColor: 'var(--accent)' }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>New event</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Month Grid (Cols 1-8) + Right Agenda Panel (Cols 9-12) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Month Grid (8 cols) */}
        <section
          aria-label="Month calendar grid"
          style={{ '--stagger-index': 1 } as React.CSSProperties}
          className="plotline-enter xl:col-span-8 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] overflow-hidden"
        >
          {/* Weekday Headers */}
          <div
            data-testid="calendar-weekday-headers"
            className="grid grid-cols-7 border-b border-[var(--border-hairline)] bg-[var(--surface-sunken)]/60"
          >
            {weekdayHeaders.map((dayName) => (
              <div
                key={dayName}
                className="py-2.5 px-2 text-center text-xs font-semibold text-[var(--ink-secondary)]"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* 6x7 Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border-hairline)]">
            {calendarDays.map((cell) => {
              const dayEvents = eventsByDate.get(cell.iso) || [];
              const isExpanded = expandedDayIso === cell.iso;
              const maxVisible = isExpanded ? dayEvents.length : 2;
              const visibleEvents = dayEvents.slice(0, maxVisible);
              const overflowCount = Math.max(0, dayEvents.length - maxVisible);

              return (
                <div
                  key={cell.iso}
                  data-testid={`calendar-day-${cell.iso}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${cell.iso}, ${dayEvents.length} events. Activate to schedule event.`}
                  onClick={() => openNewEventModal(cell.iso)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openNewEventModal(cell.iso);
                    }
                  }}
                  className={`min-h-[104px] min-w-0 overflow-hidden p-1 sm:p-1.5 flex flex-col justify-between transition-colors cursor-pointer group ${
                    cell.inCurrentMonth
                      ? 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-sunken)]/45'
                      : 'bg-[var(--surface-canvas)]/60 text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)]/45'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <span
                      style={
                        cell.isToday
                          ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                          : undefined
                      }
                      className={`w-6 h-6 rounded-full text-xs font-ui-tabular flex items-center justify-center shrink-0 ${
                        cell.isToday
                          ? 'font-bold'
                          : cell.inCurrentMonth
                          ? 'font-medium text-[var(--ink-primary)]'
                          : 'text-[var(--ink-muted)]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    <span className="hidden sm:inline opacity-0 group-hover:opacity-100 text-[10px] text-[var(--ink-muted)] px-1 truncate">
                      + Add
                    </span>
                  </div>

                  {/* Category-colored Event Chips */}
                  <div className="mt-1 space-y-1 flex-1 min-w-0">
                    {visibleEvents.map((evt) => {
                      const chip = categoryChipStyles(evt.category);
                      return (
                        <button
                          key={evt.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEventModal(evt);
                          }}
                          style={{
                            backgroundColor: chip.bg,
                            color: chip.fg,
                            borderColor: chip.border,
                          }}
                          className="w-full text-left px-1.5 py-0.5 rounded-[var(--radius-xs)] border text-[10px] font-semibold truncate block hover:opacity-90 cursor-pointer"
                          title={`${evt.startTime} · ${evt.title} (${evt.category || 'Meeting'})`}
                        >
                          <span className="font-ui-tabular opacity-80 mr-1">
                            {evt.startTime}
                          </span>
                          <span>{evt.title}</span>
                        </button>
                      );
                    })}

                    {overflowCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDayIso(cell.iso);
                        }}
                        className="w-full text-left px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-sunken)] text-[10px] font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
                      >
                        +{overflowCount} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Panel: Today's Agenda + Coming Up (4 cols) */}
        <aside
          style={{ '--stagger-index': 2 } as React.CSSProperties}
          className="plotline-enter xl:col-span-4 space-y-4"
        >
          {/* Today's Agenda Card */}
          <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2.5">
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
                  Today's Agenda
                </h2>
                <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                  {todayIso} · {todayEvents.length}{' '}
                  {todayEvents.length === 1 ? 'session' : 'sessions'}
                </p>
              </div>
              <CalendarIcon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </div>

            {todayEvents.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
                <ContourGlyph seed="calendar-today-empty" size={40} />
                <p className="text-xs text-[var(--ink-secondary)]">
                  No events scheduled for today.
                </p>
                <button
                  type="button"
                  onClick={() => openNewEventModal(todayIso)}
                  style={{ color: 'var(--accent)' }}
                  className="text-xs font-semibold hover:underline cursor-pointer"
                >
                  + Schedule an event
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayEvents.map((evt) => {
                  const chip = categoryChipStyles(evt.category);
                  return (
                    <div
                      key={evt.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openEditEventModal(evt)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openEditEventModal(evt);
                        }
                      }}
                      className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)] leading-snug">
                          {evt.title}
                        </h3>
                        <span
                          style={{
                            backgroundColor: chip.bg,
                            color: chip.fg,
                            borderColor: chip.border,
                          }}
                          className="px-2 py-0.5 rounded-[var(--radius-xs)] border text-[10px] font-semibold shrink-0"
                        >
                          {evt.category || 'Meeting'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--ink-secondary)]">
                        <span className="inline-flex items-center gap-1 font-ui-tabular">
                          <Clock className="w-3 h-3 text-[var(--ink-muted)]" />
                          <span>
                            {evt.startTime} – {evt.endTime}
                          </span>
                        </span>

                        {/* Attendee Avatars */}
                        <div className="flex items-center -space-x-1.5 shrink-0">
                          {evt.attendeeIds.slice(0, 4).map((id) => {
                            const member = teamMap.get(id);
                            if (!member) return null;
                            return (
                              <span
                                key={id}
                                title={member.name}
                                style={{ backgroundColor: 'var(--accent)' }}
                                className="w-5 h-5 rounded-full border border-[var(--surface-elevated)] flex items-center justify-center text-[9px] font-semibold text-white"
                              >
                                {member.initials}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {evt.location && (
                        <p className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coming Up Card */}
          <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2.5">
              <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
                Coming up
              </h2>
              <span className="text-[11px] text-[var(--ink-muted)]">Next milestones</span>
            </div>

            {comingUpEvents.length === 0 ? (
              <div className="py-5 flex flex-col items-center justify-center text-center gap-2">
                <ContourGlyph seed="calendar-upcoming-empty" size={38} />
                <p className="text-xs text-[var(--ink-secondary)]">
                  No upcoming events on the horizon.
                </p>
                <button
                  type="button"
                  onClick={() => openNewEventModal(todayIso)}
                  style={{ color: 'var(--accent)' }}
                  className="text-xs font-semibold hover:underline cursor-pointer"
                >
                  + Schedule an event
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {comingUpEvents.map((evt) => {
                  const badge = formatDateBadge(evt.date);
                  const chip = categoryChipStyles(evt.category);
                  return (
                    <div
                      key={evt.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openEditEventModal(evt)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openEditEventModal(evt);
                        }
                      }}
                      className="p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] transition-colors cursor-pointer flex items-center gap-3"
                    >
                      {/* Date Badge */}
                      <div className="w-11 h-11 rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] border border-[var(--border-hairline)] flex flex-col items-center justify-center shrink-0">
                        <span
                          className="text-[9px] font-bold tracking-wider"
                          style={{ color: 'var(--accent)' }}
                        >
                          {badge.monthShort}
                        </span>
                        <span className="text-sm font-bold font-ui-tabular text-[var(--ink-primary)] leading-none mt-0.5">
                          {badge.dayNum}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-semibold text-[var(--ink-primary)] truncate">
                            {evt.title}
                          </p>
                          <span
                            style={{
                              backgroundColor: chip.bg,
                              color: chip.fg,
                              borderColor: chip.border,
                            }}
                            className="px-1.5 py-0.5 rounded-[var(--radius-xs)] border text-[9px] font-semibold shrink-0"
                          >
                            {evt.category || 'Meeting'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[var(--ink-muted)]">
                          <span className="font-ui-tabular">
                            {evt.startTime} – {evt.endTime}
                          </span>
                          <div className="flex items-center -space-x-1 shrink-0">
                            {evt.attendeeIds.slice(0, 3).map((id) => {
                              const member = teamMap.get(id);
                              if (!member) return null;
                              return (
                                <span
                                  key={id}
                                  title={member.name}
                                  style={{ backgroundColor: 'var(--accent)' }}
                                  className="w-4 h-4 rounded-full border border-[var(--surface-elevated)] flex items-center justify-center text-[8px] font-semibold text-white"
                                >
                                  {member.initials}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* New / Edit Event Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-event-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 shadow-lg space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-hairline)] pb-3">
              <div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--accent)' }}
                >
                  {editingEventId ? 'Modify Schedule' : 'Schedule Dispatch'}
                </span>
                <h2
                  id="calendar-event-modal-title"
                  className="text-lg font-semibold text-[var(--ink-primary)] mt-0.5"
                >
                  {editingEventId ? 'Edit event' : 'New event'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-[var(--radius-sm)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5" noValidate>
              <div>
                <label
                  htmlFor="calendar-event-title"
                  className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
                >
                  Event title <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  ref={titleInputRef}
                  id="calendar-event-title"
                  type="text"
                  required
                  value={evtTitle}
                  onChange={(e) => {
                    setEvtTitle(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="e.g. Sub-bottom Sonar Calibration Review"
                  className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="calendar-event-category"
                    className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="calendar-event-category"
                    value={evtCategory}
                    onChange={(e) => setEvtCategory(e.target.value as EventCategory)}
                    className="w-full h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="calendar-event-date"
                    className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
                  >
                    Date <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <input
                    id="calendar-event-date"
                    type="date"
                    required
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="calendar-event-start"
                    className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
                  >
                    Start time
                  </label>
                  <input
                    id="calendar-event-start"
                    type="time"
                    value={evtStart}
                    onChange={(e) => setEvtStart(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calendar-event-end"
                    className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
                  >
                    End time
                  </label>
                  <input
                    id="calendar-event-end"
                    type="time"
                    value={evtEnd}
                    onChange={(e) => setEvtEnd(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="calendar-event-location"
                  className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
                >
                  Location
                </label>
                <input
                  id="calendar-event-location"
                  type="text"
                  value={evtLocation}
                  onChange={(e) => setEvtLocation(e.target.value)}
                  placeholder="e.g. Room 04 · Cartography Lab"
                  className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-2 focus:outline-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1.5">
                  Attendees
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {team.map((member) => {
                    const selected = evtAttendees.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleAttendee(member.id)}
                        aria-pressed={selected}
                        style={
                          selected
                            ? {
                                backgroundColor: 'var(--accent-soft)',
                                color: 'var(--accent)',
                                borderColor: 'var(--accent-border)',
                              }
                            : undefined
                        }
                        className={`px-2.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                          selected
                            ? 'font-semibold'
                            : 'bg-[var(--surface-sunken)] border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                        }`}
                      >
                        <span>{member.initials}</span>
                        <span>{member.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-[var(--status-critical)]">
                  {formError}
                </p>
              )}

              <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between gap-2">
                {editingEventId ? (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentEvent}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-[#C9352B] hover:bg-[#FBECEE] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEvent}
                    style={{ backgroundColor: 'var(--accent)' }}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSavingEvent
                      ? 'Saving…'
                      : editingEventId
                      ? 'Save changes'
                      : 'Create event'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
