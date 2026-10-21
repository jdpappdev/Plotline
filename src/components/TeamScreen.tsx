import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { UserPlus } from 'lucide-react';
import { usePlotlineStore } from '../store';
import { Department, TeamMember } from '../domain/types';
import {
  getMemberAssignedTasks,
  getMemberTaskCounts,
  getMemberWorkload,
} from '../domain/derivations';
import { ContourGlyph } from '../utils/contourGlyph';
import { TeamMemberCard } from './team/TeamMemberCard';
import { TeamProfileDialog } from './team/TeamProfileDialog';
import { TeamInviteDialog } from './team/TeamInviteDialog';
import { TeamMessageDialog } from './team/TeamMessageDialog';
import { DEPARTMENT_FILTERS, EnrichedTeamMember } from './team/types';

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
  const [messageMember, setMessageMember] = useState<TeamMember | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteDept, setInviteDept] = useState<Department>('Engineering');
  const [inviteLocation, setInviteLocation] = useState('');
  const [inviteError, setInviteError] = useState('');
  const inviteNameRef = useRef<HTMLInputElement>(null);

  // Dedupe team members by id and compute live task counts & workload % from store.tasks
  const enrichedMembers = useMemo<EnrichedTeamMember[]>(() => {
    const unique = new Map<string, TeamMember>();
    for (const m of team) {
      if (!unique.has(m.id)) unique.set(m.id, m);
    }

    return Array.from(unique.values()).map((member) => {
      const memberTasks = getMemberAssignedTasks(member.id, tasks);
      const { openCount, completedCount } = getMemberTaskCounts(member.id, tasks);
      const workloadPct = getMemberWorkload(member.id, tasks);

      return {
        member,
        memberTasks,
        openCount,
        completedCount,
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

  const handleMessageMember = (member: TeamMember) => {
    setMessageMember(member);
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
            Roles, workload and current assignments.
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
              <TeamMemberCard
                key={member.id}
                member={member}
                openCount={openCount}
                completedCount={completedCount}
                workloadPct={workloadPct}
                staggerIndex={idx + 2}
                prefersReducedMotion={prefersReducedMotion}
                currentUserId={currentUser.id}
                onMessage={handleMessageMember}
                onOpenProfile={handleOpenProfile}
                onDeleteMember={deleteMember}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <TeamProfileDialog
        activeProfileData={activeProfileData}
        currentUserId={currentUser.id}
        onClose={() => setSelectedProfileMemberId(null)}
        onDeleteMember={deleteMember}
        onMessageMember={handleMessageMember}
        onMoveTask={moveTask}
      />

      <TeamMessageDialog
        member={messageMember}
        onClose={() => setMessageMember(null)}
        onPushToast={pushToast}
      />

      <TeamInviteDialog
        isOpen={inviteOpen}
        inviteName={inviteName}
        inviteRole={inviteRole}
        inviteDept={inviteDept}
        inviteLocation={inviteLocation}
        inviteError={inviteError}
        inviteNameRef={inviteNameRef}
        onClose={() => setInviteOpen(false)}
        onNameChange={(value) => {
          setInviteName(value);
          if (inviteError) setInviteError('');
        }}
        onRoleChange={(value) => {
          setInviteRole(value);
          if (inviteError) setInviteError('');
        }}
        onDeptChange={setInviteDept}
        onLocationChange={setInviteLocation}
        onSubmit={handleInviteSubmit}
      />
    </div>
  );
}
