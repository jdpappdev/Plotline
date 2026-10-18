import React from 'react';
import type { AnalyticsRangeKey, Project } from '../../domain/types';
import { formatDuration } from '../../lib/format';
import { AnimatedNumber, MotionCard } from '../Motion';

interface ProjectSlice {
  project: Project;
  seconds: number;
  hours: number;
  pct: number;
  color: string;
}

interface ProjectFocusDonutChartProps {
  rangeKey: AnalyticsRangeKey;
  slices: ProjectSlice[];
  totalSliceHours: number;
  totalSliceSeconds: number;
  onSelectProject: (projectId: string) => void;
}

const DONUT_RADIUS = 50;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

export const ProjectFocusDonutChart: React.FC<ProjectFocusDonutChartProps> = ({
  rangeKey,
  slices,
  totalSliceHours,
  totalSliceSeconds,
  onSelectProject,
}) => {
  let cumulativeSeconds = 0;

  return (
    <MotionCard index={5} hoverLift={false} className="col-span-12 lg:col-span-5 p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
            Focus Hours by Project ({rangeKey})
          </h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Proportional share of logged engineering & design time
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono-tabular font-bold">
          {totalSliceHours.toFixed(1)}h total
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
        <div className="relative w-[144px] h-[144px] shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={DONUT_RADIUS}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="16"
            />
            {slices.map((s) => {
              const fraction = totalSliceSeconds > 0 ? s.seconds / totalSliceSeconds : 0;
              const arcLength = fraction * DONUT_CIRCUMFERENCE;
              const dashOffset =
                totalSliceSeconds > 0
                  ? -(cumulativeSeconds / totalSliceSeconds) * DONUT_CIRCUMFERENCE
                  : 0;
              cumulativeSeconds += s.seconds;
              return (
                <circle
                  key={s.project.id}
                  cx="64"
                  cy="64"
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="16"
                  strokeDasharray={`${arcLength} ${DONUT_CIRCUMFERENCE}`}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500 cursor-pointer hover:opacity-85"
                  onClick={() => onSelectProject(s.project.id)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[20px] font-extrabold text-slate-900 font-mono-tabular leading-none">
              <AnimatedNumber value={totalSliceHours} formatter={(v) => `${v.toFixed(1)}h`} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              100% Share
            </span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          {slices.map((s, idx) => (
            <button
              key={s.project.id}
              type="button"
              onClick={() => onSelectProject(s.project.id)}
              className="w-full flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 tint-dot-${idx % 5}`} />
                <span className="text-[12px] font-semibold text-slate-800 truncate group-hover:text-[var(--accent)] transition-colors">
                  {s.project.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono-tabular">
                <span className="text-[12px] font-bold text-slate-900">
                  {formatDuration(s.seconds)}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 w-9 text-right">
                  {s.pct}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </MotionCard>
  );
};
