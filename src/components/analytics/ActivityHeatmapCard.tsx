import React, { useMemo } from 'react';
import { AnalyticsDailyPoint, AnalyticsRangeKey } from './types';

const WEEKDAY_ROW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function getMondayFirstRowIndex(dateIso: string): number {
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3) return 0;
  const jsDay = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getDay();
  return (jsDay + 6) % 7; // Mon = 0 .. Sun = 6
}

// 5 clearly different shades for the calendar heatmap
export function getHeatmapLevel(hours: number): 0 | 1 | 2 | 3 | 4 {
  if (hours <= 0) return 0;
  if (hours < 3.5) return 1;
  if (hours < 5.0) return 2;
  if (hours < 6.5) return 3;
  return 4;
}

export function getHeatmapBg(hours: number): string {
  const level = getHeatmapLevel(hours);
  switch (level) {
    case 0:
      return 'var(--surface-sunken)';
    case 1:
      return 'color-mix(in oklab, var(--accent) 24%, var(--surface-sunken))';
    case 2:
      return 'color-mix(in oklab, var(--accent) 48%, var(--surface-sunken))';
    case 3:
      return 'color-mix(in oklab, var(--accent) 74%, var(--surface-sunken))';
    case 4:
    default:
      return 'var(--accent)';
  }
}

export interface ActivityHeatmapCardProps {
  range: AnalyticsRangeKey;
  dailyCurrent: AnalyticsDailyPoint[];
  selectedHeatmapDate: string | null;
  onToggleDate: (dateIso: string) => void;
}

export function ActivityHeatmapCard({
  range,
  dailyCurrent,
  selectedHeatmapDate,
  onToggleDate,
}: ActivityHeatmapCardProps) {
  const heatmapCalendar = useMemo(() => {
    const days = dailyCurrent;
    if (days.length === 0) {
      return {
        numWeeks: 1,
        weekHeaders: [''],
        rows: WEEKDAY_ROW_LABELS.map((label, rIdx) => ({
          label,
          rowIndex: rIdx,
          cells: [null as (typeof days)[number] | null],
        })),
      };
    }

    const firstRow = getMondayFirstRowIndex(days[0].date);
    const numWeeks = Math.ceil((firstRow + days.length) / 7);

    const matrix: Array<Array<(typeof days)[number] | null>> = Array.from({ length: 7 }, () =>
      Array.from({ length: numWeeks }, () => null)
    );

    const weekHeaders: string[] = Array.from({ length: numWeeks }, () => '');

    days.forEach((day, idx) => {
      const offset = firstRow + idx;
      const colIdx = Math.floor(offset / 7);
      const rowIdx = offset % 7;
      matrix[rowIdx][colIdx] = day;
      if (!weekHeaders[colIdx]) {
        weekHeaders[colIdx] = day.label;
      }
    });

    return {
      numWeeks,
      weekHeaders,
      rows: WEEKDAY_ROW_LABELS.map((label, rIdx) => ({
        label,
        rowIndex: rIdx,
        cells: matrix[rIdx],
      })),
    };
  }, [dailyCurrent]);

  const selectedHeatmapDay = useMemo(
    () =>
      selectedHeatmapDate ? dailyCurrent.find((d) => d.date === selectedHeatmapDate) || null : null,
    [dailyCurrent, selectedHeatmapDate]
  );

  return (
    <section
      aria-labelledby="activity-heatmap-heading"
      style={{ '--stagger-index': 7 } as React.CSSProperties}
      className="plotline-enter lg:col-span-6 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3 min-w-0"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2
            id="activity-heatmap-heading"
            className="text-base font-semibold text-[var(--ink-primary)]"
          >
            Activity Heatmap
          </h2>
          <p className="text-xs text-[var(--ink-secondary)]">
            Daily studio intensity across the {range} window (Mon–Sun by week)
          </p>
        </div>
        <span className="text-xs text-[var(--ink-muted)] shrink-0">
          {selectedHeatmapDay
            ? `${selectedHeatmapDay.label}: ${selectedHeatmapDay.formattedDuration} (${selectedHeatmapDay.tasks} tasks)`
            : `${dailyCurrent.length} days`}
        </span>
      </div>

      <div className="py-1 space-y-1.5">
        {/* Week column headers */}
        <div className="flex items-center gap-2">
          <span className="w-8 shrink-0" aria-hidden="true" />
          <div
            style={{
              gridTemplateColumns: `repeat(${heatmapCalendar.numWeeks}, minmax(0, 1fr))`,
            }}
            className="grid gap-1.5 flex-1 min-w-0"
          >
            {heatmapCalendar.weekHeaders.map((header, wIdx) => (
              <span
                key={wIdx}
                className="text-[10px] text-[var(--ink-muted)] font-ui-tabular truncate text-center"
              >
                {header}
              </span>
            ))}
          </div>
        </div>

        {/* 7 Rows (Mon–Sun), Columns = Weeks */}
        <div
          data-testid="activity-heatmap-grid"
          role="grid"
          aria-label="Activity heatmap calendar (7 rows Mon to Sun by week)"
          className="grid grid-rows-7 gap-1.5"
        >
          {heatmapCalendar.rows.map((row) => (
            <div
              key={row.label}
              role="row"
              data-testid={`heatmap-row-${row.label.toLowerCase()}`}
              className="flex items-center gap-2 min-w-0"
            >
              <span className="w-8 shrink-0 text-[10px] font-medium text-[var(--ink-muted)] select-none">
                {row.label}
              </span>
              <div
                style={{
                  gridTemplateColumns: `repeat(${heatmapCalendar.numWeeks}, minmax(0, 1fr))`,
                }}
                className="grid gap-1.5 flex-1 min-w-0"
              >
                {row.cells.map((day, colIdx) => {
                  if (!day) {
                    return (
                      <span
                        key={`empty-${row.label}-${colIdx}`}
                        aria-hidden="true"
                        className="h-6 sm:h-6 rounded-[var(--radius-xs)] opacity-25 border border-dashed border-[var(--border-hairline)]"
                      />
                    );
                  }
                  const isSelected = selectedHeatmapDate === day.date;
                  const shadeLevel = getHeatmapLevel(day.hours);
                  return (
                    <button
                      key={day.date}
                      type="button"
                      role="gridcell"
                      data-testid={`heatmap-cell-${day.date}`}
                      data-level={shadeLevel}
                      data-hours={day.hours}
                      onClick={() => onToggleDate(day.date)}
                      title={`${day.label} (${row.label}): ${day.formattedDuration} (${day.tasks} tasks)`}
                      aria-label={`${day.label} (${row.label}): ${day.formattedDuration}, ${day.tasks} tasks`}
                      style={{
                        backgroundColor: getHeatmapBg(day.hours),
                      }}
                      className={`h-6 sm:h-6 rounded-[var(--radius-xs)] transition-transform hover:scale-105 cursor-pointer ${
                        isSelected ? 'ring-2 ring-[var(--ink-primary)]' : ''
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)] pt-1 border-t border-[var(--border-hairline)]">
        <span>Lower cadence</span>
        <div data-testid="heatmap-legend-swatches" className="flex items-center gap-1">
          {[0, 2.5, 4.2, 5.8, 7.5].map((h, idx) => (
            <span
              key={idx}
              data-level={idx}
              className="w-3 h-3 rounded-[2px]"
              style={{ backgroundColor: getHeatmapBg(h) }}
              title={idx === 0 ? '0h' : `Level ${idx}`}
            />
          ))}
        </div>
        <span>Peak cadence</span>
      </div>
    </section>
  );
}
