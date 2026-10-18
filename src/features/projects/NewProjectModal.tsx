import React, { useState } from 'react';
import { getIsoDateOffset } from '../../lib/dates';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { Dialog } from '../../ui/Dialog';

export const NewProjectModal: React.FC = () => {
  const open = useWorkspaceStore((s) => s.newProjectModalOpen);
  const setOpen = useWorkspaceStore((s) => s.setNewProjectModalOpen);
  const addProject = useWorkspaceStore((s) => s.addProject);

  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [sector, setSector] = useState('Financial Technology');
  const [targetDate, setTargetDate] = useState(getIsoDateOffset(30));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addProject({
      name: name.trim(),
      client: client.trim() || 'Independent Partner',
      sector,
      targetDate,
    });
    setName('');
    setClient('');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Create New Project"
      description="Charter a new studio workstream and add it to the active portfolio."
      footer={
        <>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-project-form"
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold transition-colors cursor-pointer"
          >
            Create Project
          </button>
        </>
      }
    >
      <form id="new-project-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Project Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Meridian Design System"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Client / Partner
            </label>
            <input
              type="text"
              placeholder="e.g., Meridian Labs"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Target Completion
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-mono-tabular focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Sector
          </label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium bg-white focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="Financial Technology">Financial Technology</option>
            <option value="Healthcare & Wellness">Healthcare & Wellness</option>
            <option value="Supply Chain & Freight">Supply Chain & Freight</option>
            <option value="Travel & Transportation">Travel & Transportation</option>
            <option value="Arts & Culture">Arts & Culture</option>
            <option value="Consumer Goods & Retail">Consumer Goods & Retail</option>
          </select>
        </div>
      </form>
    </Dialog>
  );
};
