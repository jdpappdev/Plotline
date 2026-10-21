import React from 'react';
import { CalendarEvent } from '../../domain/types';
import { pluralize } from '../../utils/string';
import { CalendarDayCell, categoryChipStyles } from './types';

export interface CalendarMonthGridProps {
  weekdayHeaders: string[];
  calendarDays: CalendarDayCell[];
  eventsByDate: Map<string, CalendarEvent[]>;
  selectedDateIso: string;
  expandedDayIso: string | null;
  onDayCellClick: (iso: string) => void;
  onEditEvent: (evt: CalendarEvent) => void;
  onExpandDay: (iso: string) => void;
}

export function CalendarMonthGrid({
  weekdayHeaders,
  calendarDays,
  eventsByDate,
  selectedDateIso,
  expandedDayIso,
  onDayCellClick,
  onEditEvent,
  onExpandDay,
}: CalendarMonthGridProps) {
  return (
    <section
      aria-label="Month calendar grid"
      style={{ '--stagger-index': 1 } as React.CSSProperties}
      className="plotline-enter xl:col-span-8 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)]"
    >
      <div className="overflow-hidden rounded-[var(--radius-lg)]">
        {/* Weekday Headers */}
        <div
          data-testid="calendar-weekday-headers"
          className="grid grid-cols-7 border-b border-[var(--border-hairline)] bg-[var(--surface-sunken)]/60"
        >
          {weekdayHeaders.map((dayName) => (
            <div
              key={dayName}
              className="py-2 sm:py-2.5 px-1 sm:px-2 text-center text-[11px] sm:text-xs font-semibold text-[var(--ink-secondary)]"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* 6x7 Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border-hairline)]">
          {calendarDays.map((cell) => {
            const dayEvents = eventsByDate.get(cell.iso) || [];
            const isSelected = selectedDateIso === cell.iso;
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
                aria-pressed={isSelected}
                aria-label={`${cell.iso}, ${pluralize(dayEvents.length, 'event')}.`}
                onClick={() => onDayCellClick(cell.iso)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onDayCellClick(cell.iso);
                  }
                }}
                className={`min-h-[54px] sm:min-h-[104px] min-w-0 overflow-hidden p-1 sm:p-1.5 flex flex-col items-center sm:items-stretch justify-start sm:justify-between transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-[var(--accent-soft)]/55 sm:bg-[var(--surface-elevated)]'
                    : cell.inCurrentMonth
                      ? 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-sunken)]/45'
                      : 'bg-[var(--surface-canvas)]/60 text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)]/45'
                }`}
              >
                <div className="flex items-center justify-center sm:justify-between gap-1 min-w-0 w-full">
                  <span
                    style={
                      cell.isToday
                        ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                        : isSelected
                          ? {
                              backgroundColor: 'var(--accent-soft)',
                              color: 'var(--accent)',
                              border: '1px solid var(--accent)',
                            }
                          : undefined
                    }
                    className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full text-xs font-ui-tabular flex items-center justify-center shrink-0 ${
                      cell.isToday || isSelected
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

                {/* Mobile Compact Colored Dots (<640px) */}
                {dayEvents.length > 0 && (
                  <div
                    data-testid={`calendar-dots-${cell.iso}`}
                    className="flex sm:hidden items-center justify-center gap-1 mt-1.5 flex-wrap max-w-full px-0.5"
                  >
                    {dayEvents.slice(0, 4).map((evt) => {
                      const chip = categoryChipStyles(evt.category);
                      return (
                        <span
                          key={evt.id}
                          style={{ backgroundColor: chip.dot }}
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                        />
                      );
                    })}
                  </div>
                )}

                {/* Tablet/Desktop Category-colored Event Chips (>=640px) */}
                <div className="hidden sm:block mt-1 space-y-1 flex-1 min-w-0 w-full">
                  {visibleEvents.map((evt) => {
                    const chip = categoryChipStyles(evt.category);
                    return (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(evt);
                        }}
                        style={{
                          backgroundColor: chip.bg,
                          color: chip.fg,
                          borderColor: chip.border,
                        }}
                        className="w-full text-left px-1.5 py-0.5 rounded-[var(--radius-xs)] border text-[10px] font-semibold truncate block hover:opacity-90 cursor-pointer"
                        title={`${evt.startTime} · ${evt.title} (${evt.category || 'Meeting'})`}
                      >
                        <span className="font-ui-tabular opacity-80 mr-1">{evt.startTime}</span>
                        <span>{evt.title}</span>
                      </button>
                    );
                  })}

                  {overflowCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpandDay(cell.iso);
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
      </div>
    </section>
  );
}
