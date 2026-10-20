import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { motion, useReducedMotion } from 'motion/react';
import { Plus } from 'lucide-react';
import { TaskItem, TeamMember, usePlotlineStore } from '../store';
import { getTodayIsoDate } from '../lib/clock';
import { PLOTLINE_DURATION, PLOTLINE_EASE } from '../motion/primitives';
import { priorityChipStyle, TaskCardContent } from './tasks/TaskCard';
import { KanbanColumn } from './tasks/KanbanColumn';
import { TasksFilterBar } from './tasks/TasksFilterBar';
import { FilterCriterion, STAGE_COLUMNS, STAGE_IDS } from './tasks/types';

export { priorityChipStyle };

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

function isDueWithinWeek(dueDateIso: string): boolean {
  const today = new Date(`${getTodayIsoDate()}T00:00:00`);
  const due = new Date(`${dueDateIso}T00:00:00`);
  if (Number.isNaN(due.getTime())) return false;
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
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

      <TasksFilterBar
        activeFilters={activeFilters}
        onClearFilters={() => setActiveFilters([])}
        onToggleFilter={toggleFilter}
        filteredTasks={filteredTasks}
        totalTasksCount={tasks.length}
        activeMobileStage={activeMobileStage}
        onSelectMobileStage={setActiveMobileStage}
        onNewTask={() => setNewTaskModalOpen(true)}
      />

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
              <KanbanColumn
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
