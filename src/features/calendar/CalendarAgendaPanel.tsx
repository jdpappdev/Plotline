import React from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Edit3, MapPin, Plus, Video } from 'lucide-react';
import type { CalendarEvent, TeamMember } from '../../domain/types';
import { formatFullAgendaHeading } from '../../lib/format';
import { DeleteButton } from '../../ui/DeleteButton';
import { EventCategoryChip } from '../../ui/StatusChips';

interface CalendarAgendaPanelProps {
  selectedDate: string;
  todayIso: string;
  events: CalendarEvent[];
  team: TeamMember[];
  checkedInEventIds: string[];
  onToggleCheckIn: (eventId: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onOpenNewEvent: () => void;
}

export const CalendarAgendaPanel: React.FC<CalendarAgendaPanelProps> = ({
  selectedDate,
  todayIso,
  events,
  team,
  checkedInEventIds,
  onToggleCheckIn,
  onEditEvent,
  onDeleteEvent,
  onOpenNewEvent,
}) => {
  const heading = formatFullAgendaHeading(selectedDate, todayIso);

  return (
    <div className="col-span-12 lg:col-span-4 bento-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">{heading}</h2>
            <p className="text-[11px] text-slate-500 font-mono-tabular mt-0.5">
              {selectedDate} · {events.length} scheduled
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewEvent}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        <div className="space-y-3">
          {events.map((evt) => {
            const isCheckedIn = checkedInEventIds.includes(evt.id);
            return (
              <div
                key={evt.id}
                className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <EventCategoryChip category={evt.category} />
                    <h3 className="text-[14px] font-bold text-slate-900 mt-1.5 leading-snug">
                      {evt.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditEvent(evt)}
                      aria-label={`Edit ${evt.title}`}
                      className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <DeleteButton
                      label={`Delete event ${evt.title}`}
                      onConfirm={() => onDeleteEvent(evt.id)}
                    />
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 font-mono-tabular">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {evt.startTime} – {evt.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.location}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {evt.attendeeIds.map((attId) => {
                      const member = team.find((m) => m.id === attId);
                      if (!member) return null;
                      return (
                        <span
                          key={attId}
                          title={member.name}
                          className="w-6 h-6 rounded-full bg-slate-800 text-white text-[9px] font-bold inline-flex items-center justify-center ring-2 ring-white"
                        >
                          {member.initials}
                        </span>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleCheckIn(evt.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      isCheckedIn
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isCheckedIn ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Checked In</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Join</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl">
              <CalendarIcon className="w-7 h-7 text-slate-300 mx-auto mb-2 stroke-1" />
              <p className="text-[12px] font-semibold text-slate-600">No events on this day</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select another date or schedule a session.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
