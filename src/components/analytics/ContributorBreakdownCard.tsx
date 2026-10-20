import React from 'react';
import { ContourGlyph } from '../../utils/contourGlyph';
import { AnalyticsRangeKey, ContributorMetricItem } from './types';

export interface ContributorBreakdownCardProps {
  range: AnalyticsRangeKey;
  contributors: ContributorMetricItem[];
}

export function ContributorBreakdownCard({ range, contributors }: ContributorBreakdownCardProps) {
  return (
    <section
      aria-labelledby="top-contributors-heading"
      style={{ '--stagger-index': 8 } as React.CSSProperties}
      className="plotline-enter lg:col-span-6 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3 min-w-0"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2
            id="top-contributors-heading"
            className="text-base font-semibold text-[var(--ink-primary)]"
          >
            Top Contributors
          </h2>
          <p className="text-xs text-[var(--ink-secondary)]">
            Specialists ranked by completed deliverables and focus hours ({range})
          </p>
        </div>
      </div>

      {contributors.length === 0 ? (
        <div className="my-auto py-6 flex flex-col items-center justify-center text-center gap-2">
          <ContourGlyph seed="analytics-contributors-empty" size={42} />
          <p className="text-xs text-[var(--ink-secondary)]">
            No contributor telemetry available yet.
          </p>
        </div>
      ) : (
        <div data-testid="contributors-list" className="space-y-2.5">
          {contributors.map((entry) => {
            const maxContributorSeconds = Math.max(1, ...contributors.map((c) => c.seconds));
            const barPct = Math.round((entry.seconds / maxContributorSeconds) * 100);
            return (
              <div
                key={entry.member.id}
                data-testid={`contributor-row-${entry.member.id}`}
                data-tasks={entry.tasksCompleted}
                className="space-y-1"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      style={{ backgroundColor: 'var(--accent)' }}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                    >
                      {entry.member.initials}
                    </span>
                    <span className="font-semibold text-[var(--ink-primary)] truncate">
                      {entry.member.name}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)] truncate hidden sm:inline">
                      · {entry.member.role}
                    </span>
                  </div>
                  <span
                    data-testid={`contributor-metrics-${entry.member.id}`}
                    className="font-ui-tabular font-semibold text-[var(--ink-primary)] shrink-0"
                  >
                    {entry.formattedDuration} · {entry.tasksCompleted} tasks
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden">
                  <div
                    style={{
                      width: `${barPct}%`,
                      backgroundColor: 'var(--accent)',
                    }}
                    className="h-full rounded-full transition-all duration-300 ease-plotline"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
