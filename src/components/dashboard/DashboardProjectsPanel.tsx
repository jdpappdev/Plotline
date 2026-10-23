import React from 'react';
import { Plus } from 'lucide-react';
import { Project } from '../../domain/types';
import { ContourGlyph } from '../../utils/contourGlyph';
import { DeleteButton } from '../DeleteButton';

function formatShortDate(isoDate: string): string {
  if (!isoDate) return '—';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const dateObj = new Date(year, month, day);
  if (Number.isNaN(dateObj.getTime())) return isoDate;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export interface DashboardProjectsPanelProps {
  projects: Project[];
  lastAddedProjectId: string | null;
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function DashboardProjectsPanel({
  projects,
  lastAddedProjectId,
  onNewProject,
  onOpenProject,
  onDeleteProject,
}: DashboardProjectsPanelProps) {
  return (
    <section
      aria-labelledby="projects-card-heading"
      style={{ '--stagger-index': 7 } as React.CSSProperties}
      className="plotline-enter col-span-2 sm:col-span-1 xl:col-span-4 sm:order-7 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-1.5 min-h-0"
    >
      <div className="flex items-center justify-between gap-2 shrink-0">
        <h2
          id="projects-card-heading"
          className="text-base font-semibold text-[var(--ink-primary)]"
        >
          Projects
        </h2>
        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center justify-center gap-1 min-h-[44px] sm:min-h-[28px] px-3 sm:px-2.5 py-1 sm:py-0.5 rounded-full border border-[var(--border-strong)] text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
          <span>New</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-2">
          <ContourGlyph seed="dashboard-projects-empty" size={38} />
          <p className="text-xs text-[var(--ink-secondary)]">No active project streams yet.</p>
          <button
            type="button"
            onClick={onNewProject}
            style={{ color: 'var(--accent)' }}
            className="min-h-[44px] px-3 text-xs font-semibold hover:underline cursor-pointer inline-flex items-center"
          >
            + Create first project
          </button>
        </div>
      ) : (
        <ul className="flex-1 flex flex-col justify-between min-h-0 overflow-hidden divide-y sm:divide-y-0 divide-[var(--border-hairline)]">
          {projects.slice(0, 5).map((project) => {
            const isNew = project.id === lastAddedProjectId;
            return (
              <li
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className={`flex items-center justify-between gap-2.5 py-1.5 sm:p-1 min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] cursor-pointer hover:bg-[var(--surface-sunken)] transition-colors ${
                  isNew ? 'plotline-row-new' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0"
                    title={`Contour glyph for ${project.name}`}
                  >
                    <ContourGlyph seed={project.id} size={36} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--ink-primary)] truncate leading-tight">
                      {project.name}
                    </p>
                    <p className="text-[10px] text-[var(--ink-muted)] truncate leading-tight mt-0.5">
                      Due date: {formatShortDate(project.targetDate)}
                    </p>
                  </div>
                </div>
                <DeleteButton name={project.name} onDelete={() => onDeleteProject(project.id)} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
