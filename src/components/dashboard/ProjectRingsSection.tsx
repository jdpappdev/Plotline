import React, { useEffect, useState } from 'react';
import { Project } from '../../domain/types';
import { ContourGlyph } from '../../utils/contourGlyph';
import { CountUpNumeral } from './CountUpNumeral';

const RING_RADII = [60, 49, 38, 27];
const RING_STROKE_WIDTH = 6;

export interface ProjectRingsSectionProps {
  soonestProjects: Project[];
  overallRingsProgress: number;
  accentTints: readonly string[];
  onOpenProject: (projectId: string) => void;
}

export function ProjectRingsSection({
  soonestProjects,
  overallRingsProgress,
  accentTints,
  onOpenProject,
}: ProjectRingsSectionProps) {
  const [ringsAnimated, setRingsAnimated] = useState<boolean>(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setRingsAnimated(true);
      return;
    }
    const id = requestAnimationFrame(() => {
      setRingsAnimated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section
      aria-labelledby="project-rings-heading"
      style={{ '--stagger-index': 9 } as React.CSSProperties}
      className="dashboard-rings-card plotline-enter col-span-2 sm:col-span-1 xl:col-span-4 sm:order-9 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex min-w-0 flex-col justify-between gap-3 min-h-0"
    >
      <div className="flex items-center justify-between shrink-0">
        <h2
          id="project-rings-heading"
          className="text-base font-semibold text-[var(--ink-primary)]"
        >
          Project Rings
        </h2>
        <span className="text-[11px] text-[var(--ink-muted)]">Due soonest</span>
      </div>

      {/* Concentric Rings + Compact Legend */}
      {soonestProjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-2">
          <ContourGlyph seed="dashboard-rings-empty" size={38} />
          <p className="text-xs text-[var(--ink-secondary)]">
            Add a project to view completion rings.
          </p>
        </div>
      ) : (
        <div className="my-auto flex items-center justify-between gap-3 min-h-0">
          <div className="dashboard-ring-visual relative w-[clamp(104px,38cqw,132px)] aspect-square flex items-center justify-center shrink-0 mx-auto">
            <svg
              viewBox="0 0 136 136"
              className="w-full h-full overflow-visible"
              aria-label={`Overall project completion ${overallRingsProgress}%`}
            >
              {soonestProjects.map((proj, idx) => {
                const r = RING_RADII[idx] ?? 27;
                const circumference = 2 * Math.PI * r;
                const targetPct = Math.min(100, Math.max(0, proj.progress));
                const dashOffset = ringsAnimated
                  ? circumference - (targetPct / 100) * circumference
                  : circumference;
                const tint = accentTints[idx % accentTints.length];

                return (
                  <g key={proj.id}>
                    {/* Track var(--line) */}
                    <circle
                      cx="68"
                      cy="68"
                      r={r}
                      fill="none"
                      stroke="var(--line)"
                      strokeWidth={RING_STROKE_WIDTH}
                    />
                    {/* Animated Arc in Accent Tint */}
                    <circle
                      cx="68"
                      cy="68"
                      r={r}
                      fill="none"
                      stroke={tint}
                      strokeWidth={RING_STROKE_WIDTH}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 68 68)"
                      style={{
                        transition:
                          'stroke-dashoffset 700ms var(--ease-plotline), stroke 250ms var(--ease-plotline)',
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Center Overall % in Serif Numeral Face */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <CountUpNumeral
                value={overallRingsProgress}
                suffix="%"
                className="text-xl font-semibold text-[var(--ink-primary)] leading-none"
              />
              <span className="text-[9px] text-[var(--ink-muted)] mt-0.5">Overall</span>
            </div>
          </div>

          {/* Compact Legend (Name + %) */}
          <div className="flex-1 min-w-0 space-y-1">
            {soonestProjects.map((proj, idx) => {
              const tint = accentTints[idx % accentTints.length];
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => onOpenProject(proj.id)}
                  className="w-full min-h-[36px] sm:min-h-0 flex items-center justify-between gap-2 text-xs p-1.5 sm:p-1 rounded cursor-pointer hover:bg-[var(--surface-sunken)] transition-colors text-left"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: tint }}
                    />
                    <span className="text-[11px] font-medium text-[var(--ink-secondary)] truncate">
                      {proj.name}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold font-ui-tabular text-[var(--ink-primary)] shrink-0">
                    {proj.progress}%
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
