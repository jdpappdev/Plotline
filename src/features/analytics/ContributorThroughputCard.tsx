import React from 'react';
import type { AnalyticsRangeKey, TeamMember } from '../../domain/types';
import { formatDuration, pluralize } from '../../lib/format';
import { MotionCard } from '../../ui/Motion';
import { ProgressBar } from '../../ui/ProgressBar';

interface ContributorRow {
  member: TeamMember;
  completedCount: number;
  focusHours: number;
  focusSeconds: number;
  shareOfCompletedPct: number;
}

interface ContributorThroughputCardProps {
  rangeKey: AnalyticsRangeKey;
  rows: ContributorRow[];
  maxCompleted: number;
  totalCompletedInRange: number;
  onSelectMember: (memberId: string) => void;
}

export const ContributorThroughputCard: React.FC<ContributorThroughputCardProps> = ({
  rangeKey,
  rows,
  maxCompleted,
  totalCompletedInRange,
  onSelectMember,
}) => {
  return (
    <MotionCard index={7} hoverLift={false} className="col-span-12 lg:col-span-7 p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
            Contributor Throughput & Focus ({rangeKey})
          </h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Completed deliverables and logged focus time per specialist (sums to{' '}
            {pluralize(totalCompletedInRange, 'completed task')})
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.member.id}
            onClick={() => onSelectMember(row.member.id)}
            className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                  {row.member.initials}
                </span>
                <div className="min-w-0">
                  <span className="text-[13px] font-bold text-slate-900 group-hover:text-[var(--accent)] transition-colors truncate block">
                    {row.member.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{row.member.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono-tabular shrink-0 text-[12px]">
                <span className="text-slate-500">
                  {formatDuration(row.focusSeconds)} focus
                </span>
                <span className="font-bold text-slate-900 w-16 text-right">
                  {pluralize(row.completedCount, 'task')}
                </span>
              </div>
            </div>

            <ProgressBar
              value={row.completedCount}
              max={maxCompleted}
              heightClassName="h-2"
            />
          </div>
        ))}
      </div>
    </MotionCard>
  );
};
