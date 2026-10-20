import React from 'react';
import { Video } from 'lucide-react';
import { CalendarEvent } from '../../domain/types';
import { ContourGlyph } from '../../utils/contourGlyph';

export interface NextUpPanelProps {
  nextEvent: CalendarEvent | undefined;
  isMeetingStarted: boolean;
  onOpenCalendar: () => void;
  onToggleCheckIn: (eventId: string) => void;
}

export function NextUpPanel({
  nextEvent,
  isMeetingStarted,
  onOpenCalendar,
  onToggleCheckIn,
}: NextUpPanelProps) {
  return (
    <section
      aria-labelledby="next-up-heading"
      style={{ '--stagger-index': 6 } as React.CSSProperties}
      className="plotline-enter col-span-2 sm:col-span-1 xl:col-span-3 sm:order-6 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-2.5 min-h-0"
    >
      <h2
        id="next-up-heading"
        className="text-base font-semibold text-[var(--ink-primary)] shrink-0"
      >
        Next up
      </h2>

      {nextEvent ? (
        <>
          <div
            onClick={onOpenCalendar}
            className="my-auto space-y-1 cursor-pointer hover:opacity-90 transition-opacity py-1"
          >
            <h3
              className="text-base sm:text-lg font-semibold leading-snug line-clamp-2"
              style={{ color: 'var(--accent)' }}
            >
              {nextEvent.title}
            </h3>
            <p className="text-xs text-[var(--ink-secondary)]">
              Time : {nextEvent.startTime} - {nextEvent.endTime}
            </p>
            <p className="text-xs text-[var(--ink-muted)] truncate">{nextEvent.location}</p>
          </div>

          <button
            type="button"
            onClick={() => onToggleCheckIn(nextEvent.id)}
            style={{
              backgroundColor: isMeetingStarted ? '#216E3E' : 'var(--accent)',
            }}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer shrink-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]"
          >
            <Video className="w-4 h-4 shrink-0" />
            <span>{isMeetingStarted ? 'Checked in ✓' : 'Start meeting'}</span>
          </button>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-2">
          <ContourGlyph seed="dashboard-next-up-empty" size={38} />
          <p className="text-xs text-[var(--ink-secondary)]">No upcoming meetings scheduled.</p>
          <button
            type="button"
            onClick={onOpenCalendar}
            style={{ color: 'var(--accent)' }}
            className="min-h-[44px] px-3 text-xs font-semibold hover:underline cursor-pointer inline-flex items-center"
          >
            + Schedule in Calendar
          </button>
        </div>
      )}
    </section>
  );
}
