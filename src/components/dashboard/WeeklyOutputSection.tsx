import React, { useEffect, useRef, useState } from 'react';
import { WeekStart } from '../../domain/types';
import { formatDuration } from '../../domain/derivations/time';
import { AnchoredTooltip } from '../../ui/Popover';
import { WeeklyOutputDayColumn } from './types';

export interface WeeklyOutputSectionProps {
  weekStart: WeekStart;
  weeklyColumns: WeeklyOutputDayColumn[];
  weekTotalSeconds: number;
  maxDailyHours: number;
}

export function WeeklyOutputSection({
  weekStart,
  weeklyColumns,
  weekTotalSeconds,
  maxDailyHours,
}: WeeklyOutputSectionProps) {
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const weeklyChartRef = useRef<HTMLDivElement>(null);
  const dayColumnRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (hoveredDayIndex === null) return;
    const onOutsideTouch = (e: PointerEvent) => {
      if (weeklyChartRef.current && !weeklyChartRef.current.contains(e.target as Node)) {
        setHoveredDayIndex(null);
      }
    };
    document.addEventListener('pointerdown', onOutsideTouch);
    return () => document.removeEventListener('pointerdown', onOutsideTouch);
  }, [hoveredDayIndex]);

  return (
    <section
      aria-labelledby="weekly-output-heading"
      style={{ '--stagger-index': 5 } as React.CSSProperties}
      className="plotline-enter col-span-2 sm:col-span-2 xl:col-span-6 sm:order-5 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between min-h-0 relative"
    >
      <div className="flex items-center justify-between shrink-0 gap-2">
        <h2
          id="weekly-output-heading"
          className="text-base font-semibold text-[var(--ink-primary)]"
        >
          Weekly Output
        </h2>
        <span
          data-testid="weekly-output-total"
          data-seconds={weekTotalSeconds}
          className="text-xs text-[var(--ink-muted)] font-ui-tabular"
        >
          {weekStart === 'monday' ? 'Mon–Sun' : 'Sun–Sat'} · {formatDuration(weekTotalSeconds)}{' '}
          total
        </span>
      </div>

      {/* Seven slim columns (~28px wide, 8px radius), segmented by project with 2px gaps; tap or hover for tooltip */}
      <div
        ref={weeklyChartRef}
        className="flex-1 flex items-end justify-between gap-2 sm:gap-4 pt-7 pb-1 px-1 sm:px-2 min-h-[140px]"
      >
        {weeklyColumns.map((col) => {
          const colHeightPct =
            col.totalSeconds > 0
              ? Math.max(24, Math.min(100, Math.round((col.totalHours / maxDailyHours) * 100)))
              : 18;
          const isHovered = hoveredDayIndex === col.dayIndex;

          return (
            <div
              key={col.key}
              ref={(el) => {
                if (el) dayColumnRefs.current.set(col.dayIndex, el);
                else dayColumnRefs.current.delete(col.dayIndex);
              }}
              onMouseEnter={() => setHoveredDayIndex(col.dayIndex)}
              onMouseLeave={() => setHoveredDayIndex(null)}
              onFocus={() => setHoveredDayIndex(col.dayIndex)}
              onBlur={() => setHoveredDayIndex(null)}
              onClick={() =>
                setHoveredDayIndex((prev) => (prev === col.dayIndex ? null : col.dayIndex))
              }
              tabIndex={0}
              role="button"
              aria-label={`${col.full}: ${col.formattedTotal} across ${col.segments.length} projects`}
              className="relative flex-1 min-w-[36px] h-full flex flex-col items-center justify-end gap-1.5 group rounded-[var(--radius-sm)] cursor-pointer select-none"
            >
              {/* Hover / Tap Per-Project Breakdown Tooltip portaled to document.body */}
              <AnchoredTooltip
                isOpen={isHovered}
                anchorRect={
                  dayColumnRefs.current.get(col.dayIndex)?.getBoundingClientRect() || null
                }
                className="w-48 sm:w-52 bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-lg p-2.5 text-[11px] space-y-1.5"
              >
                <div className="flex items-center justify-between font-semibold text-[var(--ink-primary)] border-b border-[var(--border-hairline)] pb-1">
                  <span>
                    {col.full} {col.isToday ? '(Today)' : ''}
                  </span>
                  <span className="font-ui-tabular" style={{ color: 'var(--accent)' }}>
                    {col.formattedTotal}
                  </span>
                </div>
                {col.segments.length === 0 ? (
                  <p className="text-[var(--ink-muted)]">No sessions logged</p>
                ) : (
                  <div className="space-y-1">
                    {col.segments.map((seg) => (
                      <div key={seg.projectId} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: seg.tint }}
                          />
                          <span className="truncate text-[var(--ink-secondary)]">
                            {seg.projectName}
                          </span>
                        </span>
                        <span className="font-ui-tabular font-semibold text-[var(--ink-primary)] shrink-0">
                          {formatDuration(seg.seconds)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </AnchoredTooltip>

              <div className="relative w-full flex-1 flex items-end justify-center">
                {/* Slim 28px column container with 8px radius and 2px segment gaps */}
                <div
                  data-testid={col.isToday ? 'weekly-output-today-column' : undefined}
                  style={{
                    height: `${colHeightPct}%`,
                    outline: col.isToday ? '2px solid var(--accent)' : undefined,
                    outlineOffset: col.isToday ? '2px' : undefined,
                  }}
                  className="relative w-full max-w-[28px] rounded-[8px] flex flex-col justify-end gap-[2px] p-[1px] transition-all duration-250 ease-plotline"
                >
                  {/* Today's Total-Duration Label */}
                  {col.isToday && (
                    <span
                      data-testid="weekly-output-today-hours"
                      data-seconds={col.totalSeconds}
                      style={{ color: 'var(--accent)' }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 min-w-[2.25rem] px-1 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-elevated)] border border-[var(--accent-border)] text-[10px] font-semibold font-ui-tabular text-center whitespace-nowrap shadow-2xs"
                    >
                      {col.formattedTotal}
                    </span>
                  )}

                  {col.segments.length === 0 ? (
                    <div className="w-full h-full rounded-[6px] bg-[var(--surface-sunken)]" />
                  ) : (
                    col.segments.map((seg) => {
                      const segShare =
                        col.totalSeconds > 0 ? (seg.seconds / col.totalSeconds) * 100 : 100;
                      return (
                        <div
                          key={seg.projectId}
                          style={{
                            height: `${Math.max(14, segShare)}%`,
                            backgroundColor: seg.tint,
                          }}
                          className="w-full rounded-[6px] transition-all duration-250 ease-plotline"
                        />
                      );
                    })
                  )}
                </div>
              </div>

              <span
                className={`text-xs font-medium ${
                  col.isToday ? 'font-bold text-[var(--ink-primary)]' : 'text-[var(--ink-muted)]'
                }`}
              >
                {col.short}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
