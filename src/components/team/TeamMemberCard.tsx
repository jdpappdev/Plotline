import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, User } from 'lucide-react';
import { TeamMember } from '../../domain/types';
import { DeleteButton } from '../DeleteButton';
import { presenceDotColor, presenceTextLabel } from './types';

export interface TeamMemberCardProps {
  member: TeamMember;
  openCount: number;
  completedCount: number;
  workloadPct: number;
  staggerIndex: number;
  prefersReducedMotion: boolean | null;
  currentUserId: string;
  onMessage: (member: TeamMember) => void;
  onOpenProfile: (memberId: string) => void;
  onDeleteMember: (memberId: string) => void;
}

export const TeamMemberCard = React.forwardRef<HTMLElement, TeamMemberCardProps>(
  function TeamMemberCard(
    {
      member,
      openCount,
      completedCount,
      workloadPct,
      staggerIndex,
      prefersReducedMotion,
      currentUserId,
      onMessage,
      onOpenProfile,
      onDeleteMember,
    },
    ref
  ) {
    return (
      <motion.article
        ref={ref}
        layout={!prefersReducedMotion}
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: 380,
                damping: 30,
              }
        }
        style={{ '--stagger-index': staggerIndex } as React.CSSProperties}
        className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 sm:p-5 flex flex-col justify-between gap-4 min-w-0"
      >
        {/* Top: Initials Avatar with Presence Dot + Name, Role, Department Chip */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <span
                style={{ backgroundColor: 'var(--accent)' }}
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-white"
              >
                {member.initials}
              </span>
              <span
                title={presenceTextLabel(member.presence)}
                style={{
                  backgroundColor: presenceDotColor(member.presence),
                }}
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--surface-elevated)]"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-[var(--ink-primary)] truncate">
                {member.name}
              </h2>
              <p className="text-xs text-[var(--ink-secondary)] truncate">{member.role}</p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface-sunken)] text-[var(--ink-secondary)] border border-[var(--border-hairline)] whitespace-nowrap shrink-0">
            {member.department}
          </span>
        </div>

        {/* Middle: Open vs Completed Counts + Workload Bar with % */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] flex items-center justify-between">
              <span className="text-xs text-[var(--ink-secondary)]">Open</span>
              <span className="text-sm font-semibold font-ui-tabular text-[var(--ink-primary)]">
                {openCount}
              </span>
            </div>
            <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] flex items-center justify-between">
              <span className="text-xs text-[var(--ink-secondary)]">Completed</span>
              <span className="text-sm font-semibold font-ui-tabular text-[var(--ink-primary)]">
                {completedCount}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--ink-secondary)]">Workload</span>
              <span
                data-testid={`workload-pct-${member.id}`}
                className="font-semibold font-ui-tabular text-[var(--ink-primary)]"
              >
                {workloadPct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden">
              <div
                style={{
                  width: `${workloadPct}%`,
                  backgroundColor: 'var(--accent)',
                }}
                className="h-full rounded-full transition-all duration-300 ease-plotline"
              />
            </div>
          </div>
        </div>

        {/* Footer: Message & Profile & Delete Buttons */}
        <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMessage(member)}
            aria-label={`Send message to ${member.name}`}
            className="flex-1 min-h-[44px] sm:min-h-0 py-2 px-2.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-sunken)] text-xs font-semibold text-[var(--ink-primary)] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
            <span>Message</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenProfile(member.id)}
            aria-label={`View profile of ${member.name}`}
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent)',
              borderColor: 'var(--accent-border)',
            }}
            className="flex-1 min-h-[44px] sm:min-h-0 py-2 px-2.5 rounded-[var(--radius-sm)] border text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <DeleteButton
            name={member.name}
            disabled={member.id === currentUserId}
            disabledTooltip="You can't delete your own profile."
            onDelete={() => onDeleteMember(member.id)}
          />
        </div>
      </motion.article>
    );
  }
);
