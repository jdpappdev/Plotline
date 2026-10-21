import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import { CalendarEvent, TeamMember } from '../../domain/types';
import { ContourGlyph } from '../../utils/contourGlyph';
import { pluralize } from '../../utils/string';
import { DeleteButton } from '../DeleteButton';
import { categoryChipStyles, formatDateBadge, formatFullAgendaHeading } from './types';

export interface CalendarAgendaPanelProps {
  selectedDateIso: string;
  todayIso: string;
  selectedDayEvents: CalendarEvent[];
  comingUpEvents: CalendarEvent[];
  teamMap: Map<string, TeamMember>;
  onNewEvent: (dateIso: string) => void;
  onEditEvent: (evt: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export function CalendarAgendaPanel({
  selectedDateIso,
  todayIso,
  selectedDayEvents,
  comingUpEvents,
  teamMap,
  onNewEvent,
  onEditEvent,
  onDeleteEvent,
}: CalendarAgendaPanelProps) {
  return (
    <aside
      style={{ '--stagger-index': 2 } as React.CSSProperties}
      className="plotline-enter xl:col-span-4 space-y-4"
    >
      {/* Selected Day's Agenda Card */}
      <div
        data-testid="calendar-selected-day-agenda"
        className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 space-y-3"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2.5 gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
              {formatFullAgendaHeading(selectedDateIso)}
            </h2>
            <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
              {selectedDateIso} · {pluralize(selectedDayEvents.length, 'session')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNewEvent(selectedDateIso)}
              style={{ color: 'var(--accent)' }}
              className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-full text-xs font-semibold bg-[var(--accent-soft)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <CalendarIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
          </div>
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
            <ContourGlyph seed={`calendar-empty-${selectedDateIso}`} size={40} />
            <p className="text-xs text-[var(--ink-secondary)]">
              {selectedDateIso === todayIso
                ? 'No events scheduled for today.'
                : `No events scheduled for ${selectedDateIso}.`}
            </p>
            <button
              type="button"
              onClick={() => onNewEvent(selectedDateIso)}
              style={{ color: 'var(--accent)' }}
              className="min-h-[44px] sm:min-h-0 px-3 py-1.5 text-xs font-semibold hover:underline cursor-pointer"
            >
              + Schedule an event
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDayEvents.map((evt) => {
              const chip = categoryChipStyles(evt.category);
              return (
                <div
                  key={evt.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onEditEvent(evt)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onEditEvent(evt);
                    }
                  }}
                  className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] transition-colors cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)] leading-snug">
                      {evt.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        style={{
                          backgroundColor: chip.bg,
                          color: chip.fg,
                          borderColor: chip.border,
                        }}
                        className="px-2 py-0.5 rounded-[var(--radius-xs)] border text-[10px] font-semibold"
                      >
                        {evt.category || 'Meeting'}
                      </span>
                      <DeleteButton name={evt.title} onDelete={() => onDeleteEvent(evt.id)} />
                    </div>
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
          <h2 className="text-sm font-semibold text-[var(--ink-primary)]">Coming up</h2>
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
              onClick={() => onNewEvent(todayIso)}
              style={{ color: 'var(--accent)' }}
              className="min-h-[44px] sm:min-h-0 px-3 py-1.5 text-xs font-semibold hover:underline cursor-pointer"
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
                  onClick={() => onEditEvent(evt)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onEditEvent(evt);
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
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          style={{
                            backgroundColor: chip.bg,
                            color: chip.fg,
                            borderColor: chip.border,
                          }}
                          className="px-1.5 py-0.5 rounded-[var(--radius-xs)] border text-[9px] font-semibold"
                        >
                          {evt.category || 'Meeting'}
                        </span>
                        <DeleteButton name={evt.title} onDelete={() => onDeleteEvent(evt.id)} />
                      </div>
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
  );
}
