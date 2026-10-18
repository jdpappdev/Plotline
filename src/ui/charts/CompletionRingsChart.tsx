import React from 'react';
import type { Project, TaskItem } from '../../domain/types';
import { getProjectStatus } from '../../domain/derivations';
import { ACCENT_TINTS } from '../../lib/theme';
import { AnimatedNumber, MotionCard } from '../Motion';

interface CompletionRingsChartProps {
  ringsProjects: Array<{ project: Project; progress: number }>;
  projects: Project[];
  tasks: TaskItem[];
  onSelectProject: (projectId: string) => void;
}

const RING_RADII = [58, 45, 32, 19];

export const CompletionRingsChart: React.FC<CompletionRingsChartProps> = ({
  ringsProjects,
  projects,
  tasks,
  onSelectProject,
}) => {
  const avgActiveProgress =
    ringsProjects.length > 0
      ? Math.round(
          ringsProjects.reduce((acc, r) => acc + r.progress, 0) / ringsProjects.length
        )
      : 100;

  return (
    <MotionCard index={6} className="col-span-12 lg:col-span-4 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Completion Rings</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Next 4 unfinished projects by due date
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-bold">
          Active Focus
        </span>
      </div>

      <div className="flex items-center gap-4 my-auto py-1">
        <div className="relative w-[136px] h-[136px] shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 136 136">
            {ringsProjects.map((item, idx) => {
              const r = RING_RADII[idx] || 20;
              const circumference = 2 * Math.PI * r;
              const offset = circumference - (item.progress / 100) * circumference;
              const strokeColor = ACCENT_TINTS[idx % ACCENT_TINTS.length];
              return (
                <g key={item.project.id}>
                  <circle
                    cx="68"
                    cy="68"
                    r={r}
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="8"
                  />
                  <circle
                    cx="68"
                    cy="68"
                    r={r}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                  />
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[17px] font-extrabold text-slate-900 font-mono-tabular leading-none">
              <AnimatedNumber value={avgActiveProgress} formatter={(v) => `${Math.round(v)}%`} />
            </span>
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
              Avg
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {ringsProjects.map((item, idx) => {
            const dotClass = `tint-dot-${idx % 5}`;
            const status = getProjectStatus(item.project, tasks);
            return (
              <button
                key={item.project.id}
                type="button"
                onClick={() => onSelectProject(item.project.id)}
                className="w-full text-left flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}`} />
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-slate-800 truncate group-hover:text-[var(--accent)] transition-colors">
                      {item.project.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{status}</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold font-mono-tabular text-slate-700 shrink-0">
                  {item.progress}%
                </span>
              </button>
            );
          })}
          {ringsProjects.length === 0 && projects.length > 0 && (
            <div className="text-[12px] text-slate-400 py-4 text-center">
              All projects completed!
            </div>
          )}
        </div>
      </div>
    </MotionCard>
  );
};
