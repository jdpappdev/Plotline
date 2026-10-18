import React, { useMemo, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import type { Department } from '../../domain/types';
import { computeTeamMetrics, filterTeamMembers } from '../../domain/derivations';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { AnimatedNumber } from '../../ui/Motion';
import { InviteMemberModal } from './InviteMemberModal';
import { TeamMemberCard } from './TeamMemberCard';

const DEPARTMENT_FILTERS: Array<'All' | Department> = [
  'All',
  'Engineering',
  'Design',
  'Marketing',
  'Management',
];

export const TeamScreen: React.FC = () => {
  const team = useWorkspaceStore((s) => s.team);
  const tasks = useWorkspaceStore((s) => s.tasks);
  const currentUser = useWorkspaceStore((s) => s.currentUser);
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const setSelectedProfileMemberId = useWorkspaceStore((s) => s.setSelectedProfileMemberId);
  const deleteMember = useWorkspaceStore((s) => s.deleteMember);

  const [departmentFilter, setDepartmentFilter] = useState<'All' | Department>('All');
  const [inviteOpen, setInviteOpen] = useState(false);

  const metrics = useMemo(() => computeTeamMetrics(team, tasks), [team, tasks]);

  const filteredTeam = useMemo(
    () => filterTeamMembers(team, departmentFilter, searchQuery),
    [team, departmentFilter, searchQuery]
  );

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Team
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Studio specialists, active capacity allocation, and deliverable ownership.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bento-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Specialists
            </div>
            <div className="text-[28px] font-extrabold text-slate-900 font-mono-tabular mt-0.5">
              <AnimatedNumber value={metrics.totalCount} />
            </div>
          </div>
          <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-5 h-5" />
          </span>
        </div>

        <div className="bento-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Online Now
            </div>
            <div className="text-[28px] font-extrabold text-emerald-600 font-mono-tabular mt-0.5">
              <AnimatedNumber value={metrics.onlineCount} />
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-500 font-mono-tabular">
            <div>{metrics.awayCount} away</div>
            <div>{metrics.offlineCount} offline</div>
          </div>
        </div>

        <div className="bento-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Avg. Workload
            </div>
            <div className="text-[28px] font-extrabold text-slate-900 font-mono-tabular mt-0.5">
              <AnimatedNumber value={metrics.avgWorkload} formatter={(v) => `${Math.round(v)}%`} />
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-bold">
            Balanced
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {DEPARTMENT_FILTERS.map((dept) => {
          const active = departmentFilter === dept;
          return (
            <button
              key={dept}
              type="button"
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer border ${
                active
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {dept}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTeam.map((member, idx) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            index={idx}
            tasks={tasks}
            isCurrentUser={member.id === currentUser.id}
            onSelectProfile={setSelectedProfileMemberId}
            onDeleteMember={deleteMember}
          />
        ))}
      </div>

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
};
