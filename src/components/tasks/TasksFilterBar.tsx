import React from 'react';
import { TaskItem } from '../../store';
import { ContourGlyph } from '../../utils/contourGlyph';
import { pluralize } from '../../utils/string';
import { FilterCriterion, STAGE_COLUMNS } from './types';

export interface TasksFilterBarProps {
  activeFilters: FilterCriterion[];
  onClearFilters: () => void;
  onToggleFilter: (criterion: FilterCriterion) => void;
  filteredTasks: TaskItem[];
  totalTasksCount: number;
  activeMobileStage: TaskItem['status'];
  onSelectMobileStage: (stage: TaskItem['status']) => void;
  onNewTask: () => void;
}

export function TasksFilterBar({
  activeFilters,
  onClearFilters,
  onToggleFilter,
  filteredTasks,
  totalTasksCount,
  activeMobileStage,
  onSelectMobileStage,
  onNewTask,
}: TasksFilterBarProps) {
  return (
    <>
      {/* Filter Bar + Right-Aligned "N tasks shown" */}
      <div
        style={{ '--stagger-index': 1 } as React.CSSProperties}
        className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2.5"
      >
        <div role="group" aria-label="Task filters" className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onClearFilters}
            aria-pressed={activeFilters.length === 0}
            style={
              activeFilters.length === 0
                ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                : undefined
            }
            className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeFilters.length === 0
                ? ''
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => onToggleFilter('my')}
            aria-pressed={activeFilters.includes('my')}
            style={
              activeFilters.includes('my')
                ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                : undefined
            }
            className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeFilters.includes('my')
                ? ''
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
            }`}
          >
            My tasks
          </button>

          <button
            type="button"
            onClick={() => onToggleFilter('high')}
            aria-pressed={activeFilters.includes('high')}
            style={
              activeFilters.includes('high')
                ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                : undefined
            }
            className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeFilters.includes('high')
                ? ''
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
            }`}
          >
            High priority
          </button>

          <button
            type="button"
            onClick={() => onToggleFilter('week')}
            aria-pressed={activeFilters.includes('week')}
            style={
              activeFilters.includes('week')
                ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                : undefined
            }
            className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeFilters.includes('week')
                ? ''
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
            }`}
          >
            Due this week
          </button>
        </div>

        <span
          data-testid="tasks-shown-count"
          className="text-xs font-semibold font-ui-tabular text-[var(--ink-secondary)] px-2 sm:text-right whitespace-nowrap"
        >
          {pluralize(filteredTasks.length, 'task')} shown
        </span>
      </div>

      {/* Mobile Stage Segmented Control (<640px) */}
      <div
        role="tablist"
        aria-label="Task stages"
        data-testid="mobile-stage-segmented-control"
        className="sm:hidden grid grid-cols-4 gap-1 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-1"
      >
        {STAGE_COLUMNS.map((col) => {
          const count = filteredTasks.filter((t) => t.status === col.id).length;
          const isSelected = activeMobileStage === col.id;
          return (
            <button
              key={col.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectMobileStage(col.id)}
              style={
                isSelected ? { backgroundColor: 'var(--accent)', color: '#ffffff' } : undefined
              }
              className={`min-h-[44px] px-1.5 py-1.5 rounded-[var(--radius-md)] text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer min-w-0 ${
                isSelected
                  ? 'shadow-2xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
              }`}
            >
              <span className="truncate max-w-full leading-tight">{col.title}</span>
              <span
                className={`text-[10px] font-ui-tabular px-1.5 py-0.2 rounded-full leading-tight ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--surface-sunken)] text-[var(--ink-muted)]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div
          data-testid="tasks-empty-state"
          className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 flex flex-col items-center justify-center text-center gap-2.5"
        >
          <ContourGlyph seed="tasks-board-empty-state" size={48} />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
              {totalTasksCount === 0
                ? 'No tasks in the workspace yet'
                : 'No tasks match your active filters'}
            </h2>
            <p className="text-xs text-[var(--ink-secondary)]">
              {totalTasksCount === 0
                ? 'Create a deliverable to begin tracking progress across stages.'
                : 'Try clearing your filter selection or creating a new project.'}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={onClearFilters}
                className="px-3.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold bg-[var(--surface-sunken)] text-[var(--ink-primary)] border border-[var(--border-strong)] hover:bg-[var(--border-hairline)] cursor-pointer"
              >
                Reset filters
              </button>
            )}
            <button
              type="button"
              onClick={onNewTask}
              style={{ backgroundColor: 'var(--accent)' }}
              className="px-3.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold text-white hover:opacity-95 cursor-pointer"
            >
              + New task
            </button>
          </div>
        </div>
      )}
    </>
  );
}
