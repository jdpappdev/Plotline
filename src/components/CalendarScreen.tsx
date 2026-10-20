import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { usePlotlineStore } from '../store';
import { CalendarEvent, EventCategory, TeamMember } from '../domain/types';
import { getNowTimestamp, getTodayIsoDate } from '../lib/clock';
import { CalendarMonthGrid } from './calendar/CalendarMonthGrid';
import { CalendarAgendaPanel } from './calendar/CalendarAgendaPanel';
import { CalendarEventDialog } from './calendar/CalendarEventDialog';
import { CalendarDayCell, categoryChipStyles } from './calendar/types';

export { categoryChipStyles };

function toIsoDateString(year: number, monthIndex: number, day: number): string {
  const d = new Date(year, monthIndex, day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
}

export default function CalendarScreen() {
  const { events, team, weekStart, currentUser, addEvent, updateEvent, deleteEvent } =
    usePlotlineStore();

  const todayIso = getTodayIsoDate();
  const initialDateParts = todayIso.split('-').map(Number);

  const [viewYear, setViewYear] = useState<number>(initialDateParts[0] || 2026);
  const [viewMonth, setViewMonth] = useState<number>((initialDateParts[1] || 10) - 1);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
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
    const leadingOffset = weekStart === 'monday' ? (rawFirstWeekday + 6) % 7 : rawFirstWeekday;

    const cells: CalendarDayCell[] = [];

    for (let i = 0; i < 42; i++) {
      const dayOffset = i - leadingOffset + 1;
      const cellDate = new Date(viewYear, viewMonth, dayOffset);
      const iso = toIsoDateString(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
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

  const selectedDayEvents = useMemo(
    () => eventsByDate.get(selectedDateIso) || [],
    [eventsByDate, selectedDateIso]
  );

  const comingUpEvents = useMemo(() => {
    return [...events]
      .filter((e) => e.date > todayIso)
      .sort((a, b) =>
        a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)
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
    setSelectedDateIso(todayIso);
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
      const newId = `evt-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;
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

    setSelectedDateIso(evtDate);
    setModalOpen(false);
    setIsSavingEvent(false);
    savingEventRef.current = false;
  };

  const handleDeleteCurrentEvent = () => {
    if (!editingEventId) return;
    deleteEvent(editingEventId);
    setModalOpen(false);
  };

  const handleDayCellClick = (iso: string) => {
    setSelectedDateIso(iso);
    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
      openNewEventModal(iso);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto space-y-4 pb-6 min-w-0">
      {/* Header Row */}
      <div
        style={{ '--stagger-index': 0 } as React.CSSProperties}
        className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">Calendar</h1>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5">
            Meetings, reviews and deadlines across the team
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleGoToday}
            className="px-3.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-full p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-10 h-10 sm:w-auto sm:h-auto p-1.5 rounded-full flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span
              data-testid="calendar-month-label"
              className="px-2 sm:px-3 text-xs sm:text-sm font-semibold text-[var(--ink-primary)] min-w-[120px] sm:min-w-[132px] text-center"
            >
              {monthTitle}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-10 h-10 sm:w-auto sm:h-auto p-1.5 rounded-full flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => openNewEventModal(selectedDateIso || todayIso)}
            style={{ backgroundColor: 'var(--accent)' }}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>New event</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Month Grid (Cols 1-8) + Right Agenda Panel (Cols 9-12) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <CalendarMonthGrid
          weekdayHeaders={weekdayHeaders}
          calendarDays={calendarDays}
          eventsByDate={eventsByDate}
          selectedDateIso={selectedDateIso}
          expandedDayIso={expandedDayIso}
          onDayCellClick={handleDayCellClick}
          onEditEvent={openEditEventModal}
          onExpandDay={setExpandedDayIso}
        />

        <CalendarAgendaPanel
          selectedDateIso={selectedDateIso}
          todayIso={todayIso}
          selectedDayEvents={selectedDayEvents}
          comingUpEvents={comingUpEvents}
          teamMap={teamMap}
          onNewEvent={openNewEventModal}
          onEditEvent={openEditEventModal}
          onDeleteEvent={deleteEvent}
        />
      </div>

      <CalendarEventDialog
        isOpen={modalOpen}
        editingEventId={editingEventId}
        evtTitle={evtTitle}
        evtCategory={evtCategory}
        evtDate={evtDate}
        evtStart={evtStart}
        evtEnd={evtEnd}
        evtLocation={evtLocation}
        evtAttendees={evtAttendees}
        formError={formError}
        isSavingEvent={isSavingEvent}
        team={team}
        titleInputRef={titleInputRef}
        onClose={() => setModalOpen(false)}
        onTitleChange={(value) => {
          setEvtTitle(value);
          if (formError) setFormError('');
        }}
        onCategoryChange={setEvtCategory}
        onDateChange={setEvtDate}
        onStartChange={setEvtStart}
        onEndChange={setEvtEnd}
        onLocationChange={setEvtLocation}
        onToggleAttendee={toggleAttendee}
        onSaveEvent={handleSaveEvent}
        onDeleteCurrentEvent={handleDeleteCurrentEvent}
      />
    </div>
  );
}
