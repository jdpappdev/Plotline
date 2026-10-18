import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  CheckCircle2,
  Database,
  Palette,
  RotateCcw,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import {
  ACCENT_THEMES,
  AccentName,
  computeInitials,
  NotificationSettings,
  usePlotlineStore,
  WeekStart,
  WorkspaceValidationReport,
} from '../store';

type SettingsSection = 'Profile' | 'Notifications' | 'Appearance' | 'Data';

const NOTIFICATION_ITEMS: Array<{
  key: keyof NotificationSettings;
  label: string;
  description: string;
}> = [
  {
    key: 'emailDigests',
    label: 'Daily Field Digest',
    description: 'Receive a morning summary of tasks due today and upcoming reviews.',
  },
  {
    key: 'milestoneAlerts',
    label: 'Milestone & Deadline Alerts',
    description: 'Immediate notification when a project target date or review shifts.',
  },
  {
    key: 'taskMentions',
    label: 'Task Assignments & Mentions',
    description: 'Notify when a deliverable is assigned or moved on the Tasks board.',
  },
  {
    key: 'focusReminders',
    label: 'Focus Session Prompts',
    description: 'Gentle reminder when a Focus timer runs past 90 minutes continuously.',
  },
  {
    key: 'weeklyReport',
    label: 'Weekly Throughput Report',
    description: 'Automated Friday afternoon CSV and velocity recap across streams.',
  },
];

export default function SettingsScreen() {
  const {
    currentUser,
    notifications,
    accent,
    weekStart,
    updateProfile,
    toggleNotification,
    setAccent,
    setWeekStart,
    resetDemoData,
    runValidationCheck,
  } = usePlotlineStore();

  const [activeTab, setActiveTab] = useState<SettingsSection>('Profile');
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [email, setEmail] = useState(currentUser.email);
  const [validationReport, setValidationReport] = useState<WorkspaceValidationReport | null>(null);

  useEffect(() => {
    setName(currentUser.name);
    setRole(currentUser.role);
    setEmail(currentUser.email);
  }, [currentUser]);

  const previewInitials = computeInitials(name || currentUser.name);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, role, email });
  };

  const handleRunCheck = () => {
    const report = runValidationCheck();
    setValidationReport(report);
  };

  return (
    <div className="max-w-[1160px] mx-auto space-y-5 pb-6 min-w-0">
      {/* Header */}
      <div
        style={{ '--stagger-index': 0 } as React.CSSProperties}
        className="plotline-enter"
      >
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5">
          Manage your specialist profile, notification preferences, studio appearance, and dataset integrity.
        </p>
      </div>

      {/* Main Grid: Left Sub-Nav (3 cols) + Right Content Panel (9 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Sub-Nav */}
        <nav
          aria-label="Settings sections"
          style={{ '--stagger-index': 1 } as React.CSSProperties}
          className="plotline-enter md:col-span-3 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2 space-y-1"
        >
          {(
            [
              { id: 'Profile', label: 'Profile', icon: User },
              { id: 'Notifications', label: 'Notifications', icon: Bell },
              { id: 'Appearance', label: 'Appearance', icon: Palette },
              { id: 'Data', label: 'Data & Integrity', icon: Database },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--ink-primary)] font-semibold'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
                }`}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? 'var(--accent)' : 'currentColor' }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Content Area */}
        <div
          style={{ '--stagger-index': 2 } as React.CSSProperties}
          className="plotline-enter md:col-span-9 space-y-5"
        >
          {activeTab === 'Profile' && (
            <section
              aria-labelledby="settings-profile-heading"
              className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
                <div>
                  <h2
                    id="settings-profile-heading"
                    className="text-base font-semibold text-[var(--ink-primary)]"
                  >
                    Profile
                  </h2>
                  <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                    Update your identity across the top bar, team roster, and task assignments.
                  </p>
                </div>

                {/* Live Initials Avatar */}
                <div className="flex items-center gap-3">
                  <span
                    data-testid="settings-profile-avatar"
                    style={{ backgroundColor: 'var(--accent)' }}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold text-white shrink-0"
                  >
                    {previewInitials}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="profile-name-input"
                      className="block text-xs font-medium text-[var(--ink-primary)] mb-1.5"
                    >
                      Full name
                    </label>
                    <input
                      id="profile-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-role-input"
                      className="block text-xs font-medium text-[var(--ink-primary)] mb-1.5"
                    >
                      Role
                    </label>
                    <input
                      id="profile-role-input"
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="profile-email-input"
                    className="block text-xs font-medium text-[var(--ink-primary)] mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="profile-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
                  />
                </div>

                <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-end">
                  <button
                    type="submit"
                    style={{ backgroundColor: 'var(--accent)' }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'Notifications' && (
            <section
              aria-labelledby="settings-notifications-heading"
              className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 space-y-4"
            >
              <div className="border-b border-[var(--border-hairline)] pb-4">
                <h2
                  id="settings-notifications-heading"
                  className="text-base font-semibold text-[var(--ink-primary)]"
                >
                  Notifications
                </h2>
                <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                  Configure how Plotline alerts you about studio activity. Saved automatically to localStorage.
                </p>
              </div>

              <div className="divide-y divide-[var(--border-hairline)]">
                {NOTIFICATION_ITEMS.map((item) => {
                  const enabled = notifications[item.key];
                  return (
                    <div
                      key={item.key}
                      className="py-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)]">
                          {item.label}
                        </p>
                        <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label={item.label}
                        onClick={() => toggleNotification(item.key)}
                        style={{
                          backgroundColor: enabled
                            ? 'var(--accent)'
                            : 'var(--border-strong)',
                        }}
                        className="relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 p-0.5"
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === 'Appearance' && (
            <section
              aria-labelledby="settings-appearance-heading"
              data-tour="accent"
              className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 space-y-6"
            >
              <div className="border-b border-[var(--border-hairline)] pb-4">
                <h2
                  id="settings-appearance-heading"
                  className="text-base font-semibold text-[var(--ink-primary)]"
                >
                  Appearance
                </h2>
                <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                  Select the primary studio accent palette and calendar week-start day. Changes apply immediately.
                </p>
              </div>

              {/* Accent x4 */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--ink-primary)] uppercase tracking-wider">
                  Accent Palette
                </h3>
                <div
                  role="group"
                  aria-label="Accent color theme"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
                >
                  {(Object.keys(ACCENT_THEMES) as AccentName[]).map((key) => {
                    const theme = ACCENT_THEMES[key];
                    const isSelected = accent === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAccent(key, true)}
                        aria-pressed={isSelected}
                        className={`p-3.5 rounded-[var(--radius-md)] border text-left transition-colors duration-160 ease-plotline cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                            : 'bg-[var(--surface-canvas)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className="w-4 h-4 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: theme.hex }}
                          />
                          <div className="min-w-0">
                            <span className="block text-sm font-semibold text-[var(--ink-primary)]">
                              {theme.label}
                            </span>
                            <span className="block text-xs text-[var(--ink-secondary)] mt-0.5">
                              {theme.description}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check
                            className="w-4 h-4 shrink-0 mt-0.5"
                            style={{ color: 'var(--accent)' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Week Start */}
              <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
                    Calendar Week Start
                  </h3>
                  <p className="text-xs text-[var(--ink-secondary)]">
                    Controls the starting day column for the Calendar month grid and Dashboard Weekly Output.
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Week start day"
                  className="inline-flex items-center bg-[var(--surface-sunken)] border border-[var(--border-hairline)] rounded-full p-1 gap-1 shrink-0"
                >
                  {(['monday', 'sunday'] as WeekStart[]).map((day) => {
                    const active = weekStart === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setWeekStart(day, true)}
                        aria-pressed={active}
                        style={
                          active
                            ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                            : undefined
                        }
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
                          active
                            ? ''
                            : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'Data' && (
            <section
              aria-labelledby="settings-data-heading"
              className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 space-y-6"
            >
              <div className="border-b border-[var(--border-hairline)] pb-4">
                <h2
                  id="settings-data-heading"
                  className="text-base font-semibold text-[var(--ink-primary)]"
                >
                  Dataset Integrity & Benchmark Reset
                </h2>
                <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                  Verify workspace consistency against benchmark constraints or restore the initial dataset.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[var(--accent)]" />
                    <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
                      Workspace Validation Check
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                    Runs 8 integrity checks: ID resolution, task progress alignment, focus sessions timeline, completion dates, assignees, event attendees, stat card totals, and person task counts.
                  </p>
                  <button
                    type="button"
                    onClick={handleRunCheck}
                    style={{ backgroundColor: 'var(--accent)' }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Run data check</span>
                  </button>
                </div>

                <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] space-y-3">
                  <div className="flex items-center gap-2 text-[#C9352B]">
                    <RotateCcw className="w-5 h-5" />
                    <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
                      Reset Demo Data
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                    Clears custom entries and restores the exact 6 projects, 22 tasks, 7 team members, 9 events, and focus sessions benchmark dataset.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      resetDemoData();
                      setValidationReport(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#FBECEE] text-[#C9352B] border border-[#F5C2C7] hover:bg-[#F8D7DA] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset demo data</span>
                  </button>
                </div>
              </div>

              {validationReport && (
                <div className="pt-4 border-t border-[var(--border-hairline)] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[var(--ink-primary)] uppercase tracking-wider">
                      Validation Results ({validationReport.passed ? 'ALL PASSED' : 'ISSUES DETECTED'})
                    </h3>
                    <span className="text-[10px] text-[var(--ink-muted)]">
                      Checked at {new Date(validationReport.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {validationReport.checks.map((check) => (
                      <div
                        key={check.id}
                        className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-hairline)] flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-[var(--ink-primary)]">{check.label}</p>
                          <p className="text-[11px] text-[var(--ink-secondary)]">{check.details}</p>
                        </div>
                        {check.passed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E3FCEF] text-[#216E3E] shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FBECEE] text-[#C9352B] shrink-0">
                            <XCircle className="w-3 h-3" />
                            Fail
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
