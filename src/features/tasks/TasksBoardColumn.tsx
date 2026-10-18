import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import type { Project, TaskItem, TaskStatus, TeamMember } from '../../domain/types';
import { getDoneTasksGrouped } from '../../domain/derivations';
import { TaskCard } from './TaskCard';

interface TasksBoardColumnProps {
  status: TaskStatus;
  label: string;
  dotClass: string;
  tasks: TaskItem[];
  projects: Project[];
  team: TeamMember[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, targetStatus: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onMoveStatus: (taskId: string, nextStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskForStatus: (status: TaskStatus) => void;
}

export const TasksBoardColumn: React.FC<TasksBoardColumnProps> = ({
  status,
  label,
  dotClass,
  tasks,
  projects,
  team,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onMoveStatus,
  onDeleteTask,
  onOpenNewTaskForStatus,
}) => {
  const [showEarlierDone, setShowEarlierDone] = useState(false);

  const doneGroups = status === 'Done' ? getDoneTasksGrouped(tasks) : null;
  const visibleTasks = doneGroups ? doneGroups.recentDone : tasks;
  const earlierDoneTasks = doneGroups ? doneGroups.earlierDone : [];

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
      className={`flex flex-col rounded-[22px] p-3.5 border transition-colors min-h-[480px] ${
        isDragOver
          ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
          : 'bg-slate-100/70 border-slate-200/80'
      }`}
    >
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
          <h3 className="text-[13px] font-bold text-slate-800">{label}</h3>
          <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 text-[11px] font-mono-tabular font-bold border border-slate-200/80">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenNewTaskForStatus(status)}
          aria-label={`Add task to ${label}`}
          className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2.5 flex-1">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            project={projects.find((p) => p.id === task.projectId)}
            assignee={team.find((m) => m.id === task.assigneeId)}
            onMoveStatus={onMoveStatus}
            onDelete={onDeleteTask}
            onDragStart={onDragStart}
          />
        ))}

        {status === 'Done' && earlierDoneTasks.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowEarlierDone((prev) => !prev)}
              className="w-full py-2 px-3 rounded-xl bg-white/80 hover:bg-white border border-slate-200/70 text-[11px] font-bold text-slate-600 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Earlier ({earlierDoneTasks.length})</span>
              {showEarlierDone ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {showEarlierDone && (
              <div className="space-y-2.5 mt-2.5">
                {earlierDoneTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    project={projects.find((p) => p.id === task.projectId)}
                    assignee={team.find((m) => m.id === task.assigneeId)}
                    onMoveStatus={onMoveStatus}
                    onDelete={onDeleteTask}
                    onDragStart={onDragStart}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tasks.length === 0 && (
          <div className="h-32 rounded-2xl border border-dashed border-slate-300/80 flex items-center justify-center text-[12px] text-slate-400">
            No tasks in {label}
          </div>
        )}
      </div>
    </div>
  );
};
