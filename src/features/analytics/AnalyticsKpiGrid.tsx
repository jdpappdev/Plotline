import React from 'react';
import { CheckCircle2, Clock, Gauge, Timer } from 'lucide-react';
import type { AnalyticsComputedData } from '../../domain/derivations';
import { AnimatedNumber, MotionCard } from '../../ui/Motion';

interface AnalyticsKpiGridProps {
  data: AnalyticsComputedData;
}

export const AnalyticsKpiGrid: React.FC<AnalyticsKpiGridProps> = ({ data }) => {
  return (
    <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MotionCard index={0} hoverLift={false} className="p-5 flex flex-col justify-between min-h-[144px]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-600">Tasks Completed</span>
          <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>

        <div className="my-2 flex items-baseline gap-2.5">
          <div className="text-[34px] font-extrabold text-slate-900 leading-none font-mono-tabular">
            <AnimatedNumber value={data.tasksCompletedCount} />
          </div>
          {data.tasksDeltaPct !== 0 && (
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono-tabular ${
                data.tasksDeltaPct >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {data.tasksDeltaPct > 0 ? `+${data.tasksDeltaPct}%` : `${data.tasksDeltaPct}%`}
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500">{data.tasksSubtitle}</div>
      </MotionCard>

      <MotionCard index={1} hoverLift={false} className="p-5 flex flex-col justify-between min-h-[144px]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-600">Total Focus Hours</span>
          <span className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </span>
        </div>

        <div className="my-2 flex items-baseline gap-2.5">
          <div className="text-[34px] font-extrabold text-slate-900 leading-none font-mono-tabular">
            <AnimatedNumber value={data.totalFocusHours} formatter={(v) => `${v.toFixed(1)}h`} />
          </div>
          {data.focusDeltaPct !== 0 && (
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono-tabular ${
                data.focusDeltaPct >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {data.focusDeltaPct > 0 ? `+${data.focusDeltaPct}%` : `${data.focusDeltaPct}%`}
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500">{data.focusSubtitle}</div>
      </MotionCard>

      <MotionCard index={2} hoverLift={false} className="p-5 flex flex-col justify-between min-h-[144px]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-600">On-Time Delivery</span>
          <span className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </span>
        </div>

        <div className="my-2 flex items-baseline gap-2.5">
          <div className="text-[34px] font-extrabold text-slate-900 leading-none font-mono-tabular">
            <AnimatedNumber value={data.onTimeRate} formatter={(v) => `${Math.round(v)}%`} />
          </div>
          {data.onTimeDeltaPts !== 0 && (
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono-tabular ${
                data.onTimeDeltaPts >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {data.onTimeDeltaPts > 0 ? `+${data.onTimeDeltaPts}pt` : `${data.onTimeDeltaPts}pt`}
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500">{data.onTimeSubtitle}</div>
      </MotionCard>

      <MotionCard index={3} hoverLift={false} className="p-5 flex flex-col justify-between min-h-[144px]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-600">Avg. Cycle Time</span>
          <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Timer className="w-4 h-4" />
          </span>
        </div>

        <div className="my-2 flex items-baseline gap-2.5">
          <div className="text-[34px] font-extrabold text-slate-900 leading-none font-mono-tabular">
            <AnimatedNumber value={data.avgCycleDays} formatter={(v) => `${v.toFixed(1)}d`} />
          </div>
          {data.cycleDeltaDays !== 0 && (
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono-tabular ${
                data.cycleDeltaDays <= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {data.cycleDeltaDays > 0 ? `+${data.cycleDeltaDays}d` : `${data.cycleDeltaDays}d`}
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500">{data.cycleSubtitle}</div>
      </MotionCard>
    </div>
  );
};
