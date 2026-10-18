import React, { useMemo, useState } from 'react';
import { ArrowUpDown, FolderKanban, Plus } from 'lucide-react';
import type { ProjectSortField, ProjectStatusFilter } from '../../domain/types';
import {
  computeProjectStatusCounts,
  filterAndSortProjects,
  getProjectProgress,
  getProjectStatus,
  getProjectTaskSummary,
} from '../../domain/derivations';
import { contourGlyph } from '../../lib/contourGlyph';
import { formatShortDate } from '../../lib/format';
import { ACCENT_THEMES } from '../../lib/theme';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { DeleteButton } from '../../ui/DeleteButton';
import { ProgressBar } from '../../ui/ProgressBar';
import { ProjectStatusChip } from '../../ui/StatusChips';

export const ProjectsScreen: React.FC = () => {
  const projects = useWorkspaceStore((s) => s.projects);
  const tasks = useWorkspaceStore((s) => s.tasks);
  const team = useWorkspaceStore((s) => s.team);
  const accent = useWorkspaceStore((s) => s.accent);
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const lastAddedProjectId = useWorkspaceStore((s) => s.lastAddedProjectId);
  const setNewProjectModalOpen = useWorkspaceStore((s) => s.setNewProjectModalOpen);
  const deleteProject = useWorkspaceStore((s) => s.deleteProject);
  const openProjectDialog = useWorkspaceStore((s) => s.openProjectDialog);

  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all');
  const [sortField, setSortField] = useState<ProjectSortField>('dueDate');

  const counts = useMemo(
    () => computeProjectStatusCounts(projects, tasks),
    [projects, tasks]
  );

  const filteredProjects = useMemo(
    () =>
      filterAndSortProjects(projects, tasks, team, {
        statusFilter,
        sortField,
        searchQuery,
      }),
    [projects, tasks, team, statusFilter, sortField, searchQuery]
  );

  const accentHex = ACCENT_THEMES[accent]?.hex || ACCENT_THEMES.tide.hex;

  const filterChips: Array<{ id: ProjectStatusFilter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: counts.totalCount },
    { id: 'running', label: 'Running', count: counts.runningCount },
    { id: 'pending', label: 'Pending', count: counts.pendingCount },
    { id: 'ended', label: 'Ended', count: counts.endedCount },
  ];

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Projects
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Track milestones, deliverable completion, and target launch dates across the studio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewProjectModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {filterChips.map((chip) => {
            const active = statusFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer border ${
                  active
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-tabular ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <label htmlFor="project-sort-select" className="text-[11px] font-semibold text-slate-500">
            Sort by:
          </label>
          <select
            id="project-sort-select"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as ProjectSortField)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-slate-800 focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="dueDate">Due date</option>
            <option value="progress">Progress</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 pl-5 pr-3">Project</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Lead</th>
                <th className="py-3.5 px-3">Tasks</th>
                <th className="py-3.5 px-3 min-w-[160px]">Progress</th>
                <th className="py-3.5 px-3">Target Date</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {filteredProjects.map((project) => {
                const status = getProjectStatus(project, tasks);
                const progress = getProjectProgress(project, tasks);
                const taskSummary = getProjectTaskSummary(project.id, tasks);
                const lead = team.find((m) => m.id === project.leadId);
                const isNew = lastAddedProjectId === project.id;

                return (
                  <tr
                    key={project.id}
                    onClick={() => openProjectDialog(project.id)}
                    className={`hover:bg-slate-50/90 transition-colors cursor-pointer group ${
                      isNew ? 'animate-row-highlight' : ''
                    }`}
                  >
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={contourGlyph(project.id, accentHex)}
                          alt=""
                          className="w-9 h-9 rounded-xl shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-[var(--accent)] transition-colors truncate">
                            {project.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            <span className="font-mono-tabular font-semibold text-slate-400">
                              {project.code}
                            </span>{' '}
                            · {project.client}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <ProjectStatusChip status={status} />
                    </td>

                    <td className="py-3.5 px-3">
                      {lead ? (
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                            {lead.initials}
                          </span>
                          <span className="text-[12px] font-medium text-slate-700 truncate">
                            {lead.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[12px] text-slate-400">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono-tabular text-[12px] text-slate-600">
                      <span className="font-bold text-slate-800">{taskSummary.doneCount}</span> /{' '}
                      {taskSummary.totalCount} done
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 min-w-[90px]">
                          <ProgressBar value={progress} />
                        </div>
                        <span className="text-[12px] font-bold font-mono-tabular text-slate-700 w-9 text-right">
                          {progress}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono-tabular text-[12px] text-slate-600 whitespace-nowrap">
                      {formatShortDate(project.targetDate)}
                    </td>

                    <td
                      className="py-3.5 pl-3 pr-5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DeleteButton
                        label={`Delete project ${project.name}`}
                        onConfirm={() => deleteProject(project.id)}
                      />
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FolderKanban className="w-8 h-8 mb-2 stroke-1" />
                      <p className="text-[13px] font-semibold text-slate-600">
                        No matching projects
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Adjust your status filter or search query.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
