import React from 'react';
import { Department } from '../../domain/types';
import { Dialog } from '../../ui/Dialog';

export interface TeamInviteDialogProps {
  isOpen: boolean;
  inviteName: string;
  inviteRole: string;
  inviteDept: Department;
  inviteLocation: string;
  inviteError: string;
  inviteNameRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onDeptChange: (value: Department) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TeamInviteDialog({
  isOpen,
  inviteName,
  inviteRole,
  inviteDept,
  inviteLocation,
  inviteError,
  inviteNameRef,
  onClose,
  onNameChange,
  onRoleChange,
  onDeptChange,
  onLocationChange,
  onSubmit,
}: TeamInviteDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Studio Roster"
      title="Invite member"
      maxWidthClass="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="invite-member-form"
            style={{ backgroundColor: 'var(--accent)' }}
            className="px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold text-white hover:opacity-95 cursor-pointer"
          >
            Send invite
          </button>
        </>
      }
    >
      <form
        id="invite-member-form"
        onSubmit={onSubmit}
        className="p-4 sm:p-6 space-y-3.5"
        noValidate
      >
        <div>
          <label
            htmlFor="invite-name"
            className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
          >
            Full name <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <input
            ref={inviteNameRef}
            id="invite-name"
            type="text"
            required
            value={inviteName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Astrid Lindholm"
            className="w-full h-11 sm:h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
          />
        </div>

        <div>
          <label
            htmlFor="invite-role"
            className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
          >
            Role <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <input
            id="invite-role"
            type="text"
            required
            value={inviteRole}
            onChange={(e) => onRoleChange(e.target.value)}
            placeholder="e.g. Senior Hydrographic Analyst"
            className="w-full h-11 sm:h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="invite-dept"
              className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
            >
              Department
            </label>
            <select
              id="invite-dept"
              value={inviteDept}
              onChange={(e) => onDeptChange(e.target.value as Department)}
              className="w-full h-11 sm:h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
            >
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Management">Management</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="invite-location"
              className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
            >
              Location
            </label>
            <input
              id="invite-location"
              type="text"
              value={inviteLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="e.g. Oslo, NO"
              className="w-full h-11 sm:h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
            />
          </div>
        </div>

        {inviteError && (
          <p role="alert" className="text-xs font-medium text-[var(--status-critical)]">
            {inviteError}
          </p>
        )}
      </form>
    </Dialog>
  );
}
