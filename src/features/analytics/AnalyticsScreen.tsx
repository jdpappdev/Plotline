import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import type { AnalyticsRangeKey } from '../../domain/types';
import { computeAnalyticsData } from '../../domain/derivations';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { AnalyticsTrendChart } from '../../ui/charts/AnalyticsTrendChart';
import { ProjectFocusDonutChart } from '../../ui/charts/ProjectFocusDonutChart';
import { StatusCompositionBar } from '../../ui/charts/StatusCompositionBar';
import { AnalyticsKpiGrid } from './AnalyticsKpiGrid';
import { ContributorThroughputCard } from './ContributorThroughputCard';

const RANGE_OPTIONS: AnalyticsRangeKey[] = ['7D', '30D', '90D'];

export const AnalyticsScreen: React.FC = () => {
  const projects = useWorkspaceStore((s) => s.projects);
  const tasks = useWorkspaceStore((s) => s.tasks);
  const team = useWorkspaceStore((s) => s.team);
  const focusSessions = useWorkspaceStore((s) => s.focusSessions);
  const openProjectDialog = useWorkspaceStore((s) => s.openProjectDialog);
  const setSelectedProfileMemberId = useWorkspaceStore((s) => s.setSelectedProfileMemberId);
  const pushToast = useWorkspaceStore((s) => s.pushToast);

  const [rangeKey, setRangeKey] = useState<AnalyticsRangeKey>('30D');

  const analytics = useMemo(
    () => computeAnalyticsData(rangeKey, projects, tasks, team, focusSessions),
    [rangeKey, projects, tasks, team, focusSessions]
  );

  const handleExportCsv = () => {
    const headers = ['Date', 'FocusHours', 'TasksCompleted'];
    const rows = analytics.dailyTrend.map(
      (d) => `${d.dateIso},${d.hours.toFixed(1)},${d.tasksCount}`
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `plotline-analytics-${rangeKey.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    pushToast(
      `Exported ${rangeKey} Analytics CSV`,
      `${analytics.dailyTrend.length} daily records saved`
    );
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Analytics
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Studio velocity, focus hour distribution, and delivery cycle benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="inline-flex items-center bg-white rounded-full border border-slate-200 p-1">
            {RANGE_OPTIONS.map((opt) => {
              const active = rangeKey === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRangeKey(opt)}
                  className={`px-3.5 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--accent)] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-[12px] font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <AnalyticsKpiGrid data={analytics} />

        <AnalyticsTrendChart
          rangeKey={rangeKey}
          rangeDays={analytics.rangeDays}
          dailyTrend={analytics.dailyTrend}
          maxDailyHours={analytics.maxDailyHours}
          totalRangeTaskCompletions={analytics.totalRangeTaskCompletions}
        />

        <ProjectFocusDonutChart
          rangeKey={rangeKey}
          slices={analytics.projectFocusSlices}
          totalSliceHours={analytics.totalSliceHours}
          totalSliceSeconds={analytics.totalSliceSeconds}
          onSelectProject={(id) => openProjectDialog(id)}
        />

        <StatusCompositionBar
          segments={analytics.statusComposition}
          totalTasksCount={analytics.totalTasksCount}
        />

        <ContributorThroughputCard
          rangeKey={rangeKey}
          rows={analytics.contributorRows}
          maxCompleted={analytics.maxContributorCompleted}
          totalCompletedInRange={analytics.tasksCompletedCount}
          onSelectMember={(id) => setSelectedProfileMemberId(id)}
        />
      </div>
    </div>
  );
};
