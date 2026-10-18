import React from 'react';
import type { CalendarEvent, WeekStart } from '../../domain/types';
import { toIsoDateString } from '../../lib/dates';
import { categoryChipClasses } from '../../lib/theme';

interface CalendarMonthGridProps {
  year: number;
  monthIndex: number;
  weekStart: WeekStart;
  todayIso: string;
  selectedDate: string;
  eventsByDate: Map<string, CalendarEvent[]>;
  onSelectDate: (isoDate: string) => void;
  onSelectEventForEdit: (event: CalendarEvent) => void;
}

const WEEKDAYS_MONDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_SUNDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TOTAL_GRID_CELLS = 42;

export const CalendarMonthGrid: React.FC<CalendarMonthGridProps> = ({
  year,
  monthIndex,
  weekStart,
  todayIso,
  selectedDate,
  eventsByDate,
  onSelectDate,
  onSelectEventForEdit,
}) => {
  const weekdayHeaders = weekStart === 'sunday' ? WEEKDAYS_SUNDAY : WEEKDAYS_MONDAY;
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const leadingOffset =
    weekStart === 'sunday' ? firstDayOfMonth : (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells = Array.from({ length: TOTAL_GRID_CELLS }, (_, idx) => {
    const dayOffset = idx - leadingOffset + 1;
    const cellDate = new Date(year, monthIndex, dayOffset);
    const iso = toIsoDateString(
      cellDate.getFullYear(),
      cellDate.getMonth(),
      cellDate.getDate()
    );
    const inCurrentMonth = dayOffset >= 1 && dayOffset <= daysInMonth;
    return {
      iso,
      dayNumber: cellDate.getDate(),
      inCurrentMonth,
      isToday: iso === todayIso,
      isSelected: iso === selectedDate,
      events: eventsByDate.get(iso) || [],
    };
  });

  return (
    <div className="col-span-12 lg:col-span-8 bento-card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
        {weekdayHeaders.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {cells.map((cell) => (
          <div
            key={cell.iso}
            onClick={() => onSelectDate(cell.iso)}
            className={`min-h-[98px] p-2 transition-colors cursor-pointer flex flex-col justify-between ${
              cell.isSelected
                ? 'bg-[var(--accent-soft)]/50'
                : cell.inCurrentMonth
                ? 'bg-white hover:bg-slate-50/80'
                : 'bg-slate-50/40 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-full text-[11px] font-mono-tabular font-bold inline-flex items-center justify-center ${
                  cell.isToday
                    ? 'bg-[var(--accent)] text-white shadow-2xs'
                    : cell.isSelected
                    ? 'text-[var(--accent)] font-extrabold'
                    : cell.inCurrentMonth
                    ? 'text-slate-700'
                    : 'text-slate-300'
                }`}
              >
                {cell.dayNumber}
              </span>
              {cell.events.length > 0 && (
                <span className="text-[9px] font-mono-tabular font-bold text-slate-400">
                  {cell.events.length}
                </span>
              )}
            </div>

            <div className="space-y-1 mt-1">
              {cell.events.slice(0, 2).map((evt) => {
                const { chipClass, dotClass } = categoryChipClasses(evt.category);
                return (
                  <div
                    key={evt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(cell.iso);
                      onSelectEventForEdit(evt);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border flex items-center gap-1 ${chipClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                    <span className="truncate">{evt.title}</span>
                  </div>
                );
              })}
              {cell.events.length > 2 && (
                <div className="text-[9px] font-bold text-slate-400 pl-1">
                  +{cell.events.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
