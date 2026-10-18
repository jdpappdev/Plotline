import React from 'react';
import { Pause, Play, Plus, RotateCcw } from 'lucide-react';
import type { TaskItem, TeamMember } from '../../domain/types';
import { getMemberTaskCounts, getMemberWorkload } from '../../domain/derivations';
import { formatTimerHMS, pluralize } from '../../lib/format';
import { presenceDotClass } from '../../lib/theme';
import { MotionCard } from '../../ui/Motion';
import { TaskStatusChip } from '../../ui/StatusChips';

interface TeamAndTimerSectionProps {
  team: TeamMember[];
  tasks: TaskItem[];
  timerSeconds: number;
  timerRunning: boolean;
  timerTaskId: string;
  onSelectMember: (memberId: string) => void;
  onOpenInviteMember: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSetTimerTask: (taskId: string) => void;
}

export const TeamAndTimerSection: React.FC<TeamAndTimerSectionProps> = ({
  team,
  tasks,
  timerSeconds,
  timerRunning,
  timerTaskId,
  onSelectMember,
  onOpenInviteMember,
  onToggleTimer,
  onResetTimer,
  onSetTimerTask,
}) => {
  const activeTimerTasks = tasks.filter((t) => t.status !== 'Done');
  const currentTimerTask =
    tasks.find((t) => t.id === timerTaskId) || activeTimerTasks[0] || tasks[0];

  return (
    <>
      <MotionCard index={8} className="col-span-12 lg:col-span-5 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">
              Team Collaboration
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Active specialists & current deliverable focus
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenInviteMember}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Member</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 my-auto">
          {team.slice(0, 4).map((member) => {
            const memberTasks = tasks.filter(
              (t) => t.assigneeId === member.id || t.coAssigneeId === member.id
            );
            const primaryTask =
              memberTasks.find((t) => t.status === 'In Progress') ||
              memberTasks.find((t) => t.status === 'In Review') ||
              memberTasks[0];
            const counts = getMemberTaskCounts(member.id, tasks);
            const workload = getMemberWorkload(member.id, tasks);

            return (
              <div
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      {member.initials}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${presenceDotClass(
                        member.presence
                      )}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-slate-900 truncate">
                        {member.name}
                      </span>
                      <span className="text-[10px] font-mono-tabular text-slate-400">
                        {pluralize(counts.openCount, 'open task')} · {workload}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {primaryTask ? (
                        <span>
                          Working on <strong className="text-slate-700">{primaryTask.title}</strong>
                        </span>
                      ) : (
                        <span>{member.statusLabel}</span>
                      )}
                    </div>
                  </div>
                </div>

                {primaryTask && (
                  <TaskStatusChip status={primaryTask.status} className="shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </MotionCard>

      <div className="col-span-12 lg:col-span-3 timer-console-surface p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Time Tracker
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Logs directly to Analytics</p>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              timerRunning ? 'bg-emerald-400 animate-pulse-ring' : 'bg-slate-600'
            }`}
          />
        </div>

        <div className="my-4 text-center">
          <div className="text-[36px] font-extrabold font-mono-tabular tracking-wider text-white leading-none">
            {formatTimerHMS(timerSeconds)}
          </div>
          <div className="mt-3">
            <select
              aria-label="Select task for focus timer"
              value={currentTimerTask?.id || ''}
              onChange={(e) => onSetTimerTask(e.target.value)}
              className="w-full bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-medium rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-white/30 cursor-pointer truncate"
            >
              {activeTimerTasks.map((t) => (
                <option key={t.id} value={t.id} className="text-slate-900 bg-white">
                  {t.code} · {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onToggleTimer}
            aria-label={timerRunning ? 'Pause focus timer' : 'Start focus timer'}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-[12px] inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
              timerRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-white hover:bg-slate-100 text-slate-900'
            }`}
          >
            {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{timerRunning ? 'Pause' : 'Start'}</span>
          </button>

          <button
            type="button"
            onClick={onResetTimer}
            aria-label="Stop and log focus session"
            title="Stop & log focus session"
            className="w-10 h-10 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/30 text-rose-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
