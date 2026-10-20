import React, { useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { CheckSquare, Clock, MoreHorizontal, Timer } from 'lucide-react';
import { TaskItem, TeamMember, usePlotlineStore } from '../../store';
import { formatLoggedDuration } from '../../domain/derivations/time';
import { getTodayIsoDate } from '../../lib/clock';
import { MotionCard } from '../../motion/primitives';
import { DeleteButton } from '../DeleteButton';
import { AnchoredPopover } from '../../ui/Popover';
import { STAGE_COLUMNS } from './types';

function computeDaysLeftLabel(dueDateIso: string, status: TaskItem['status']): string {
  if (status === 'Done') return 'Completed';
  const today = new Date(`${getTodayIsoDate()}T00:00:00`);
  const due = new Date(`${dueDateIso}T00:00:00`);
  if (Number.isNaN(due.getTime())) return dueDateIso;
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Due today';
  return `${diffDays}d left`;
}

export function priorityChipStyle(priority: TaskItem['priority']): {
  bg: string;
  fg: string;
  border: string;
} {
  switch (priority) {
    case 'High':
      return { bg: '#FBECEE', fg: '#B43342', border: '#F1B9C0' };
    case 'Medium':
      return { bg: '#FEF5E6', fg: '#9B5B0B', border: '#F5D69E' };
    case 'Low':
    default:
      return { bg: '#E8F4EC', fg: '#216E3E', border: '#B5DFC4' };
  }
}

export interface TaskCardViewProps {
  task: TaskItem;
  teamMap: Map<string, TeamMember>;
  isRunningFocus: boolean;
  onMoveTask?: (taskId: string, newStatus: TaskItem['status']) => void;
  onSelectFocusTask?: (taskId: string) => void;
  isOverlay?: boolean;
}

export function TaskCardContent({
  task,
  teamMap,
  isRunningFocus,
  onMoveTask,
  onSelectFocusTask,
  isOverlay = false,
}: TaskCardViewProps) {
  const { deleteTask } = usePlotlineStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const prioStyle = priorityChipStyle(task.priority);
  const primaryMember = teamMap.get(task.assigneeId);
  const coMember = task.coAssigneeId ? teamMap.get(task.coAssigneeId) : undefined;
  const daysLeft = computeDaysLeftLabel(task.dueDate, task.status);

  return (
    <div
      data-testid={isOverlay ? `task-card-overlay-${task.id}` : `task-card-${task.id}`}
      style={{ touchAction: 'manipulation' }}
      className={`touch-manipulation bg-[var(--surface-elevated)] border rounded-[var(--radius-md)] p-3.5 space-y-3 select-none transition-shadow ${
        isOverlay
          ? 'shadow-xl border-[var(--accent)] cursor-grabbing'
          : isRunningFocus
            ? 'border-[var(--accent)] shadow-xs'
            : 'border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
      }`}
    >
      {/* Top Row: Category chip + Priority chip + Running badge + "…" menu */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] font-medium bg-[var(--surface-sunken)] text-[var(--ink-secondary)] whitespace-nowrap">
            {task.category || 'Engineering'}
          </span>
          <span
            style={{
              backgroundColor: prioStyle.bg,
              color: prioStyle.fg,
              borderColor: prioStyle.border,
            }}
            className="px-2 py-0.5 rounded-[var(--radius-xs)] border text-[11px] font-medium whitespace-nowrap"
          >
            {task.priority}
          </span>
          {isRunningFocus && (
            <span
              data-testid={`task-running-badge-${task.id}`}
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent)',
                borderColor: 'var(--accent-border)',
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] border text-[11px] font-semibold whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
              <span>Running</span>
            </span>
          )}
        </div>

        {/* "…" Move To Menu */}
        <div className="relative shrink-0">
          <button
            ref={menuTriggerRef}
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            aria-label={`Task actions for ${task.title}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -m-2 sm:m-0 sm:w-7 sm:h-7 sm:min-w-0 sm:min-h-0 rounded-[var(--radius-xs)] flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {onMoveTask && (
            <AnchoredPopover
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              triggerRef={menuTriggerRef}
              placement="bottom"
              title={task.title}
              role="menu"
              className="w-48 bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-lg p-1.5 text-xs"
            >
              <div
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <span className="block px-2 py-1 text-[10px] font-semibold text-[var(--ink-muted)] uppercase">
                  Move to…
                </span>
                {STAGE_COLUMNS.map((col) => {
                  const isCurrent = task.status === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      role="menuitem"
                      disabled={isCurrent}
                      onClick={() => {
                        onMoveTask(task.id, col.id);
                        setMenuOpen(false);
                      }}
                      className={`w-full min-h-[44px] sm:min-h-0 text-left px-2.5 py-2 sm:py-1.5 rounded-[var(--radius-xs)] flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'text-[var(--ink-muted)] bg-[var(--surface-sunken)] cursor-default font-medium'
                          : 'text-[var(--ink-primary)] hover:bg-[var(--accent-soft)] cursor-pointer'
                      }`}
                    >
                      <span>{col.title}</span>
                      {isCurrent && <span className="text-[10px]">Current</span>}
                    </button>
                  );
                })}
                {onSelectFocusTask && (
                  <div className="mt-1 pt-1 border-t border-[var(--border-hairline)] space-y-0.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onSelectFocusTask(task.id);
                        setMenuOpen(false);
                      }}
                      className="w-full min-h-[44px] sm:min-h-0 text-left px-2.5 py-2 sm:py-1.5 rounded-[var(--radius-xs)] text-[var(--ink-primary)] hover:bg-[var(--accent-soft)] cursor-pointer flex items-center gap-1.5 font-medium"
                    >
                      <Timer className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                      <span>Set as Focus task</span>
                    </button>

                    <div className="flex items-center justify-between px-2.5 py-1 rounded-[var(--radius-xs)] hover:bg-[var(--surface-sunken)]">
                      <span className="text-xs text-[var(--ink-secondary)]">Delete task</span>
                      <DeleteButton
                        name={task.code}
                        onDelete={() => {
                          deleteTask(task.id);
                          setMenuOpen(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </AnchoredPopover>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h3 className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)] leading-snug">
        {task.title}
      </h3>

      {/* Thin Progress Bar */}
      <div className="space-y-1">
        <div className="h-1.5 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden">
          <div
            style={{
              width: `${Math.min(100, Math.max(0, task.progress ?? 40))}%`,
              backgroundColor: 'var(--accent)',
            }}
            className="h-full rounded-full transition-all duration-200 ease-plotline"
          />
        </div>
      </div>

      {/* Footer: days-left, subtask count, total/logged focus time, avatar(s) */}
      <div className="pt-1 flex items-center justify-between gap-2 text-[11px] text-[var(--ink-secondary)]">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3 text-[var(--ink-muted)] shrink-0" />
            <span>{daysLeft}</span>
          </span>

          <span className="inline-flex items-center gap-1 whitespace-nowrap text-[var(--ink-muted)]">
            <CheckSquare className="w-3 h-3 shrink-0" />
            <span className="font-ui-tabular">
              {task.subtasksDone ?? 2}/{task.subtasksTotal ?? 4}
            </span>
          </span>

          <span
            data-testid={`task-total-${task.id}`}
            className="inline-flex items-center gap-1 whitespace-nowrap font-ui-tabular font-medium"
            style={{ color: task.loggedSeconds ? 'var(--accent)' : 'var(--ink-muted)' }}
          >
            <Timer className="w-3 h-3 shrink-0" />
            <span>
              {task.estimateHours}h
              {task.loggedSeconds ? ` (+${formatLoggedDuration(task.loggedSeconds)})` : ''}
            </span>
          </span>
        </div>

        {/* Avatar(s) */}
        <div className="flex items-center -space-x-1.5 shrink-0">
          {primaryMember && (
            <span
              title={primaryMember.name}
              style={{ backgroundColor: 'var(--accent)' }}
              className="w-6 h-6 rounded-full border-2 border-[var(--surface-elevated)] flex items-center justify-center text-[10px] font-semibold text-white"
            >
              {primaryMember.initials}
            </span>
          )}
          {coMember && (
            <span
              title={coMember.name}
              style={{ backgroundColor: 'var(--accent-deep)' }}
              className="w-6 h-6 rounded-full border-2 border-[var(--surface-elevated)] flex items-center justify-center text-[10px] font-semibold text-white"
            >
              {coMember.initials}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export interface DraggableTaskCardProps {
  task: TaskItem;
  teamMap: Map<string, TeamMember>;
  isRunningFocus: boolean;
  isHighlighted?: boolean;
  dragDisabled?: boolean;
  onMoveTask: (taskId: string, newStatus: TaskItem['status']) => void;
  onSelectFocusTask: (taskId: string) => void;
}

export function DraggableTaskCard({
  task,
  teamMap,
  isRunningFocus,
  isHighlighted = false,
  dragDisabled = false,
  onMoveTask,
  onSelectFocusTask,
}: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: dragDisabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    touchAction: 'manipulation',
  };

  return (
    <div
      id={`task-card-${task.id}`}
      ref={setNodeRef}
      style={style}
      {...(dragDisabled ? {} : listeners)}
      {...(dragDisabled ? {} : attributes)}
      className={`touch-manipulation ${
        dragDisabled ? '' : 'cursor-grab active:cursor-grabbing'
      } focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded-[var(--radius-md)] ${
        isDragging ? 'opacity-35' : ''
      } ${isHighlighted ? 'ring-2 ring-[var(--accent)] bg-[var(--accent-soft)] transition-all duration-300' : ''}`}
    >
      <MotionCard
        whileHover={
          isDragging || dragDisabled
            ? undefined
            : { y: -2, boxShadow: '0 10px 24px rgba(22, 22, 21, 0.08)' }
        }
        className="rounded-[var(--radius-md)]"
      >
        <TaskCardContent
          task={task}
          teamMap={teamMap}
          isRunningFocus={isRunningFocus}
          onMoveTask={onMoveTask}
          onSelectFocusTask={onSelectFocusTask}
        />
      </MotionCard>
    </div>
  );
}
