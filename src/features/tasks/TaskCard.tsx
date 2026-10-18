import React from 'react';
import { ArrowRight, Calendar, CheckSquare, Clock } from 'lucide-react';
import type { Project, TaskItem, TaskStatus, TeamMember } from '../../domain/types';
import { computeDaysLeftLabel } from '../../lib/dates';
import { formatDuration } from '../../lib/format';
import { DeleteButton } from '../../ui/DeleteButton';
import { PriorityChip } from '../../ui/StatusChips';

interface TaskCardProps {
  task: TaskItem;
  project?: Project;
  assignee?: TeamMember;
  onMoveStatus: (taskId: string, nextStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const NEXT_STATUS_MAP: Record<TaskStatus, TaskStatus> = {
  Backlog: 'In Progress',
  'In Progress': 'In Review',
  'In Review': 'Done',
  Done: 'In Progress',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  project,
  assignee,
  onMoveStatus,
  onDelete,
  onDragStart,
}) => {
  const dueLabel = computeDaysLeftLabel(task.dueDate, task.status);
  const isOverdue = dueLabel.includes('overdue');
  const loggedSecs = task.loggedSeconds || 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-white rounded-2xl p-3.5 border border-[#E6E8EE] shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono-tabular font-bold text-slate-400">
            {task.code}
          </span>
          <PriorityChip priority={task.priority} />
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onMoveStatus(task.id, NEXT_STATUS_MAP[task.status])}
            title={`Advance to ${NEXT_STATUS_MAP[task.status]}`}
            className="w-6 h-6 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-[var(--accent)] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <DeleteButton
            label={`Delete task ${task.code}`}
            onConfirm={() => onDelete(task.id)}
          />
        </div>
      </div>

      <h4 className="text-[13px] font-bold text-slate-900 leading-snug mb-1.5">
        {task.title}
      </h4>

      {project && (
        <div className="text-[11px] font-medium text-slate-500 truncate mb-3">
          {project.name}
        </div>
      )}

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2.5 font-mono-tabular">
          <span className="inline-flex items-center gap-1" title="Subtasks completed">
            <CheckSquare className="w-3 h-3 text-slate-400" />
            {task.subtasksDone}/{task.subtasksTotal}
          </span>

          {loggedSecs > 0 && (
            <span className="inline-flex items-center gap-1 text-slate-600" title="Logged focus time">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatDuration(loggedSecs)}
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1 ${
              isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {dueLabel}
          </span>
        </div>

        {assignee && (
          <span
            title={assignee.name}
            className="w-6 h-6 rounded-full bg-slate-900 text-white text-[9px] font-bold inline-flex items-center justify-center shrink-0"
          >
            {assignee.initials}
          </span>
        )}
      </div>
    </div>
  );
};
