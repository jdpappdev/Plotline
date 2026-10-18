import React from 'react';
import { Globe, Mail, MapPin } from 'lucide-react';
import type { TaskItem, TeamMember } from '../../domain/types';
import { getMemberTaskCounts, getMemberWorkload } from '../../domain/derivations';
import { presenceDotClass, presenceTextLabel } from '../../lib/theme';
import { DeleteButton } from '../../ui/DeleteButton';
import { MotionCard } from '../../ui/Motion';
import { ProgressBar } from '../../ui/ProgressBar';

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
  tasks: TaskItem[];
  isCurrentUser: boolean;
  onSelectProfile: (memberId: string) => void;
  onDeleteMember: (memberId: string) => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  index,
  tasks,
  isCurrentUser,
  onSelectProfile,
  onDeleteMember,
}) => {
  const workload = getMemberWorkload(member.id, tasks);
  const counts = getMemberTaskCounts(member.id, tasks);

  const workloadFillClass =
    workload >= 75
      ? 'fill-amber-500'
      : workload >= 40
      ? 'fill-[var(--accent)]'
      : 'fill-emerald-500';

  return (
    <MotionCard
      index={index}
      onClick={() => onSelectProfile(member.id)}
      className="p-5 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white text-[13px] font-extrabold flex items-center justify-center">
                {member.initials}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${presenceDotClass(
                  member.presence
                )}`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[15px] font-bold text-slate-900 truncate group-hover:text-[var(--accent)] transition-colors">
                  {member.name}
                </h3>
                {isCurrentUser && (
                  <span className="px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] text-[9px] font-bold uppercase">
                    You
                  </span>
                )}
              </div>
              <p className="text-[12px] text-slate-500 truncate">{member.role}</p>
            </div>
          </div>

          {!isCurrentUser && (
            <div onClick={(e) => e.stopPropagation()}>
              <DeleteButton
                label={`Remove ${member.name}`}
                onConfirm={() => onDeleteMember(member.id)}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px]">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
            {member.department}
          </span>
          <span className="text-slate-500 font-medium">
            {presenceTextLabel(member.presence)} · {member.statusLabel}
          </span>
        </div>

        <div className="mt-4 space-y-1.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{member.location}</span>
            <span className="text-slate-300">·</span>
            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-mono-tabular">{member.timezone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-mono-tabular">{member.email}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-slate-600">Active Workload</span>
            <span className="font-mono-tabular font-bold text-slate-900">{workload}%</span>
          </div>
          <ProgressBar value={workload} fillClassName={workloadFillClass} />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono-tabular pt-1">
          <span>
            <strong className="text-slate-800">{counts.openCount}</strong> open tasks
          </span>
          <span>
            <strong className="text-slate-800">{counts.completedCount}</strong> completed
          </span>
        </div>
      </div>
    </MotionCard>
  );
};
