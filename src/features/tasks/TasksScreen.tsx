import React, { useMemo, useState } from 'react';
import { Filter, Plus, Search, X } from 'lucide-react';
import type { TaskFilterCriterion, TaskStatus } from '../../domain/types';
import {
  computeTaskFilterCounts,
  filterTasksForBoard,
  groupTasksByStatus,
} from '../../domain/derivations';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { NewTaskModal } from './NewTaskModal';
import { TasksBoardColumn } from './TasksBoardColumn';

const COLUMNS: Array<{ status: TaskStatus; label: string; dotClass: string }> = [
  { status: 'Backlog', label: 'To do', dotClass: 'bg-slate-400' },
  { status: 'In Progress', label: 'In Progress', dotClass: 'bg-amber-500' },
  { status: 'In Review', label: 'In Review', dotClass: 'bg-sky-500' },
  { status: 'Done', label: 'Done', dotClass: 'bg-emerald-500' },
];

export const TasksScreen: React.FC = () => {
  const tasks = useWorkspaceStore((s) => s.tasks);
  const projects = useWorkspaceStore((s) => s.projects);
  const team = useWorkspaceStore((s) => s.team);
  const currentUser = useWorkspaceStore((s) => s.currentUser);
  const globalSearch = useWorkspaceStore((s) => s.searchQuery);
  const moveTask = useWorkspaceStore((s) => s.moveTask);
  const deleteTask = useWorkspaceStore((s) => s.deleteTask);

  const [activeFilters, setActiveFilters] = useState<TaskFilterCriterion[]>([]);
  const [localSearch, setLocalSearch] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>('Backlog');

  const filterCounts = useMemo(
    () => computeTaskFilterCounts(tasks, currentUser.id),
    [tasks, currentUser.id]
  );

  const filteredTasks = useMemo(
    () =>
      filterTasksForBoard(tasks, currentUser.id, activeFilters, globalSearch, localSearch),
    [tasks, currentUser.id, activeFilters, globalSearch, localSearch]
  );

  const groupedTasks = useMemo(() => groupTasksByStatus(filteredTasks), [filteredTasks]);

  const toggleFilter = (criterion: TaskFilterCriterion) => {
    setActiveFilters((prev) =>
      prev.includes(criterion) ? prev.filter((c) => c !== criterion) : [...prev, criterion]
    );
  };

  const handleOpenNewTask = (status: TaskStatus = 'Backlog') => {
    setModalDefaultStatus(status);
    setModalOpen(true);
  };

  const filterButtons: Array<{
    id: TaskFilterCriterion;
    label: string;
    count: number;
  }> = [
    { id: 'my', label: 'My Tasks', count: filterCounts.myCount },
    { id: 'high', label: 'High Priority', count: filterCounts.highCount },
    { id: 'week', label: 'Due This Week', count: filterCounts.weekCount },
  ];

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Tasks
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Drag cards across workflow stages or advance deliverables directly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenNewTask('Backlog')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </span>
          {filterButtons.map((btn) => {
            const active = activeFilters.includes(btn.id);
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => toggleFilter(btn.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer border ${
                  active
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                <span>{btn.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-tabular ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {btn.count}
                </span>
              </button>
            );
          })}
          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilters([])}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter board tasks..."
            className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-slate-200 text-[12px] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <TasksBoardColumn
            key={col.status}
            status={col.status}
            label={col.label}
            dotClass={col.dotClass}
            tasks={groupedTasks[col.status]}
            projects={projects}
            team={team}
            isDragOver={dragOverColumn === col.status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(col.status);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e, targetStatus) => {
              e.preventDefault();
              setDragOverColumn(null);
              const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
              if (taskId) {
                moveTask(taskId, targetStatus);
              }
              setDraggedTaskId(null);
            }}
            onDragStart={(e, taskId) => {
              setDraggedTaskId(taskId);
              e.dataTransfer.setData('text/plain', taskId);
            }}
            onMoveStatus={moveTask}
            onDeleteTask={deleteTask}
            onOpenNewTaskForStatus={handleOpenNewTask}
          />
        ))}
      </div>

      <NewTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultStatus={modalDefaultStatus}
      />
    </div>
  );
};
