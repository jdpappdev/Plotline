import React, { useState } from 'react';
import type { Department } from '../../domain/types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { Dialog } from '../../ui/Dialog';

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
}

const DEPARTMENTS: Department[] = ['Engineering', 'Design', 'Marketing', 'Management'];

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ open, onClose }) => {
  const addTeamMember = useWorkspaceStore((s) => s.addTeamMember);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [location, setLocation] = useState('Stockholm, SE');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addTeamMember({
      name: name.trim(),
      role: role.trim() || 'Studio Specialist',
      department,
      location: location.trim() || 'Remote · CET',
      email: email.trim() || undefined,
    });
    setName('');
    setRole('');
    setEmail('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Invite Team Specialist"
      description="Onboard a collaborator to the Plotline studio roster."
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
            form="invite-member-form"
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold transition-colors cursor-pointer"
          >
            Send Invite
          </button>
        </>
      }
    >
      <form id="invite-member-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Astrid Lindholm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Role Title
            </label>
            <input
              type="text"
              placeholder="e.g., Staff Systems Designer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium bg-white focus:outline-none focus:border-[var(--accent)]"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              placeholder="astrid@plotline.studio"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-mono-tabular focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};
