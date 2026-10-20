import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { AnalyticsRangeKey } from './types';

interface SparklineProps {
  values: number[];
  id: string;
}

function SvgSparkline({ values, id }: SparklineProps) {
  if (values.length < 2) return null;
  const width = 96;
  const height = 28;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values, minVal + 0.1);
  const span = maxVal - minVal || 1;

  const pts = values.map((v, idx) => {
    const x = (idx / (values.length - 1)) * (width - 4) + 2;
    const y = height - 4 - ((v - minVal) / span) * (height - 8);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `M ${pts[0].x},${height} L ${pts
    .map((p) => `${p.x},${p.y}`)
    .join(' L ')} L ${pts[pts.length - 1].x},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-16 sm:w-24 h-auto overflow-visible shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${id})`} />
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polyline}
      />
    </svg>
  );
}

export interface AnalyticsKpiGridProps {
  range: AnalyticsRangeKey;
  currentTasksCompleted: number;
  tasksDeltaPct: number;
  tasksDeltaIsNew: boolean;
  tasksSpark: number[];
  currentTotalSeconds: number;
  currentFormattedDuration: string;
  hoursDeltaPct: number;
  hoursDeltaIsNew: boolean;
  hoursSpark: number[];
  currentOnTimePct: number;
  onTimeDeltaPct: number;
  onTimeDeltaIsNew: boolean;
  onTimeSpark: number[];
  currentCycleAvg: number;
  cycleDeltaPct: number;
  cycleDeltaIsNew: boolean;
  cycleSpark: number[];
}

export function AnalyticsKpiGrid({
  range,
  currentTasksCompleted,
  tasksDeltaPct,
  tasksDeltaIsNew,
  tasksSpark,
  currentTotalSeconds,
  currentFormattedDuration,
  hoursDeltaPct,
  hoursDeltaIsNew,
  hoursSpark,
  currentOnTimePct,
  onTimeDeltaPct,
  onTimeDeltaIsNew,
  onTimeSpark,
  currentCycleAvg,
  cycleDeltaPct,
  cycleDeltaIsNew,
  cycleSpark,
}: AnalyticsKpiGridProps) {
  return (
    <div
      data-testid="analytics-kpi-grid"
      className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5"
    >
      {/* KPI 1: Tasks completed */}
      <div
        style={{ '--stagger-index': 1 } as React.CSSProperties}
        className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-3 min-w-0"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--ink-secondary)] truncate">
            Tasks completed
          </span>
          {tasksDeltaIsNew ? (
            <span
              data-testid="kpi-delta-tasks"
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] shrink-0"
            >
              New
            </span>
          ) : (
            <span
              data-testid="kpi-delta-tasks"
              className={`inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-ui-tabular shrink-0 ${
                tasksDeltaPct >= 0 ? 'text-[#216E3E]' : 'text-[#B43342]'
              }`}
            >
              {tasksDeltaPct >= 0 ? (
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              {tasksDeltaPct >= 0 ? '+' : ''}
              {tasksDeltaPct}%
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-1.5 sm:gap-2 min-w-0">
          <div className="min-w-0">
            <span
              data-testid="kpi-tasks-completed"
              className="text-2xl sm:text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none block truncate"
            >
              {currentTasksCompleted}
            </span>
            <span className="block text-[10px] sm:text-[11px] text-[var(--ink-muted)] mt-1 truncate">
              vs. previous {range}
            </span>
          </div>
          <SvgSparkline values={tasksSpark} id="tasks" />
        </div>
      </div>

      {/* KPI 2: Focus hours */}
      <div
        style={{ '--stagger-index': 2 } as React.CSSProperties}
        className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-3 min-w-0"
      >
        <div className="flex items-center justify-between gap-1">
          <span
            data-testid="kpi-focus-hours-label"
            className="text-[11px] sm:text-xs font-semibold text-[var(--ink-secondary)] truncate"
          >
            Focus hours
          </span>
          {hoursDeltaIsNew ? (
            <span
              data-testid="kpi-delta-hours"
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] shrink-0"
            >
              New
            </span>
          ) : (
            <span
              data-testid="kpi-delta-hours"
              className={`inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-ui-tabular shrink-0 ${
                hoursDeltaPct >= 0 ? 'text-[#216E3E]' : 'text-[#B43342]'
              }`}
            >
              {hoursDeltaPct >= 0 ? (
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              {hoursDeltaPct >= 0 ? '+' : ''}
              {hoursDeltaPct}%
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-1.5 sm:gap-2 min-w-0">
          <div className="min-w-0">
            <span
              data-testid="kpi-hours-tracked"
              data-seconds={currentTotalSeconds}
              className="text-2xl sm:text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none block truncate"
            >
              {currentFormattedDuration}
            </span>
            <span className="block text-[10px] sm:text-[11px] text-[var(--ink-muted)] mt-1 truncate">
              vs. previous {range}
            </span>
          </div>
          <SvgSparkline values={hoursSpark} id="hours" />
        </div>
      </div>

      {/* KPI 3: On-time delivery */}
      <div
        style={{ '--stagger-index': 3 } as React.CSSProperties}
        className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-3 min-w-0"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--ink-secondary)] truncate">
            On-time delivery
          </span>
          {onTimeDeltaIsNew ? (
            <span
              data-testid="kpi-delta-ontime"
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] shrink-0"
            >
              New
            </span>
          ) : (
            <span
              data-testid="kpi-delta-ontime"
              className={`inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-ui-tabular shrink-0 ${
                onTimeDeltaPct >= 0 ? 'text-[#216E3E]' : 'text-[#B43342]'
              }`}
            >
              {onTimeDeltaPct >= 0 ? (
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              {onTimeDeltaPct >= 0 ? '+' : ''}
              {onTimeDeltaPct}%
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-1.5 sm:gap-2 min-w-0">
          <div className="min-w-0">
            <span
              data-testid="kpi-ontime-delivery"
              className="text-2xl sm:text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none block truncate"
            >
              {currentOnTimePct}%
            </span>
            <span className="block text-[10px] sm:text-[11px] text-[var(--ink-muted)] mt-1 truncate">
              vs. previous {range}
            </span>
          </div>
          <SvgSparkline values={onTimeSpark} id="ontime" />
        </div>
      </div>

      {/* KPI 4: Average cycle time */}
      <div
        style={{ '--stagger-index': 4 } as React.CSSProperties}
        className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-3 min-w-0"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--ink-secondary)] truncate">
            Avg cycle time
          </span>
          {cycleDeltaIsNew ? (
            <span
              data-testid="kpi-delta-cycle"
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] shrink-0"
            >
              New
            </span>
          ) : (
            <span
              data-testid="kpi-delta-cycle"
              className={`inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-ui-tabular shrink-0 ${
                cycleDeltaPct <= 0 ? 'text-[#216E3E]' : 'text-[#B43342]'
              }`}
            >
              {cycleDeltaPct <= 0 ? (
                <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              {cycleDeltaPct >= 0 ? '+' : ''}
              {cycleDeltaPct}%
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-1.5 sm:gap-2 min-w-0">
          <div className="min-w-0">
            <span
              data-testid="kpi-cycle-time"
              className="text-2xl sm:text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none block truncate"
            >
              {currentCycleAvg}d
            </span>
            <span className="block text-[10px] sm:text-[11px] text-[var(--ink-muted)] mt-1 truncate">
              vs. previous {range}
            </span>
          </div>
          <SvgSparkline values={cycleSpark} id="cycle" />
        </div>
      </div>
    </div>
  );
}
