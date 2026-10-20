import React, { useMemo } from 'react';
import { ContourGlyph } from '../../utils/contourGlyph';
import { AnalyticsRangeKey, ProjectShareItem } from './types';

export interface ProjectDistributionCardProps {
  range: AnalyticsRangeKey;
  currentFormattedDuration: string;
  projectShares: ProjectShareItem[];
  donutAnimated: boolean;
  selectedProjectId: string | null;
  onToggleProject: (projectId: string) => void;
}

export function ProjectDistributionCard({
  range,
  currentFormattedDuration,
  projectShares,
  donutAnimated,
  selectedProjectId,
  onToggleProject,
}: ProjectDistributionCardProps) {
  const selectedProjectShare = useMemo(
    () =>
      selectedProjectId
        ? projectShares.find((p) => p.project.id === selectedProjectId) || null
        : null,
    [projectShares, selectedProjectId]
  );

  // Donut geometry — segments sum to 100% with zero grey gap
  const donutRadius = 54;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulativeDonutPct = 0;

  return (
    <section
      aria-labelledby="donut-project-heading"
      style={{ '--stagger-index': 6 } as React.CSSProperties}
      className="plotline-enter lg:col-span-5 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3 min-w-0"
    >
      <div className="flex items-center justify-between">
        <h2
          id="donut-project-heading"
          className="text-base font-semibold text-[var(--ink-primary)]"
        >
          Time by project
        </h2>
        <span className="text-xs text-[var(--ink-muted)] font-ui-tabular">
          {currentFormattedDuration} total
        </span>
      </div>

      {projectShares.length === 0 ? (
        <div className="my-auto py-6 flex flex-col items-center justify-center text-center gap-2">
          <ContourGlyph seed="analytics-projects-empty" size={42} />
          <p className="text-xs text-[var(--ink-secondary)]">
            No project hours recorded in this window.
          </p>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row items-center gap-4 my-auto">
          {/* Custom SVG Donut — segments sum to 100% with no grey gap */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg data-testid="donut-svg" viewBox="0 0 136 136" className="w-full h-full">
              {projectShares.map((item, idx) => {
                const isLast = idx === projectShares.length - 1;
                const startPct = cumulativeDonutPct;
                const segPct = isLast ? Math.max(0, 100 - startPct) : item.pct;
                cumulativeDonutPct += segPct;
                const startArc = (startPct / 100) * donutCircumference;
                const targetArc = (segPct / 100) * donutCircumference + 0.35;
                const drawnLength = donutAnimated ? targetArc : 0;
                const offset = -startArc;
                const isSelected = selectedProjectId === item.project.id;
                return (
                  <circle
                    key={item.project.id}
                    data-testid={`donut-segment-${item.project.id}`}
                    data-pct={segPct}
                    data-start-pct={startPct}
                    data-target-arc={Number(targetArc.toFixed(2))}
                    cx="68"
                    cy="68"
                    r={donutRadius}
                    fill="none"
                    stroke={item.tint}
                    strokeWidth={isSelected ? '17' : '14'}
                    strokeDasharray={`${drawnLength} ${donutCircumference}`}
                    strokeDashoffset={offset}
                    transform="rotate(-90 68 68)"
                    style={{
                      transition:
                        'stroke-dasharray 700ms var(--ease-plotline), stroke-width 150ms var(--ease-plotline), stroke 250ms var(--ease-plotline)',
                    }}
                    className="cursor-pointer"
                    onClick={() => onToggleProject(item.project.id)}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
              <span className="text-lg font-display-num font-semibold text-[var(--ink-primary)] leading-none truncate max-w-full">
                {selectedProjectShare
                  ? selectedProjectShare.formattedDuration
                  : currentFormattedDuration}
              </span>
              <span className="text-[10px] text-[var(--ink-muted)] mt-0.5 truncate max-w-[92px]">
                {selectedProjectShare
                  ? `${selectedProjectShare.project.code} (${selectedProjectShare.pct}%)`
                  : `${range} logged`}
              </span>
            </div>
          </div>

          {/* Project Legend sorted by hours descending */}
          <div data-testid="donut-project-legend" className="flex-1 w-full space-y-2 min-w-0">
            {projectShares.map((item) => {
              const isSelected = selectedProjectId === item.project.id;
              return (
                <button
                  key={item.project.id}
                  type="button"
                  onClick={() => onToggleProject(item.project.id)}
                  className={`w-full flex items-center justify-between gap-2 text-xs p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--surface-sunken)]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.tint }}
                    />
                    <span className="w-6 h-6 rounded-[var(--radius-xs)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                      <ContourGlyph seed={item.project.id} size={22} />
                    </span>
                    <span className="font-medium text-[var(--ink-primary)] truncate">
                      {item.project.name}
                    </span>
                  </div>
                  <span
                    data-testid={`project-share-${item.project.id}`}
                    data-seconds={item.seconds}
                    data-hours={item.hours}
                    data-pct={item.pct}
                    className="font-ui-tabular font-semibold text-[var(--ink-secondary)] shrink-0"
                  >
                    {item.formattedDuration} ({item.pct}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
