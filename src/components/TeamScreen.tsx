import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Mail, MapPin, MessageSquare, User, UserPlus } from 'lucide-react';
import { usePlotlineStore } from '../store'; import { Project, TaskItem, TeamMember, CalendarEvent, EventCategory, AccentName, RouteId, Department, PresenceStatus } from '../domain/types';;
import { ContourGlyph } from '../utils/contourGlyph';
import { Dialog } from '../ui/Dialog';
import { priorityChipStyle } from './TasksScreen';
import { DeleteButton } from './DeleteButton';

const DEPARTMENT_FILTERS: Array<'All' | Department> = [
  'All',
  'Engineering',
  'Design',
  'Marketing',
  'Management',
];

function presenceDotColor(presence: PresenceStatus): string {
  switch (presence) {
    case 'online':
      return '#16A34A';
    case 'away':
      return '#D97706';
    case 'offline':
    default:
      return '#9CA3AF';
  }
}

function presenceTextLabel(presence: PresenceStatus): string {
  switch (presence) {
    case 'online':
      return 'Online';
    case 'away':
      return 'Away';
    case 'offline':
    default:
      return 'Offline';
  }
}

function UtilizationRing40({ pct }: { pct: number }) {
  const normalizedPct = Math.min(100, Math.max(0, pct));
  const strokeColor =
    normalizedPct >= 100 ? '#DC2626' : normalizedPct >= 85 ? '#D97706' : 'var(--accent)';

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalizedPct / 100);

  return (
    <div className="relative w-[40px] h-[40px] flex items-center justify-center shrink-0 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeOpacity={0.12}
          strokeWidth="4"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-ui-tabular text-[var(--ink-primary)]">
        {normalizedPct}%
      </span>
    </div>
  );
}

export default function TeamScreen() {
  const {
    team,
    tasks,
    searchQuery,
    currentUser,
    selectedProfileMemberId,
    setSelectedProfileMemberId,
    moveTask,
    addTeamMember,
    deleteMember,
    pushToast,
  } = usePlotlineStore();

  const [selectedDept, setSelectedDept] = useState<'All' | Department>('All');
  const prefersReducedMotion = useReducedMotion();

  // Invite Member Modal State
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteDept, setInviteDept] = useState<Department>('Engineering');
  const [inviteLocation, setInviteLocation] = useState('');
  const [inviteError, setInviteError] = useState('');
  const inviteNameRef = useRef<HTMLInputElement>(null);

  // Dedupe team members by id and compute live task counts & workload % from store.tasks
  const enrichedMembers = useMemo(() => {
    const unique = new Map<string, TeamMember>();
    for (const m of team) {
      if (!unique.has(m.id)) unique.set(m.id, m);
    }

    return Array.from(unique.values()).map((member) => {
      const memberTasks = tasks.filter(
        (t) => t.assigneeId === member.id || t.coAssigneeId === member.id
      );
      const openTasks = memberTasks.filter((t) => t.status !== 'Done');
      const completedTasks = memberTasks.filter((t) => t.status === 'Done');
      const openHours = openTasks.reduce((sum, t) => sum + t.estimateHours, 0);
      const rawUtilization = Math.round(
        ((openHours + 10) / Math.max(20, member.capacityHours)) * 100
      );
      const workloadPct = Math.min(100, Math.max(18, rawUtilization));

      return {
        member,
        memberTasks,
        openCount: openTasks.length,
        completedCount: completedTasks.length,
        workloadPct,
      };
    });
  }, [team, tasks]);

  const onlineCount = useMemo(
    () => enrichedMembers.filter((m) => m.member.presence === 'online').length,
    [enrichedMembers]
  );

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedMembers.filter((m) => {
      if (selectedDept !== 'All' && m.member.department !== selectedDept) {
        return false;
      }
      if (
        q &&
        !m.member.name.toLowerCase().includes(q) &&
        !m.member.role.toLowerCase().includes(q) &&
        !m.member.department.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [enrichedMembers, selectedDept, searchQuery]);

  const activeProfileData = useMemo(
    () =>
      selectedProfileMemberId
        ? enrichedMembers.find((m) => m.member.id === selectedProfileMemberId) || null
        : null,
    [enrichedMembers, selectedProfileMemberId]
  );

  const handleOpenProfile = (memberId: string) => {
    setSelectedProfileMemberId(memberId);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) {
      setInviteError('Member name is required.');
      return;
    }
    if (!inviteRole.trim()) {
      setInviteError('Role title is required.');
      return;
    }

    addTeamMember({
      name: inviteName.trim(),
      role: inviteRole.trim(),
      department: inviteDept,
      location: inviteLocation.trim() || 'Stockholm, SE',
    });

    setInviteName('');
    setInviteRole('');
    setInviteLocation('');
    setInviteOpen(false);
  };

  return (
    <div className="max-w-[1360px] mx-auto space-y-5 pb-6 min-w-0">
      {/* Header Row: Title, Subtitle, "N online now", "Invite member" button */}
      <div
        style={{ '--stagger-index': 0 } as React.CSSProperties}
        className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">Team</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-elevated)] border border-[var(--border-hairline)] text-[var(--ink-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>{onlineCount} online now</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5">
            Studio specialists, discipline capacity, and active deliverable assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setInviteError('');
            setInviteOpen(true);
            setTimeout(() => inviteNameRef.current?.focus(), 40);
          }}
          style={{ backgroundColor: 'var(--accent)' }}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer shrink-0 self-start sm:self-auto shadow-2xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite member</span>
        </button>
      </div>

      {/* Department Filter Chips */}
      <div
        role="group"
        aria-label="Filter team by department"
        style={{ '--stagger-index': 1 } as React.CSSProperties}
        className="plotline-enter flex items-center gap-1.5 flex-wrap bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2.5"
      >
        {DEPARTMENT_FILTERS.map((dept) => {
          const isSelected = selectedDept === dept;
          return (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              aria-pressed={isSelected}
              style={
                isSelected ? { backgroundColor: 'var(--accent)', color: '#ffffff' } : undefined
              }
              className={`px-3.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isSelected
                  ? ''
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
              }`}
            >
              {dept}
            </button>
          );
        })}
      </div>

      {/* Team Cards Grid: Single-column on <640px, 2 cols on 640-1023px, 3 cols on 1024px+ */}
      {filteredMembers.length === 0 ? (
        <div
          data-testid="team-empty-state"
          className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-8 flex flex-col items-center justify-center text-center gap-3"
        >
          <ContourGlyph seed="team-roster-empty-state" size={48} />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
              No specialists found in this view
            </h2>
            <p className="text-xs text-[var(--ink-secondary)]">
              Reset your department filter or invite a new specialist to the roster.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {selectedDept !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedDept('All')}
                className="px-3.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold bg-[var(--surface-sunken)] text-[var(--ink-primary)] border border-[var(--border-strong)] hover:bg-[var(--border-hairline)] cursor-pointer"
              >
                Show all departments
              </button>
            )}
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              style={{ backgroundColor: 'var(--accent)' }}
              className="px-3.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold text-white hover:opacity-95 cursor-pointer"
            >
              + Invite member
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          layout={!prefersReducedMotion}
          data-testid="team-cards-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredMembers.map(({ member, openCount, completedCount, workloadPct }, idx) => (
              <motion.article
                layout={!prefersReducedMotion}
                key={member.id}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }
                }
                style={{ '--stagger-index': idx + 2 } as React.CSSProperties}
                className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 sm:p-5 flex flex-col justify-between gap-4 min-w-0"
              >
                {/* Top: Initials Avatar with Presence Dot + Name, Role, Department Chip */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <span
                        style={{ backgroundColor: 'var(--accent)' }}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                      >
                        {member.initials}
                      </span>
                      <span
                        title={presenceTextLabel(member.presence)}
                        style={{
                          backgroundColor: presenceDotColor(member.presence),
                        }}
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--surface-elevated)]"
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-semibold text-[var(--ink-primary)] truncate">
                        {member.name}
                      </h2>
                      <p className="text-xs text-[var(--ink-secondary)] truncate">{member.role}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface-sunken)] text-[var(--ink-secondary)] border border-[var(--border-hairline)] whitespace-nowrap shrink-0">
                    {member.department}
                  </span>
                </div>

                {/* Middle: Open vs Completed Counts + Workload Bar with % */}
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] flex items-center justify-between">
                      <span className="text-xs text-[var(--ink-secondary)]">Open</span>
                      <span className="text-sm font-semibold font-ui-tabular text-[var(--ink-primary)]">
                        {openCount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] flex items-center justify-between">
                      <span className="text-xs text-[var(--ink-secondary)]">Completed</span>
                      <span className="text-sm font-semibold font-ui-tabular text-[var(--ink-primary)]">
                        {completedCount}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--ink-secondary)]">Workload</span>
                      <span
                        data-testid={`workload-pct-${member.id}`}
                        className="font-semibold font-ui-tabular text-[var(--ink-primary)]"
                      >
                        {workloadPct}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden">
                      <div
                        style={{
                          width: `${workloadPct}%`,
                          backgroundColor: 'var(--accent)',
                        }}
                        className="h-full rounded-full transition-all duration-300 ease-plotline"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer: Message & Profile & Delete Buttons */}
                <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      pushToast(
                        `Direct dispatch opened for ${member.name}`,
                        `${member.email} · ${member.timezone}`
                      )
                    }
                    className="flex-1 min-h-[44px] sm:min-h-0 py-2 px-2.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-sunken)] text-xs font-semibold text-[var(--ink-primary)] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
                    <span>Message</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenProfile(member.id)}
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      borderColor: 'var(--accent-border)',
                    }}
                    className="flex-1 min-h-[44px] sm:min-h-0 py-2 px-2.5 rounded-[var(--radius-sm)] border text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>

                  <DeleteButton
                    name={member.name}
                    disabled={member.id === currentUser.id}
                    disabledTooltip="You can't delete your own profile."
                    onDelete={() => deleteMember(member.id)}
                  />
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Team Member Profile Dialog (Hero Variant) */}
      <Dialog
        isOpen={!!activeProfileData}
        onClose={() => setSelectedProfileMemberId(null)}
        variant="hero"
        eyebrow={activeProfileData?.member.department}
        title={activeProfileData?.member.name}
        subtitle={activeProfileData?.member.role}
        heroData={
          activeProfileData
            ? {
                glyphSeed: activeProfileData.member.id,
                avatarInitials: activeProfileData.member.initials,
                presence: activeProfileData.member.presence,
                meta: `${activeProfileData.member.location} · ${presenceTextLabel(
                  activeProfileData.member.presence
                )}`,
              }
            : undefined
        }
        footer={
          activeProfileData ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <DeleteButton
                  name={activeProfileData.member.name}
                  disabled={activeProfileData.member.id === currentUser.id}
                  disabledTooltip="You can't delete your own profile."
                  onDelete={() => deleteMember(activeProfileData.member.id)}
                />

                <button
                  type="button"
                  onClick={() =>
                    pushToast(
                      `Direct dispatch opened for ${activeProfileData.member.name}`,
                      `${activeProfileData.member.email} · ${activeProfileData.member.timezone}`
                    )
                  }
                  style={{ backgroundColor: 'var(--accent)' }}
                  className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 py-2 px-4 rounded-full text-xs font-semibold text-white hover:opacity-95 inline-flex items-center justify-center gap-1.5 transition-opacity cursor-pointer shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `mailto:${activeProfileData.member.email}`;
                  }}
                  className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 py-2 px-4 rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-sunken)] text-xs font-semibold text-[var(--ink-primary)] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
                  <span>Email</span>
                </button>
              </div>

              <span className="text-xs text-[var(--ink-muted)] inline-flex items-center gap-1 self-start sm:self-auto">
                <MapPin className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
                <span>{activeProfileData.member.timezone}</span>
              </span>
            </div>
          ) : undefined
        }
      >
        {activeProfileData && (
          <div className="flex flex-col">
            {/* Stats: Three identical tiles using dashboard stat-card style at compact size */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-6 pt-4 pb-3 shrink-0">
              <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2.5 sm:p-3 text-center shadow-2xs flex flex-col items-center justify-center h-[80px]">
                <span className="text-xl sm:text-2xl font-semibold font-display-num text-[var(--ink-primary)] leading-none">
                  {activeProfileData.openCount}
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-[var(--ink-secondary)] mt-1.5">
                  Open tasks
                </span>
              </div>

              <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2.5 sm:p-3 text-center shadow-2xs flex flex-col items-center justify-center h-[80px]">
                <span className="text-xl sm:text-2xl font-semibold font-display-num text-[var(--ink-primary)] leading-none">
                  {activeProfileData.completedCount}
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-[var(--ink-secondary)] mt-1.5">
                  Completed
                </span>
              </div>

              <div className="bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-2.5 sm:p-3 text-center shadow-2xs flex flex-col items-center justify-center h-[80px]">
                <UtilizationRing40 pct={activeProfileData.workloadPct} />
                <span className="text-[11px] sm:text-xs font-medium text-[var(--ink-secondary)] mt-1">
                  Utilization
                </span>
              </div>
            </div>

            {/* Task rows */}
            <div className="px-4 sm:px-6 pt-2 pb-6">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)]">
                  Assigned Tasks ({activeProfileData.memberTasks.length})
                </h3>
                <span className="text-[11px] text-[var(--ink-muted)]">Live store sync</span>
              </div>

              {activeProfileData.memberTasks.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center bg-[var(--surface-canvas)] rounded-[var(--radius-md)] border border-[var(--border-hairline)] gap-2 my-2">
                  <p className="text-xs text-[var(--ink-secondary)]">
                    No tasks currently assigned to this specialist.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5 pb-2">
                  {activeProfileData.memberTasks.map((t) => {
                    const prioStyle = priorityChipStyle(t.priority);
                    return (
                      <li
                        key={t.id}
                        className="p-3.5 rounded-[var(--radius-md)] bg-[var(--surface-canvas)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] transition-colors space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <p className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)] leading-snug line-clamp-2 min-w-0">
                            {t.title}
                          </p>
                          <select
                            aria-label={`Change stage for ${t.title}`}
                            value={t.status}
                            onChange={(e) => moveTask(t.id, e.target.value as TaskItem['status'])}
                            className="min-h-[36px] sm:min-h-0 px-2 py-1 rounded-[var(--radius-xs)] border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[11px] font-medium text-[var(--ink-primary)] shrink-0 cursor-pointer"
                          >
                            <option value="Backlog">To do</option>
                            <option value="In Progress">In progress</option>
                            <option value="In Review">In review</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] font-medium bg-[var(--surface-sunken)] text-[var(--ink-secondary)]">
                              {t.category || 'Engineering'}
                            </span>
                            <span
                              style={{
                                backgroundColor: prioStyle.bg,
                                color: prioStyle.fg,
                                borderColor: prioStyle.border,
                              }}
                              className="px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] font-medium border"
                            >
                              {t.priority}
                            </span>
                          </div>
                          <span className="text-[var(--ink-muted)]">Due {t.dueDate}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        eyebrow="Studio Roster"
        title="Invite member"
        maxWidthClass="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
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
          onSubmit={handleInviteSubmit}
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
              onChange={(e) => {
                setInviteName(e.target.value);
                if (inviteError) setInviteError('');
              }}
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
              onChange={(e) => {
                setInviteRole(e.target.value);
                if (inviteError) setInviteError('');
              }}
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
                onChange={(e) => setInviteDept(e.target.value as Department)}
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
                onChange={(e) => setInviteLocation(e.target.value)}
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
    </div>
  );
}
