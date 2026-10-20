import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskItem, TeamMember } from '../../store';
import { ContourGlyph } from '../../utils/contourGlyph';
import { DraggableTaskCard } from './TaskCard';
import { StageColumn } from './types';

export interface KanbanColumnProps {
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

export function KanbanColumn({
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
}: KanbanColumnProps) {
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
