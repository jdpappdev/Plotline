import React, { useRef, useState } from 'react';
import { Check, ChevronDown, Pause, Play, Square } from 'lucide-react';
import { TaskItem } from '../../domain/types';
import { AnchoredPopover } from '../../ui/Popover';
import { ContourGlyph } from '../../utils/contourGlyph';

function formatTimerHMS(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface FocusTimerPanelProps {
  tasks: TaskItem[];
  activeFocusTask: TaskItem | undefined;
  timerSeconds: number;
  timerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSelectTask: (taskId: string) => void;
}

export function FocusTimerPanel({
  tasks,
  activeFocusTask,
  timerSeconds,
  timerRunning,
  onToggleTimer,
  onResetTimer,
  onSelectTask,
}: FocusTimerPanelProps) {
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const taskPickerTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <section
      aria-labelledby="focus-card-heading"
      data-tour="timer"
      style={
        {
          '--stagger-index': 10,
          background: 'var(--surface-accent)',
        } as React.CSSProperties
      }
      className="dashboard-focus-card plotline-enter col-span-2 sm:col-span-1 xl:col-span-3 sm:order-10 time-tracker-surface rounded-[var(--radius-lg)] p-4 sm:p-3.5 text-white flex flex-col justify-between gap-2.5 w-full xl:max-h-[212px] self-start relative"
    >
      {/* Large Contour Glyph Texture in White at 8–10% Opacity, Seeded from Active Task ID */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--radius-lg)]"
      >
        <div className="absolute -right-6 -bottom-6 flex items-center justify-center">
          <ContourGlyph
            seed={activeFocusTask?.id || 'focus-default'}
            size={210}
            stroke="#ffffff"
            strokeWidth={1.25}
            minOpacity={0.08}
            maxOpacity={0.1}
          />
        </div>
      </div>

      {/* Top-left title "Focus" 13px/500 in white + pulsing red dot ONLY while running */}
      <div className="relative flex items-center justify-between shrink-0">
        <h2 id="focus-card-heading" className="text-[13px] font-medium text-white leading-none">
          Focus
        </h2>
        {timerRunning && (
          <span
            aria-label="Recording active"
            className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"
          />
        )}
      </div>

      {/* Centered HH:MM:SS in UI sans, tabular-nums, white */}
      <div className="relative my-auto flex flex-col items-center justify-center py-1">
        <div
          data-testid="focus-timer-readout"
          className="font-ui-tabular text-[32px] xl:text-[38px] font-semibold tracking-tight leading-none text-white text-center select-none"
        >
          {formatTimerHMS(timerSeconds)}
        </div>

        {/* Two 44px round buttons with 12px between: white play/pause & red stop */}
        <div className="mt-2.5 flex items-center justify-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleTimer}
            aria-label={timerRunning ? 'Pause timer' : 'Start timer'}
            style={{ color: 'var(--accent-deep)' }}
            className="w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xs"
          >
            {timerRunning ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onResetTimer}
            aria-label="Stop and log focus session"
            className="w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded-full bg-[#DC2626] text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xs"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Tappable "Focusing on: [task]" line under the buttons */}
      <div className="relative pt-1 shrink-0">
        <button
          ref={taskPickerTriggerRef}
          type="button"
          onClick={() => setTaskPickerOpen((prev) => !prev)}
          aria-expanded={taskPickerOpen}
          aria-haspopup="menu"
          className="w-full min-h-[44px] sm:min-h-[32px] px-3 py-1.5 sm:py-1 rounded-[var(--radius-sm)] bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] text-white flex items-center justify-between gap-1.5 cursor-pointer transition-colors"
        >
          <span className="truncate text-left">
            <span className="text-white/75">Focusing on: </span>
            <span className="font-semibold text-white">
              {activeFocusTask?.title || 'Select task'}
            </span>
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-white/80 shrink-0" />
        </button>

        {/* Task Chooser Popover portaled to document.body */}
        <AnchoredPopover
          isOpen={taskPickerOpen}
          onClose={() => setTaskPickerOpen(false)}
          triggerRef={taskPickerTriggerRef}
          placement="top"
          matchTriggerWidth={true}
          title="Focus on task"
          role="menu"
          className="sm:max-h-56 sm:overflow-y-auto bg-[var(--surface-elevated)] text-[var(--ink-primary)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-xl p-1.5 space-y-0.5"
        >
          {tasks.map((t) => {
            const isCurrent = t.id === activeFocusTask?.id;
            return (
              <button
                key={t.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelectTask(t.id);
                  setTaskPickerOpen(false);
                }}
                className={`w-full min-h-[44px] sm:min-h-[34px] text-left px-2.5 py-2 sm:py-1.5 rounded-[var(--radius-xs)] text-xs flex items-center justify-between gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-[var(--accent-soft)] font-semibold text-[var(--ink-primary)]'
                    : 'hover:bg-[var(--surface-sunken)] text-[var(--ink-primary)]'
                }`}
              >
                <span className="truncate">
                  <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                    {t.code}
                  </span>{' '}
                  · {t.title}
                </span>
                {isCurrent && (
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
                )}
              </button>
            );
          })}
        </AnchoredPopover>
      </div>
    </section>
  );
}
