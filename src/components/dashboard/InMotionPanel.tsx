import React from 'react';
import { Plus } from 'lucide-react';
import { TaskItem } from '../../domain/types';
import { formatLoggedDuration } from '../../domain/derivations/time';
import { ContourGlyph } from '../../utils/contourGlyph';
import { MemberCollaborationRow } from './types';

function taskStatusBadge(status: TaskItem['status']): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'Done':
      return {
        label: 'Completed',
        bg: '#E8F4EC',
        text: '#216E3E',
        border: '#B5DFC4',
      };
    case 'In Progress':
      return {
        label: 'In Progress',
        bg: '#FEF5E6',
        text: '#9B5B0B',
        border: '#F5D69E',
      };
    case 'In Review':
      return {
        label: 'In Review',
        bg: 'var(--accent-soft)',
        text: 'var(--accent)',
        border: 'var(--accent-border)',
      };
    case 'Backlog':
    default:
      return {
        label: 'Pending',
        bg: '#FBECEE',
        text: '#B43342',
        border: '#F1B9C0',
      };
  }
}

export interface InMotionPanelProps {
  rows: MemberCollaborationRow[];
  hasTasks: boolean;
  timerRunning: boolean;
  timerTaskId: string;
  activityLabel?: string;
  onAddTask: () => void;
  onOpenTask: (taskId: string) => void;
}

export function InMotionPanel({
  rows,
  hasTasks,
  timerRunning,
  timerTaskId,
  activityLabel = 'Activity notifications',
  onAddTask,
  onOpenTask,
}: InMotionPanelProps) {
  return (
    <section
      aria-labelledby="in-motion-heading"
      style={{ '--stagger-index': 8 } as React.CSSProperties}
      className="plotline-enter col-span-2 sm:col-span-2 xl:col-span-5 sm:order-8 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-2 min-h-0"
    >
      <div className="flex items-center justify-between gap-2 shrink-0">
        <h2 id="in-motion-heading" className="text-base font-semibold text-[var(--ink-primary)]">
          In motion
        </h2>
        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex items-center justify-center gap-1 min-h-[44px] sm:min-h-[28px] px-3 sm:px-2.5 py-1 sm:py-0.5 rounded-full border border-[var(--border-strong)] text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
          <span>Add task</span>
        </button>
      </div>

      {rows.length === 0 || !hasTasks ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-2">
          <ContourGlyph seed="dashboard-in-motion-empty" size={38} />
          <p className="text-xs text-[var(--ink-secondary)]">
            No {activityLabel.toLowerCase()} right now.
          </p>
          <button
            type="button"
            onClick={onAddTask}
            style={{ color: 'var(--accent)' }}
            className="min-h-[44px] px-3 text-xs font-semibold hover:underline cursor-pointer inline-flex items-center"
          >
            + Add a task
          </button>
        </div>
      ) : (
        <div
          aria-label={activityLabel}
          className="divide-y divide-[var(--border-hairline)] flex-1 flex flex-col justify-around min-h-0 overflow-hidden"
        >
          {rows.map(({ member, task }) => {
            if (!task) return null;
            const badge = taskStatusBadge(task.status);
            const isTaskRunning = timerRunning && task.id === timerTaskId;
            return (
              <div
                key={member.id}
                onClick={() => onOpenTask(task.id)}
                className="py-2 sm:py-1 px-1 min-h-[44px] rounded hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {member.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)] truncate leading-tight">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-[var(--ink-secondary)] truncate">
                      Working on{' '}
                      <span className="font-medium text-[var(--ink-primary)]">{task.title}</span>
                      {task.loggedSeconds ? (
                        <span
                          className="ml-1.5 font-ui-tabular font-semibold"
                          style={{ color: 'var(--accent)' }}
                        >
                          (+{formatLoggedDuration(task.loggedSeconds)})
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isTaskRunning && (
                    <span
                      style={{
                        backgroundColor: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        borderColor: 'var(--accent-border)',
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] border text-[10px] font-semibold whitespace-nowrap"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                      <span>Running</span>
                    </span>
                  )}
                  <span
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.text,
                      borderColor: badge.border,
                    }}
                    className="px-2 py-0.5 rounded-[var(--radius-xs)] border text-[11px] font-medium whitespace-nowrap shrink-0"
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
