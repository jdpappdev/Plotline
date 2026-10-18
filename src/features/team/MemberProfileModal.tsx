import React from 'react';
import { Globe, Mail, MapPin } from 'lucide-react';
import {
  getMemberAssignedTasks,
  getMemberTaskCounts,
  getMemberWorkload,
} from '../../domain/derivations';
import { formatShortDate } from '../../lib/format';
import { presenceDotClass, presenceTextLabel } from '../../lib/theme';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { Dialog } from '../../ui/Dialog';
import { ProgressBar } from '../../ui/ProgressBar';
import { TaskStatusChip } from '../../ui/StatusChips';

export const MemberProfileModal: React.FC = () => {
  const selectedId = useWorkspaceStore((s) => s.selectedProfileMemberId);
  const team = useWorkspaceStore((s) => s.team);
  const tasks = useWorkspaceStore((s) => s.tasks);
  const setSelectedProfileMemberId = useWorkspaceStore((s) => s.setSelectedProfileMemberId);

  const member = team.find((m) => m.id === selectedId) || null;
  if (!member) return null;

  const workload = getMemberWorkload(member.id, tasks);
  const counts = getMemberTaskCounts(member.id, tasks);
  const assignedTasks = getMemberAssignedTasks(member.id, tasks);

  return (
    <Dialog
      open={Boolean(member)}
      onClose={() => setSelectedProfileMemberId(null)}
      title={member.name}
      description={`${member.role} · ${member.department}`}
      maxWidthClass="max-w-[500px]"
      footer={
        <button
          type="button"
          onClick={() => setSelectedProfileMemberId(null)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold transition-colors cursor-pointer"
        >
          Close Profile
        </button>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white text-[16px] font-extrabold flex items-center justify-center">
              {member.initials}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white ${presenceDotClass(
                member.presence
              )}`}
            />
          </div>

          <div className="space-y-1 text-[12px] text-slate-600 min-w-0">
            <div className="font-semibold text-slate-900">
              {presenceTextLabel(member.presence)} — {member.statusLabel}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{member.location}</span>
              <span>·</span>
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono-tabular">{member.timezone}</span>
            </div>
            <div className="flex items-center gap-2 font-mono-tabular">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{member.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[20px] font-extrabold text-slate-900 font-mono-tabular">
              {counts.openCount}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Open Tasks
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[20px] font-extrabold text-slate-900 font-mono-tabular">
              {counts.completedCount}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Completed
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[20px] font-extrabold text-slate-900 font-mono-tabular">
              {workload}%
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Workload
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
            <span>Capacity Allocation ({member.capacityHours}h window)</span>
            <span className="font-mono-tabular">{workload}%</span>
          </div>
          <ProgressBar value={workload} heightClassName="h-2" />
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Assigned Tasks ({assignedTasks.length})
          </h4>
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden max-h-[220px] overflow-y-auto">
            {assignedTasks.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-white flex items-center justify-between gap-3 text-[12px]"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{t.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono-tabular">
                    {t.code} · Due {formatShortDate(t.dueDate)} · {t.estimateHours}h est
                  </div>
                </div>
                <TaskStatusChip status={t.status} className="shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
