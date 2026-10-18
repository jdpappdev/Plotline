import React from 'react';
import { ArrowUpRight, CheckCircle2, Clock, FolderKanban, Sparkles } from 'lucide-react';
import type { ProjectStatusCounts } from '../../domain/derivations';
import { AnimatedNumber, MotionCard } from '../../ui/Motion';

interface DashboardKpiGridProps {
  counts: ProjectStatusCounts;
  onNavigateProjects: () => void;
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = ({
  counts,
  onNavigateProjects,
}) => {
  return (
    <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        onClick={onNavigateProjects}
        className="hero-Executable-card p-5 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-0.5 min-h-[146px]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-white/85 tracking-wide">
            Total Projects
          </span>
          <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>

        <div className="my-2">
          <div className="text-[38px] font-extrabold leading-none tracking-tight font-mono-tabular">
            <AnimatedNumber value={counts.totalCount} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-white/80 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono-tabular font-semibold">
            {counts.endedCount} + {counts.runningCount} + {counts.pendingCount}
          </span>
          <span>Active portfolio streams</span>
        </div>
      </div>

      <MotionCard
        index={1}
        onClick={onNavigateProjects}
        className="p-5 flex flex-col justify-between cursor-pointer min-h-[146px]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-600">Ended Projects</span>
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </span>
        </div>
        <div className="my-2">
          <div className="text-[36px] font-extrabold text-slate-900 leading-none tracking-tight font-mono-tabular">
            <AnimatedNumber value={counts.endedCount} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold font-mono-tabular">
            {counts.endedPct}%
          </span>
          <span>of total portfolio</span>
        </div>
      </MotionCard>

      <MotionCard
        index={2}
        onClick={onNavigateProjects}
        className="p-5 flex flex-col justify-between cursor-pointer min-h-[146px]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-600">Running Projects</span>
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <FolderKanban className="w-4 h-4 text-[var(--accent)]" />
          </span>
        </div>
        <div className="my-2">
          <div className="text-[36px] font-extrabold text-slate-900 leading-none tracking-tight font-mono-tabular">
            <AnimatedNumber value={counts.runningCount} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] font-semibold font-mono-tabular">
            {counts.runningPct}%
          </span>
          <span>currently in execution</span>
        </div>
      </MotionCard>

      <MotionCard
        index={3}
        onClick={onNavigateProjects}
        className="p-5 flex flex-col justify-between cursor-pointer min-h-[146px]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-600">Pending Projects</span>
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <Clock className="w-4 h-4 text-amber-600" />
          </span>
        </div>
        <div className="my-2">
          <div className="text-[36px] font-extrabold text-slate-900 leading-none tracking-tight font-mono-tabular">
            <AnimatedNumber value={counts.pendingCount} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{counts.pendingPct}% in discovery & staging</span>
        </div>
      </MotionCard>
    </div>
  );
};
