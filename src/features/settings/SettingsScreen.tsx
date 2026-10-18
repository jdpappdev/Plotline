import React from 'react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { DataAndNotificationsSection } from './DataAndNotificationsSection';
import { ProfileAndPreferencesSection } from './ProfileAndPreferencesSection';

export const SettingsScreen: React.FC = () => {
  const currentUser = useWorkspaceStore((s) => s.currentUser);
  const accent = useWorkspaceStore((s) => s.accent);
  const weekStart = useWorkspaceStore((s) => s.weekStart);
  const notifications = useWorkspaceStore((s) => s.notifications);
  const updateProfile = useWorkspaceStore((s) => s.updateProfile);
  const setAccent = useWorkspaceStore((s) => s.setAccent);
  const setWeekStart = useWorkspaceStore((s) => s.setWeekStart);
  const toggleNotification = useWorkspaceStore((s) => s.toggleNotification);
  const runValidationCheck = useWorkspaceStore((s) => s.runValidationCheck);
  const resetDemoData = useWorkspaceStore((s) => s.resetDemoData);

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
          Settings
        </h1>
        <p className="text-[13px] text-slate-500 mt-0.5">
          Manage operator identity, studio accent theme, notifications, and workspace verification.
        </p>
      </div>

      <ProfileAndPreferencesSection
        currentUser={currentUser}
        accent={accent}
        weekStart={weekStart}
        onUpdateProfile={updateProfile}
        onSelectAccent={(nextAccent) => setAccent(nextAccent, true)}
        onSelectWeekStart={(nextStart) => setWeekStart(nextStart, true)}
      />

      <DataAndNotificationsSection
        notifications={notifications}
        onToggleNotification={toggleNotification}
        onRunValidation={runValidationCheck}
        onResetDemoData={resetDemoData}
      />
    </div>
  );
};
