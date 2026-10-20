import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Plus, Search, Trash2, Upload } from 'lucide-react';
import { usePlotlineStore } from '../store';

import { getProjectProgress, getProjectStatus } from '../domain/derivations/projects';
import { pluralize } from '../domain/derivations/analytics';
import { ContourGlyph } from '../utils/contourGlyph';

type StatusFilter = 'all' | 'running' | 'pending' | 'ended';
type SortField = 'dueDate' | 'progress' | 'name';

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

export default function ProjectsScreen() {
  const {
    projects,
    tasks,
    searchQuery,
    setSearchQuery,
    setNewProjectModalOpen,
    setImportModalOpen,
    openProjectDialog,
    deleteProject,
  } = usePlotlineStore();

  // Read status filter from URL query param if present
  const [activeFilter, setActiveFilter] = useState<StatusFilter>(() => {
    if (typeof window === 'undefined') return 'all';
    const hash = window.location.hash || '';
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
      const searchParams = new URLSearchParams(hash.slice(queryIndex));
      const statusParam = searchParams.get('status')?.toLowerCase();
      if (statusParam === 'running' || statusParam === 'pending' || statusParam === 'ended') {
        return statusParam;
      }
    }
    return 'all';
  });

  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Compute live derived statuses, progress, and counts from same store functions as Dashboard
  const projectsWithStatus = useMemo(() => {
    return projects.map((p) => ({
      project: p,
      derivedStatus: getProjectStatus(p, tasks),
      derivedProgress: getProjectProgress(p, tasks),
    }));
  }, [projects, tasks]);

  const counts = useMemo(() => {
    let running = 0;
    let pending = 0;
    let ended = 0;
    projectsWithStatus.forEach(({ derivedStatus }) => {
      if (derivedStatus === 'Running') running++;
      else if (derivedStatus === 'Pending') pending++;
      else if (derivedStatus === 'Ended') ended++;
    });
    return {
      all: projects.length,
      running,
      pending,
      ended,
    };
  }, [projectsWithStatus, projects.length]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = projectsWithStatus.filter(({ project, derivedStatus }) => {
      // Filter chip
      if (activeFilter === 'running' && derivedStatus !== 'Running') return false;
      if (activeFilter === 'pending' && derivedStatus !== 'Pending') return false;
      if (activeFilter === 'ended' && derivedStatus !== 'Ended') return false;

      // Search query
      if (q) {
        const nameMatch = project.name.toLowerCase().includes(q);
        const clientMatch = project.client.toLowerCase().includes(q);
        const codeMatch = project.code.toLowerCase().includes(q);
        const sectorMatch = project.sector.toLowerCase().includes(q);
        if (!nameMatch && !clientMatch && !codeMatch && !sectorMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'dueDate') {
        cmp = (a.project.targetDate || '').localeCompare(b.project.targetDate || '');
      } else if (sortField === 'progress') {
        cmp = a.derivedProgress - b.derivedProgress;
      } else if (sortField === 'name') {
        cmp = a.project.name.localeCompare(b.project.name);
      }
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [projectsWithStatus, activeFilter, searchQuery, sortField, sortAsc]);

  const handleFilterClick = (filter: StatusFilter) => {
    setActiveFilter(filter);
    // Update window location hash without full refresh
    if (typeof window !== 'undefined') {
      if (filter === 'all') {
        window.history.replaceState(null, '', '#/projects');
      } else {
        window.history.replaceState(null, '', `#/projects?status=${filter}`);
      }
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto space-y-5 pb-6 min-w-0">
      {/* Header Row */}
      <div className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
              Projects
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[var(--surface-sunken)] text-[var(--ink-secondary)]">
              {pluralize(filteredProjects.length, 'project')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5">
            Manage, filter, and track project streams across active sectors
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[var(--accent)]" />
            <span>Import</span>
          </button>

          <button
            type="button"
            onClick={() => setNewProjectModalOpen(true)}
            style={{ backgroundColor: 'var(--accent)' }}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer shrink-0 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>New project</span>
          </button>
        </div>
      </div>

      {/* Filter Chips & Controls */}
      <div className="plotline-enter flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2.5">
        {/* Filter Chips */}
        <div
          role="group"
          aria-label="Status filters"
          className="flex items-center gap-1.5 flex-wrap"
        >
          <button
            type="button"
            onClick={() => handleFilterClick('all')}
            style={
              activeFilter === 'all'
                ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                : undefined
            }
            className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? ''
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
            }`}
          >
            All ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => handleFilterClick('running')}
            style={
              activeFilter === 'running'
                ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                : undefined
            }
            className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'running'
                ? ''
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
            }`}
          >
            Running ({counts.running})
          </button>

          <button
            type="button"
            onClick={() => handleFilterClick('pending')}
            style={
              activeFilter === 'pending'
                ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                : undefined
            }
            className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'pending'
                ? ''
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
            }`}
          >
            Pending ({counts.pending})
          </button>

          <button
            type="button"
            onClick={() => handleFilterClick('ended')}
            style={
              activeFilter === 'ended'
                ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                : undefined
            }
            className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'ended'
                ? ''
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
            }`}
          >
            Ended ({counts.ended})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64 min-w-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full h-11 sm:h-auto pl-8 pr-3 py-1.5 text-xs bg-[var(--surface-sunken)] border border-[var(--border-hairline)] rounded-md text-[var(--ink-primary)] placeholder-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-[var(--surface-sunken)] border border-[var(--border-hairline)] rounded-md px-2 py-1 min-h-[44px] sm:min-h-0 shrink-0">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              aria-label="Sort projects by"
              className="text-xs bg-transparent text-[var(--ink-primary)] focus:outline-none cursor-pointer"
            >
              <option value="dueDate">Sort: Due date</option>
              <option value="progress">Sort: Progress</option>
              <option value="name">Sort: Name</option>
            </select>
            <button
              type="button"
              onClick={() => setSortAsc(!sortAsc)}
              className="w-9 h-9 sm:w-auto sm:h-auto p-1 hover:bg-[var(--surface-elevated)] rounded flex items-center justify-center text-[var(--ink-secondary)] transition-colors cursor-pointer"
              title={sortAsc ? 'Ascending' : 'Descending'}
              aria-label={sortAsc ? 'Sort ascending' : 'Sort descending'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects List: Cards on <640px, Table/Rows on >=640px */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-8 flex flex-col items-center justify-center text-center gap-3">
          <ContourGlyph seed="empty-projects-state" size={48} />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
              {searchQuery
                ? 'No projects match your search query'
                : activeFilter === 'running'
                  ? 'No running projects found'
                  : activeFilter === 'pending'
                    ? 'No pending projects found'
                    : activeFilter === 'ended'
                      ? 'No ended projects found'
                      : 'No projects in portfolio'}
            </h2>
            <p className="text-xs text-[var(--ink-secondary)]">
              {searchQuery
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'Create or import projects to track progress and deliverables.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="px-3.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold bg-[var(--surface-sunken)] text-[var(--ink-primary)] border border-[var(--border-strong)] hover:bg-[var(--border-hairline)] cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div
          data-testid="projects-list-container"
          className="flex flex-col gap-3 sm:gap-0 sm:bg-[var(--surface-elevated)] sm:border sm:border-[var(--border-hairline)] sm:rounded-[var(--radius-lg)] sm:overflow-hidden sm:shadow-2xs sm:divide-y sm:divide-[var(--border-hairline)]"
        >
          {filteredProjects.map(({ project, derivedStatus, derivedProgress }) => {
            const projTasks = tasks.filter((t) => t.projectId === project.id);

            return (
              <div
                key={project.id}
                data-testid={`project-item-${project.id}`}
                onClick={() => openProjectDialog(project.id)}
                className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 shadow-2xs sm:bg-transparent sm:border-0 sm:rounded-none sm:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-3 hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer group"
              >
                {/* Top/Left Column: Glyph + Name + Client + Mobile Status Chip */}
                <div className="flex items-start sm:items-center justify-between gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <ContourGlyph
                      seed={project.name}
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg border border-[var(--border-subtle)] shrink-0 transition-transform group-hover:scale-105"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-sunken)] text-[var(--ink-secondary)] shrink-0">
                          {project.code}
                        </span>
                        <h2 className="text-sm font-semibold text-[var(--ink-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                          {project.name}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[var(--ink-secondary)] mt-0.5 truncate">
                        <span className="truncate">{project.client}</span>
                        <span>·</span>
                        <span className="truncate">{project.sector}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Status Chip */}
                  <span
                    className={`sm:hidden px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                      derivedStatus === 'Ended'
                        ? 'bg-[#E8F4EC] text-[#216E3E]'
                        : derivedStatus === 'Running'
                          ? 'bg-[#FEF5E6] text-[#9B5B0B]'
                          : 'bg-[#EEEBF9] text-[#5B43B8]'
                    }`}
                  >
                    {derivedStatus}
                  </span>
                </div>

                {/* Card Details / Row Middle & Right Columns */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 shrink-0 pt-2.5 sm:pt-0 border-t border-[var(--border-hairline)] sm:border-0">
                  {/* Progress Bar */}
                  <div className="w-full sm:w-28 space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-[var(--ink-secondary)]">Progress</span>
                      <span className="tabular-nums text-[var(--ink-primary)]">
                        {derivedProgress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--surface-sunken)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] transition-all duration-300"
                        style={{ width: `${derivedProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full sm:w-auto">
                    {/* Due Date */}
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-[var(--ink-muted)] uppercase font-semibold">
                        Due Date
                      </div>
                      <div className="text-xs font-mono font-medium text-[var(--ink-primary)]">
                        {formatShortDate(project.targetDate)}
                      </div>
                    </div>

                    {/* Desktop Status Chip */}
                    <span
                      className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        derivedStatus === 'Ended'
                          ? 'bg-[#E8F4EC] text-[#216E3E]'
                          : derivedStatus === 'Running'
                            ? 'bg-[#FEF5E6] text-[#9B5B0B]'
                            : 'bg-[#EEEBF9] text-[#5B43B8]'
                      }`}
                    >
                      {derivedStatus}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Task Count / Zero Task State */}
                      {projTasks.length > 0 ? (
                        <span className="text-xs text-[var(--ink-secondary)] font-mono shrink-0 sm:w-20 text-right">
                          {pluralize(projTasks.length, 'task')}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs text-[var(--ink-muted)] italic hidden md:inline">
                            No tasks yet
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openProjectDialog(project.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[36px] sm:min-h-0 rounded-full text-[11px] font-semibold bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-[var(--ink-primary)] hover:bg-[var(--border-hairline)] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-[var(--accent)]" />
                            <span>Add task</span>
                          </button>
                        </div>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        aria-label={`Delete project ${project.name}`}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] sm:w-8 sm:h-8 sm:min-w-0 sm:min-h-0 rounded-md hover:bg-red-50 flex items-center justify-center text-[var(--ink-muted)] hover:text-red-600 transition-colors cursor-pointer shrink-0"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
