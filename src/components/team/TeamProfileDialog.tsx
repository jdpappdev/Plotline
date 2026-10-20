import React from 'react';
import { Mail, MapPin, MessageSquare } from 'lucide-react';
import { TaskItem, TeamMember } from '../../domain/types';
import { Dialog } from '../../ui/Dialog';
import { DeleteButton } from '../DeleteButton';
import { priorityChipStyle } from '../tasks/TaskCard';
import { EnrichedTeamMember, presenceTextLabel } from './types';

function UtilizationRing40({ pct }: { pct: number }) {
  const normalizedPct = Math.min(100, Math.max(0, pct));
  const strokeColor =
    normalizedPct >= 100 ? '#DC2626' : normalizedPct >= 85 ? '#D97706' : 'var(--accent)';

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalizedPct / 100);

  return (
    <div className="relative w-[40px] h-[40px] flex items-center justify-center shrink-0 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeOpacity={0.12}
          strokeWidth="4"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-ui-tabular text-[var(--ink-primary)]">
        {normalizedPct}%
      </span>
    </div>
  );
}

export interface TeamProfileDialogProps {
  activeProfileData: EnrichedTeamMember | null;
  currentUserId: string;
  onClose: () => void;
  onDeleteMember: (memberId: string) => void;
  onMessageMember: (member: TeamMember) => void;
  onMoveTask: (taskId: string, newStatus: TaskItem['status']) => void;
}

export function TeamProfileDialog({
  activeProfileData,
  currentUserId,
  onClose,
  onDeleteMember,
  onMessageMember,
  onMoveTask,
}: TeamProfileDialogProps) {
  return (
    <Dialog
      isOpen={!!activeProfileData}
      onClose={onClose}
      variant="hero"
      eyebrow={activeProfileData?.member.department}
      title={activeProfileData?.member.name}
      subtitle={activeProfileData?.member.role}
      heroData={
        activeProfileData
          ? {
              glyphSeed: activeProfileData.member.id,
              avatarInitials: activeProfileData.member.initials,
              presence: activeProfileData.member.presence,
              meta: `${activeProfileData.member.location} · ${presenceTextLabel(
                activeProfileData.member.presence
              )}`,
            }
          : undefined
      }
      footer={
        activeProfileData ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DeleteButton
                name={activeProfileData.member.name}
                disabled={activeProfileData.member.id === currentUserId}
                disabledTooltip="You can't delete your own profile."
                onDelete={() => onDeleteMember(activeProfileData.member.id)}
              />

              <button
                type="button"
                onClick={() => onMessageMember(activeProfileData.member)}
                style={{ backgroundColor: 'var(--accent)' }}
                className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 py-2 px-4 rounded-full text-xs font-semibold text-white hover:opacity-95 inline-flex items-center justify-center gap-1.5 transition-opacity cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = `mailto:${activeProfileData.member.email}`;
                }}
                className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 py-2 px-4 rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-sunken)] text-xs font-semibold text-[var(--ink-primary)] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
                <span>Email</span>
              </button>
            </div>

            <span className="text-xs text-[var(--ink-muted)] inline-flex items-center gap-1 self-start sm:self-auto">
              <MapPin className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
              <span>{activeProfileData.member.timezone}</span>
            </span>
          </div>
        ) : undefined
      }
    >
      {activeProfileData && (
        <div className="flex flex-col">
          {/* Stats: Three identical tiles using dashboard stat-card style at compact size */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-6 pt-4 pb-3 shrink-0">
            <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2.5 sm:p-3 text-center shadow-2xs flex flex-col items-center justify-center h-[80px]">
              <span className="text-xl sm:text-2xl font-semibold font-display-num text-[var(--ink-primary)] leading-none">
                {activeProfileData.openCount}
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-[var(--ink-secondary)] mt-1.5">
                Open tasks
              </span>
            </div>

            <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2.5 sm:p-3 text-center shadow-2xs flex flex-col items-center justify-center h-[80px]">
              <span className="text-xl sm:text-2xl font-semibold font-display-num text-[var(--ink-primary)] leading-none">
                {activeProfileData.completedCount}
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-[var(--ink-secondary)] mt-1.5">
                Completed
              </span>
            </div>

            <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2.5 sm:p-3 text-center shadow-2xs flex flex-col items-center justify-center h-[80px]">
              <UtilizationRing40 pct={activeProfileData.workloadPct} />
              <span className="text-[11px] sm:text-xs font-medium text-[var(--ink-secondary)] mt-1">
                Utilization
              </span>
            </div>
          </div>

          {/* Task rows */}
          <div className="px-4 sm:px-6 pt-2 pb-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)]">
                Assigned Tasks ({activeProfileData.memberTasks.length})
              </h3>
              <span className="text-[11px] text-[var(--ink-muted)]">Live store sync</span>
            </div>

            {activeProfileData.memberTasks.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center bg-[var(--surface-canvas)] rounded-[var(--radius-md)] border border-[var(--border-hairline)] gap-2 my-2">
                <p className="text-xs text-[var(--ink-secondary)]">
                  No tasks currently assigned to this specialist.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5 pb-2">
                {activeProfileData.memberTasks.map((t) => {
                  const prioStyle = priorityChipStyle(t.priority);
                  return (
                    <li
                      key={t.id}
                      className="p-3.5 rounded-[var(--radius-md)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <p className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)] leading-snug line-clamp-2 min-w-0">
                          {t.title}
                        </p>
                        <select
                          aria-label={`Change stage for ${t.title}`}
                          value={t.status}
                          onChange={(e) => onMoveTask(t.id, e.target.value as TaskItem['status'])}
                          className="min-h-[36px] sm:min-h-0 px-2 py-1 rounded-[var(--radius-xs)] border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[11px] font-medium text-[var(--ink-primary)] shrink-0 cursor-pointer"
                        >
                          <option value="Backlog">To do</option>
                          <option value="In Progress">In progress</option>
                          <option value="In Review">In review</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] font-medium bg-[var(--surface-sunken)] text-[var(--ink-secondary)]">
                            {t.category || 'Engineering'}
                          </span>
                          <span
                            style={{
                              backgroundColor: prioStyle.bg,
                              color: prioStyle.fg,
                              borderColor: prioStyle.border,
                            }}
                            className="px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] font-medium border"
                          >
                            {t.priority}
                          </span>
                        </div>
                        <span className="text-[var(--ink-muted)]">Due {t.dueDate}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
