import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Edit3, User } from 'lucide-react';
import type { DerivedProjectStatus } from '../../domain/types';
import {
  getProjectProgress,
  getProjectStatus,
  getProjectTaskSummary,
} from '../../domain/derivations';
import { formatShortDate } from '../../lib/format';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { Dialog } from '../../ui/Dialog';
import { ProgressBar } from '../../ui/ProgressBar';
import { ProjectStatusChip, TaskStatusChip } from '../../ui/StatusChips';

export const ProjectDialog: React.FC = () => {
  const selectedId = useWorkspaceStore((s) => s.selectedProjectIdForDialog);
  const projects = useWorkspaceStore((s) => s.projects);
  const tasks = useWorkspaceStore((s) => s.tasks);
  const team = useWorkspaceStore((s) => s.team);
  const openProjectDialog = useWorkspaceStore((s) => s.openProjectDialog);
  const updateProject = useWorkspaceStore((s) => s.updateProject);
  const moveTask = useWorkspaceStore((s) => s.moveTask);

  const project = projects.find((p) => p.id === selectedId) || null;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [statusOverride, setStatusOverride] = useState<DerivedProjectStatus>('Running');

  useEffect(() => {
    if (!project) return;
    setIsEditing(false);
    setName(project.name);
    setClient(project.client);
    setTargetDate(project.targetDate);
    setStatusOverride(getProjectStatus(project, tasks));
  }, [project, tasks]);

  if (!project) return null;

  const currentStatus = getProjectStatus(project, tasks);
  const currentProgress = getProjectProgress(project, tasks);
  const taskSummary = getProjectTaskSummary(project.id, tasks);
  const lead = team.find((m) => m.id === project.leadId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProject(project.id, {
      name: name.trim(),
      client: client.trim() || project.client,
      targetDate: targetDate || project.targetDate,
      statusOverride,
    });
    setIsEditing(false);
  };

  return (
    <Dialog
      open={Boolean(project)}
      onClose={() => openProjectDialog(null)}
      title={isEditing ? 'Edit Project' : project.name}
      description={`${project.code} · ${project.client}`}
      maxWidthClass="max-w-[540px]"
      footer={
        isEditing ? (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="project-edit-form"
              className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-[12px] font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              type="button"
              onClick={() => openProjectDialog(null)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </>
        )
      }
    >
      {isEditing ? (
        <form id="project-edit-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Client Partner
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Due Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-mono-tabular focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Status Override
            </label>
            <select
              value={statusOverride}
              onChange={(e) => setStatusOverride(e.target.value as DerivedProjectStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold focus:outline-none focus:border-[var(--accent)] bg-white"
            >
              <option value="Running">Running</option>
              <option value="Pending">Pending</option>
              <option value="Ended">Ended</option>
            </select>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <p className="text-[13px] text-slate-600 leading-relaxed">{project.summary}</p>

          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </div>
              <div className="mt-1">
                <ProjectStatusChip status={currentStatus} />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Lead
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{lead?.name || 'Unassigned'}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Due Date
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold font-mono-tabular text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatShortDate(project.targetDate)}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[12px] mb-1.5">
              <span className="font-bold text-slate-700">Deliverable Completion</span>
              <span className="font-mono-tabular font-bold text-slate-900">
                {taskSummary.doneCount} of {taskSummary.totalCount} tasks ({currentProgress}%)
              </span>
            </div>
            <ProgressBar value={currentProgress} heightClassName="h-2" />
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Project Tasks ({taskSummary.totalCount})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
              {taskSummary.projectTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => moveTask(t.id, t.status === 'Done' ? 'In Progress' : 'Done')}
                  className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        t.status === 'Done' ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                    <div className="min-w-0">
                      <div
                        className={`text-[12px] font-semibold truncate ${
                          t.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {t.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono-tabular">
                        {t.code} · Due {formatShortDate(t.dueDate)}
                      </div>
                    </div>
                  </div>
                  <TaskStatusChip status={t.status} className="shrink-0" />
                </div>
              ))}
              {taskSummary.totalCount === 0 && (
                <div className="p-4 text-center text-[12px] text-slate-400">
                  No tasks assigned to this project yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
