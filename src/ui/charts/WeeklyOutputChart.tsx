import React from 'react';
import type { WeeklyOutputColumn } from '../../domain/derivations';
import { formatDuration, pluralize } from '../../lib/format';
import { MotionCard } from '../Motion';

interface WeeklyOutputChartProps {
  columns: WeeklyOutputColumn[];
  maxSeconds: number;
  totalWeekSeconds: number;
  totalSessionsCount: number;
}

export const WeeklyOutputChart: React.FC<WeeklyOutputChartProps> = ({
  columns,
  maxSeconds,
  totalWeekSeconds,
  totalSessionsCount,
}) => {
  return (
    <MotionCard index={4} className="col-span-12 lg:col-span-4 p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Weekly Output</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Focus hours logged per day (current week)
          </p>
        </div>
        <div className="text-right">
          <div className="text-[16px] font-bold text-slate-900 font-mono-tabular">
            {formatDuration(totalWeekSeconds)}
          </div>
          <div className="text-[10px] font-medium text-slate-400">
            {pluralize(totalSessionsCount, 'session')}
          </div>
        </div>
      </div>

      <svg className="w-0 h-0 absolute" aria-hidden="true">
        <defs>
          <pattern
            id="weekly-hatched-pattern"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill="#E2E8F0" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#94A3B8" strokeWidth="3" strokeOpacity="0.35" />
          </pattern>
        </defs>
      </svg>

      <div className="grid grid-cols-7 gap-2.5 items-end h-[175px] pt-6 pb-1 px-1">
        {columns.map((col, idx) => {
          const ratio = col.seconds / maxSeconds;
          const barHeightPct =
            col.seconds === 0 ? 12 : Math.max(18, Math.min(100, Math.round(ratio * 100)));
          const isPeak =
            col.seconds > 0 && col.seconds === Math.max(...columns.map((c) => c.seconds));

          const fillValue =
            col.seconds === 0
              ? 'url(#weekly-hatched-pattern)'
              : col.isToday || isPeak
              ? 'var(--accent)'
              : '#CBD5E1';

          return (
            <div
              key={`${col.weekdayIndex}-${idx}`}
              className="flex flex-col items-center h-full justify-end group relative"
            >
              {col.seconds > 0 && (
                <div
                  className={`mb-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono-tabular font-bold transition-all ${
                    col.isToday || isPeak
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'bg-slate-800 text-white opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {formatDuration(col.seconds)}
                </div>
              )}

              <div className="w-full h-[116px] bg-slate-100/80 rounded-full p-1 flex items-end justify-center overflow-hidden border border-slate-200/50">
                <svg
                  className="w-full h-full rounded-full overflow-hidden block"
                  viewBox="0 0 24 100"
                  preserveAspectRatio="none"
                >
                  <rect
                    x="0"
                    y={100 - barHeightPct}
                    width="24"
                    height={barHeightPct}
                    rx="12"
                    fill={fillValue}
                  />
                </svg>
              </div>

              <span
                className={`mt-2 text-[11px] font-bold ${
                  col.isToday ? 'text-[var(--accent)]' : 'text-slate-500'
                }`}
              >
                {col.label}
              </span>
            </div>
          );
        })}
      </div>
    </MotionCard>
  );
};
