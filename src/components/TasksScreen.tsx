import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  closestCorners,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardCode,
  KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, useReducedMotion } from 'motion/react';
import { CheckSquare, Clock, MoreHorizontal, Plus, Timer } from 'lucide-react';
import { TaskItem, TeamMember, usePlotlineStore } from '../store';
import { formatLoggedDuration } from '../domain/derivations/time';
import { getTodayIsoDate } from '../lib/clock';
import { ContourGlyph } from '../utils/contourGlyph';
import { MotionCard, PLOTLINE_DURATION, PLOTLINE_EASE } from '../motion/primitives';
import { DeleteButton } from './DeleteButton';
import { AnchoredPopover } from '../ui/Popover';

type FilterCriterion = 'my' | 'high' | 'week';

interface StageColumn {
  id: TaskItem['status'];
  title: string;
}

const STAGE_COLUMNS: StageColumn[] = [
  { id: 'Backlog', title: 'To do' },
  { id: 'In Progress', title: 'In progress' },
  { id: 'In Review', title: 'In review' },
  { id: 'Done', title: 'Done' },
];

const STAGE_IDS: TaskItem['status'][] = STAGE_COLUMNS.map((col) => col.id);

const stageKeyboardCoordinateGetter: KeyboardCoordinateGetter = (
  event,
  { context, currentCoordinates }
) => {
  const { code } = event;
  if (
    code !== KeyboardCode.Right &&
    code !== KeyboardCode.Left &&
    code !== KeyboardCode.Down &&
    code !== KeyboardCode.Up
  ) {
    return undefined;
  }

  let currentStageId = context.over?.id as TaskItem['status'] | undefined;
  if (!currentStageId || !STAGE_IDS.includes(currentStageId)) {
    let bestDist = Infinity;
    for (const stageId of STAGE_IDS) {
      const rect = context.droppableRects.get(stageId);
      if (!rect) continue;
      const dx = rect.left - currentCoordinates.x;
      const dy = rect.top - currentCoordinates.y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        currentStageId = stageId;
      }
    }
  }

  if (!currentStageId || !STAGE_IDS.includes(currentStageId)) {
    const taskData = context.active?.data?.current?.task as TaskItem | undefined;
    currentStageId = taskData?.status ?? 'Backlog';
  }

  const currentIndex = STAGE_IDS.indexOf(currentStageId);
  const delta = code === KeyboardCode.Right || code === KeyboardCode.Down ? 1 : -1;
  const nextIndex = Math.max(0, Math.min(STAGE_IDS.length - 1, currentIndex + delta));
  const targetStageId = STAGE_IDS[nextIndex];
  const targetRect = context.droppableRects.get(targetStageId);

  if (!targetRect) {
    return undefined;
  }

  const activeWidth = context.collisionRect?.width ?? 240;
  const activeHeight = context.collisionRect?.height ?? 140;

  let nextX = targetRect.left + Math.max(8, (targetRect.width - activeWidth) / 2);
  const nextY = targetRect.top + Math.max(36, Math.min(80, (targetRect.height - activeHeight) / 2));

  if (Math.abs(nextX - currentCoordinates.x) < 1) {
    nextX += delta;
  }

  return {
    x: nextX,
    y: nextY,
  };
};

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

function isDueWithinWeek(dueDateIso: string): boolean {
  const today = new Date(`${getTodayIsoDate()}T00:00:00`);
  const due = new Date(`${dueDateIso}T00:00:00`);
  if (Number.isNaN(due.getTime())) return false;
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
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

interface TaskCardViewProps {
  task: TaskItem;
  teamMap: Map<string, TeamMember>;
  isRunningFocus: boolean;
  onMoveTask?: (taskId: string, newStatus: TaskItem['status']) => void;
  onSelectFocusTask?: (taskId: string) => void;
  isOverlay?: boolean;
}

function TaskCardContent({
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

interface DraggableTaskCardProps {
  task: TaskItem;
  teamMap: Map<string, TeamMember>;
  isRunningFocus: boolean;
  isHighlighted?: boolean;
  dragDisabled?: boolean;
  onMoveTask: (taskId: string, newStatus: TaskItem['status']) => void;
  onSelectFocusTask: (taskId: string) => void;
}

function DraggableTaskCard({
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

interface DroppableStageColumnProps {
  column: StageColumn;
  staggerIndex: number;
  tasks: TaskItem[];
  teamMap: Map<string, TeamMember>;
  timerRunning: boolean;
  timerTaskId: string;
  activeDragTaskId: string | null;
  highlightedTaskId?: string | null;
  isActiveMobileColumn: boolean;
  isMobileViewport: boolean;
  onMoveTask: (taskId: string, newStatus: TaskItem['status']) => void;
  onSelectFocusTask: (taskId: string) => void;
}

function DroppableStageColumn({
  column,
  staggerIndex,
  tasks,
  teamMap,
  timerRunning,
  timerTaskId,
  activeDragTaskId,
  highlightedTaskId,
  isActiveMobileColumn,
  isMobileViewport,
  onMoveTask,
  onSelectFocusTask,
}: DroppableStageColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
    data: { stage: column.id },
  });

  return (
    <section
      aria-label={`${column.title} column`}
      style={
        {
          '--stagger-index': staggerIndex,
          ...(isOver && activeDragTaskId
            ? {
                outline: '2px solid var(--accent)',
                outlineOffset: '-2px',
                backgroundColor: 'var(--accent-soft)',
              }
            : {}),
        } as React.CSSProperties
      }
      className={`plotline-enter bg-[var(--surface-sunken)]/70 border border-[var(--border-hairline)] rounded-[var(--radius-lg)] flex-col min-h-[160px] lg:min-h-[420px] overflow-y-auto overflow-x-hidden min-w-0 transition-colors duration-160 ease-plotline ${
        isActiveMobileColumn ? 'flex' : 'hidden sm:flex'
      }`}
    >
      <div
        ref={setNodeRef}
        data-droppable-stage={column.id}
        className="flex-1 flex flex-col gap-3 p-3 min-h-[120px]"
      >
        {/* Column Header + Count */}
        <div className="flex items-center justify-between px-1 pt-0.5 shrink-0">
          <h2 className="text-sm font-semibold text-[var(--ink-primary)]">{column.title}</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold font-ui-tabular bg-[var(--surface-elevated)] border border-[var(--border-hairline)] text-[var(--ink-secondary)]">
            {tasks.length}
          </span>
        </div>

        {/* Cards Stack */}
        <div className="flex-1 flex flex-col gap-2.5 min-h-[120px]">
          {tasks.length === 0 ? (
            <div className="flex-1 min-h-[120px] rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] flex flex-col items-center justify-center p-4 text-center gap-2">
              <ContourGlyph seed={`empty-col-${column.id}`} size={44} />
              <span className="text-xs text-[var(--ink-muted)]">
                {isMobileViewport ? 'No tasks in this stage' : 'Drop a task card here'}
              </span>
            </div>
          ) : (
            tasks.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                teamMap={teamMap}
                isRunningFocus={timerRunning && task.id === timerTaskId}
                isHighlighted={task.id === highlightedTaskId}
                dragDisabled={isMobileViewport}
                onMoveTask={onMoveTask}
                onSelectFocusTask={onSelectFocusTask}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default function TasksScreen() {
  const {
    tasks,
    team,
    currentUser,
    searchQuery,
    timerRunning,
    timerTaskId,
    setNewTaskModalOpen,
    moveTask,
    setTimerTask,
    pushToast,
  } = usePlotlineStore();

  const reducedMotion = useReducedMotion();

  // Combinable filter tabs: All (clears filters) or any combination of My tasks / High priority / Due this week
  const [activeFilters, setActiveFilters] = useState<FilterCriterion[]>([]);
  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [activeMobileStage, setActiveMobileStage] = useState<TaskItem['status']>('Backlog');
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash || '';
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
      const params = new URLSearchParams(hash.slice(queryIndex));
      const targetId = params.get('taskId') || params.get('highlight');
      if (targetId) {
        const foundTask = tasks.find((t) => t.id === targetId);
        if (foundTask) {
          setActiveMobileStage(foundTask.status);
        }
        setHighlightedTaskId(targetId);
        setTimeout(() => {
          const el = document.getElementById(`task-card-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 120);
        const timer = setTimeout(() => {
          setHighlightedTaskId(null);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [tasks]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: stageKeyboardCoordinateGetter,
    })
  );

  // Prevent native touch page scrolling once the long-press drag activates on >=640px
  useEffect(() => {
    if (!activeDragTaskId) return;
    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', handleTouchMove, {
      passive: false,
      capture: true,
    });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove, {
        capture: true,
      });
    };
  }, [activeDragTaskId]);

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCorners(args);
  }, []);

  const teamMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    for (const m of team) {
      map.set(m.id, m);
    }
    return map;
  }, [team]);

  const toggleFilter = (criterion: FilterCriterion) => {
    setActiveFilters((prev) =>
      prev.includes(criterion) ? prev.filter((item) => item !== criterion) : [...prev, criterion]
    );
  };

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      if (q && !task.title.toLowerCase().includes(q) && !task.category.toLowerCase().includes(q)) {
        return false;
      }
      if (
        activeFilters.includes('my') &&
        task.assigneeId !== currentUser.id &&
        task.coAssigneeId !== currentUser.id
      ) {
        return false;
      }
      if (activeFilters.includes('high') && task.priority !== 'High') {
        return false;
      }
      if (activeFilters.includes('week') && !isDueWithinWeek(task.dueDate)) {
        return false;
      }
      return true;
    });
  }, [tasks, activeFilters, currentUser.id, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragTaskId(String(event.active.id));
  };

  const handleDragCancel = () => {
    setActiveDragTaskId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragTaskId(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const overId = String(over.id);

    let targetStage: TaskItem['status'] | null = null;
    if (STAGE_COLUMNS.some((col) => col.id === overId)) {
      targetStage = overId as TaskItem['status'];
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) targetStage = overTask.status;
    }

    if (targetStage) {
      moveTask(taskId, targetStage);
      setTimeout(() => {
        const cardEl = document.getElementById(`task-card-${taskId}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 40);
    }
  };

  const handleSelectFocusTask = (taskId: string) => {
    setTimerTask(taskId);
    const found = tasks.find((t) => t.id === taskId);
    if (found) {
      pushToast(`Focus target set to ${found.code}`, found.title);
    }
  };

  const draggedTask = activeDragTaskId
    ? tasks.find((t) => t.id === activeDragTaskId) || null
    : null;

  return (
    <div className="max-w-[1360px] mx-auto space-y-4 sm:space-y-5 pb-6 min-w-0">
      {/* Header Row */}
      <div
        style={{ '--stagger-index': 0 } as React.CSSProperties}
        className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">Tasks</h1>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5">
            Drag a card to another stage, or use its menu to move it
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewTaskModalOpen(true)}
          style={{ backgroundColor: 'var(--accent)' }}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer shrink-0 self-start sm:self-auto shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>New task</span>
        </button>
      </div>

      {/* Filter Bar + Right-Aligned "N tasks shown" */}
      <div
        style={{ '--stagger-index': 1 } as React.CSSProperties}
        className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2.5"
      >
        <div role="group" aria-label="Task filters" className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveFilters([])}
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
            onClick={() => toggleFilter('my')}
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
            onClick={() => toggleFilter('high')}
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
            onClick={() => toggleFilter('week')}
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
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} shown
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
              onClick={() => setActiveMobileStage(col.id)}
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
              {tasks.length === 0
                ? 'No tasks in the workspace yet'
                : 'No tasks match your active filters'}
            </h2>
            <p className="text-xs text-[var(--ink-secondary)]">
              {tasks.length === 0
                ? 'Create a deliverable to begin tracking progress across stages.'
                : 'Try clearing your filter selection or dispatching a new deliverable.'}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilters([])}
                className="px-3.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold bg-[var(--surface-sunken)] text-[var(--ink-primary)] border border-[var(--border-strong)] hover:bg-[var(--border-hairline)] cursor-pointer"
              >
                Reset filters
              </button>
            )}
            <button
              type="button"
              onClick={() => setNewTaskModalOpen(true)}
              style={{ backgroundColor: 'var(--accent)' }}
              className="px-3.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold text-white hover:opacity-95 cursor-pointer"
            >
              + New task
            </button>
          </div>
        </div>
      )}

      {/* Four Stage Columns with @dnd-kit Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        autoScroll={
          typeof window !== 'undefined' && window.innerWidth >= 1024
            ? { enabled: true, threshold: { x: 0, y: 0.2 } }
            : { enabled: true, acceleration: 10, interval: 5, threshold: { x: 0.2, y: 0.2 } }
        }
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 min-w-0">
          {STAGE_COLUMNS.map((column, colIdx) => {
            const colTasks = filteredTasks.filter((t) => t.status === column.id);
            return (
              <DroppableStageColumn
                key={column.id}
                column={column}
                staggerIndex={colIdx + 2}
                tasks={colTasks}
                teamMap={teamMap}
                timerRunning={timerRunning}
                timerTaskId={timerTaskId}
                activeDragTaskId={activeDragTaskId}
                highlightedTaskId={highlightedTaskId}
                isActiveMobileColumn={activeMobileStage === column.id}
                isMobileViewport={isMobileViewport}
                onMoveTask={moveTask}
                onSelectFocusTask={handleSelectFocusTask}
              />
            );
          })}
        </div>

        {typeof document !== 'undefined' &&
          createPortal(
            <DragOverlay>
              {draggedTask ? (
                <div className="w-full h-full">
                  <motion.div
                    initial={reducedMotion ? false : { scale: 1, y: 0 }}
                    animate={
                      reducedMotion
                        ? { scale: 1, y: 0 }
                        : {
                            scale: 1.02,
                            y: -2,
                            boxShadow: '0 16px 32px rgba(22, 22, 21, 0.16)',
                          }
                    }
                    transition={{
                      duration: reducedMotion ? 0 : PLOTLINE_DURATION.fast,
                      ease: PLOTLINE_EASE,
                    }}
                    className="rounded-[var(--radius-md)] cursor-grabbing"
                  >
                    <TaskCardContent
                      task={draggedTask}
                      teamMap={teamMap}
                      isRunningFocus={timerRunning && draggedTask.id === timerTaskId}
                      isOverlay={true}
                    />
                  </motion.div>
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </div>
  );
}
