import React from 'react';
import type { TaskStatus } from '../../domain/types';
import { MotionCard } from '../Motion';

interface StatusSegment {
  status: TaskStatus;
  label: string;
  count: number;
  pct: number;
  color: string;
  textColor: string;
}

interface StatusCompositionBarProps {
  segments: StatusSegment[];
  totalTasksCount: number;
}

export const StatusCompositionBar: React.FC<StatusCompositionBarProps> = ({
  segments,
  totalTasksCount,
}) => {
  let offsetPct = 0;

  return (
    <MotionCard index={6} hoverLift={false} className="col-span-12 lg:col-span-5 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
            Workspace Task Status Breakdown
          </h2>
          <span className="text-[12px] font-bold font-mono-tabular text-slate-600">
            {totalTasksCount} total tasks
          </span>
        </div>
        <p className="text-[12px] text-slate-500 mb-5">
          Current lifecycle distribution across all active and completed projects
        </p>

        <svg
          className="w-full h-9 rounded-xl overflow-hidden block border border-slate-200/70 mb-5"
          viewBox="0 0 100 36"
          preserveAspectRatio="none"
        >
          {segments.map((seg) => {
            const x = offsetPct;
            const width = seg.pct;
            offsetPct += width;
            return (
              <rect
                key={seg.status}
                x={`${x}%`}
                y="0"
                width={`${width}%`}
                height="36"
                fill={seg.color}
              />
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {segments.map((seg) => (
          <div
            key={seg.status}
            className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <svg className="w-2.5 h-2.5 rounded-full shrink-0" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="5" fill={seg.color} />
              </svg>
              <span className="text-[12px] font-semibold text-slate-700">{seg.label}</span>
            </div>
            <div className="text-right font-mono-tabular">
              <span className="text-[13px] font-bold text-slate-900">{seg.count}</span>
              <span className="text-[11px] text-slate-400 ml-1">({seg.pct}%)</span>
            </div>
          </div>
        ))}
      </div>
    </MotionCard>
  );
};
