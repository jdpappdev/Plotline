import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { CalendarEvent, EventCategory } from '../../domain/types';
import { computeEventsByDateMap, filterCalendarEvents } from '../../domain/derivations';
import { getTodayIsoDate } from '../../lib/dates';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { CalendarAgendaPanel } from './CalendarAgendaPanel';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { EventEditorDialog } from './EventEditorDialog';

const CATEGORIES: Array<'All' | EventCategory> = [
  'All',
  'Meeting',
  'Team',
  'Review',
  'Deadline',
  'Social',
];

export const CalendarScreen: React.FC = () => {
  const events = useWorkspaceStore((s) => s.events);
  const team = useWorkspaceStore((s) => s.team);
  const currentUser = useWorkspaceStore((s) => s.currentUser);
  const weekStart = useWorkspaceStore((s) => s.weekStart);
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const checkedInEventIds = useWorkspaceStore((s) => s.checkedInEventIds);
  const addEvent = useWorkspaceStore((s) => s.addEvent);
  const updateEvent = useWorkspaceStore((s) => s.updateEvent);
  const deleteEvent = useWorkspaceStore((s) => s.deleteEvent);
  const toggleEventCheckIn = useWorkspaceStore((s) => s.toggleEventCheckIn);

  const todayIso = getTodayIsoDate();
  const initialDateObj = new Date();
  const [viewYear, setViewYear] = useState(initialDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDateObj.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [categoryFilter, setCategoryFilter] = useState<'All' | EventCategory>('All');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const filteredEvents = useMemo(
    () => filterCalendarEvents(events, categoryFilter, searchQuery),
    [events, categoryFilter, searchQuery]
  );

  const eventsByDate = useMemo(
    () => computeEventsByDateMap(filteredEvents),
    [filteredEvents]
  );

  const selectedDayEvents = eventsByDate.get(selectedDate) || [];

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

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

  const handleJumpToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(todayIso);
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Calendar
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Studio reviews, project milestones, and team critiques.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingEvent(null);
            setEditorOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-white rounded-full border border-slate-200 p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-[13px] font-bold text-slate-900 min-w-[140px] text-center">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleJumpToday}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-[12px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Today
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                  active
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <CalendarMonthGrid
          year={viewYear}
          monthIndex={viewMonth}
          weekStart={weekStart}
          todayIso={todayIso}
          selectedDate={selectedDate}
          eventsByDate={eventsByDate}
          onSelectDate={setSelectedDate}
          onSelectEventForEdit={(evt) => {
            setEditingEvent(evt);
            setEditorOpen(true);
          }}
        />

        <CalendarAgendaPanel
          selectedDate={selectedDate}
          todayIso={todayIso}
          events={selectedDayEvents}
          team={team}
          checkedInEventIds={checkedInEventIds}
          onToggleCheckIn={toggleEventCheckIn}
          onEditEvent={(evt) => {
            setEditingEvent(evt);
            setEditorOpen(true);
          }}
          onDeleteEvent={deleteEvent}
          onOpenNewEvent={() => {
            setEditingEvent(null);
            setEditorOpen(true);
          }}
        />
      </div>

      <EventEditorDialog
        open={editorOpen}
        editingEvent={editingEvent}
        defaultDate={selectedDate}
        team={team}
        currentUserId={currentUser.id}
        onClose={() => setEditorOpen(false)}
        onSaveNew={addEvent}
        onSaveUpdate={updateEvent}
      />
    </div>
  );
};
