import React, { useEffect, useState } from 'react';
import type { TaskPriority, TaskStatus } from '../../domain/types';
import { getIsoDateOffset } from '../../lib/dates';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { Dialog } from '../../ui/Dialog';

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  open,
  onClose,
  defaultStatus = 'Backlog',
}) => {
  const team = useWorkspaceStore((s) => s.team);
  const currentUser = useWorkspaceStore((s) => s.currentUser);
  const addTask = useWorkspaceStore((s) => s.addTask);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [dueDate, setDueDate] = useState(getIsoDateOffset(7));

  useEffect(() => {
    if (open) {
      setStatus(defaultStatus);
      setAssigneeId(currentUser.id);
    }
  }, [open, defaultStatus, currentUser.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      category,
      priority,
      status,
      assigneeId,
      dueDate,
    });
    setTitle('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New Deliverable Task"
      description="Assign a studio task to an active specialist and board stage."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-task-form"
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold transition-colors cursor-pointer"
          >
            Create Task
          </button>
        </>
      }
    >
      <form id="new-task-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Task Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Implement biometric login sheet"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium bg-white focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="Backlog">To do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium bg-white focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium bg-white focus:outline-none focus:border-[var(--accent)]"
            >
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-mono-tabular focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium bg-white focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="Engineering">Engineering</option>
            <option value="Interface">Interface</option>
            <option value="Architecture">Architecture</option>
            <option value="Telemetry">Telemetry</option>
            <option value="Field Ops">Field Ops</option>
            <option value="Outreach">Outreach</option>
          </select>
        </div>
      </form>
    </Dialog>
  );
};
