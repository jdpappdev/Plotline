import React, { useMemo, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import {
  computeProjectStatusCounts,
  computeWeeklyOutputData,
  getNextUpEvent,
  getRingsProjects,
} from '../../domain/derivations';
import { ACCENT_THEMES } from '../../lib/theme';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { CompletionRingsChart } from '../../ui/charts/CompletionRingsChart';
import { WeeklyOutputChart } from '../../ui/charts/WeeklyOutputChart';
import { InviteMemberModal } from '../team/InviteMemberModal';
import { DashboardKpiGrid } from './DashboardKpiGrid';
import { NextUpAndPortfolioSection } from './NextUpAgendaCard';
import { TeamAndTimerSection } from './TeamWorkloadPreviewCard';

export const DashboardScreen: React.FC = () => {
  const projects = useWorkspaceStore((s) => s.projects);
  const tasks = useWorkspaceStore((s) => s.tasks);
  const team = useWorkspaceStore((s) => s.team);
  const events = useWorkspaceStore((s) => s.events);
  const focusSessions = useWorkspaceStore((s) => s.focusSessions);
  const weekStart = useWorkspaceStore((s) => s.weekStart);
  const accent = useWorkspaceStore((s) => s.accent);
  const checkedInEventIds = useWorkspaceStore((s) => s.checkedInEventIds);
  const timerSeconds = useWorkspaceStore((s) => s.timerSeconds);
  const timerRunning = useWorkspaceStore((s) => s.timerRunning);
  const timerTaskId = useWorkspaceStore((s) => s.timerTaskId);

  const setActiveRoute = useWorkspaceStore((s) => s.setActiveRoute);
  const setNewProjectModalOpen = useWorkspaceStore((s) => s.setNewProjectModalOpen);
  const setImportModalOpen = useWorkspaceStore((s) => s.setImportModalOpen);
  const openProjectDialog = useWorkspaceStore((s) => s.openProjectDialog);
  const setSelectedProfileMemberId = useWorkspaceStore((s) => s.setSelectedProfileMemberId);
  const toggleEventCheckIn = useWorkspaceStore((s) => s.toggleEventCheckIn);
  const toggleTimer = useWorkspaceStore((s) => s.toggleTimer);
  const resetTimer = useWorkspaceStore((s) => s.resetTimer);
  const setTimerTask = useWorkspaceStore((s) => s.setTimerTask);

  const [inviteOpen, setInviteOpen] = useState(false);

  const statusCounts = useMemo(
    () => computeProjectStatusCounts(projects, tasks),
    [projects, tasks]
  );

  const weeklyOutput = useMemo(
    () => computeWeeklyOutputData(focusSessions, weekStart),
    [focusSessions, weekStart]
  );

  const nextEvent = useMemo(
    () => getNextUpEvent(events, projects),
    [events, projects]
  );

  const ringsProjects = useMemo(
    () => getRingsProjects(projects, tasks),
    [projects, tasks]
  );

  const accentHex = ACCENT_THEMES[accent]?.hex || ACCENT_THEMES.tide.hex;

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Plan, prioritize, and accomplish your studio tasks with ease.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setNewProjectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 text-[12px] font-bold transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <DashboardKpiGrid
          counts={statusCounts}
          onNavigateProjects={() => setActiveRoute('Projects')}
        />

        <WeeklyOutputChart
          columns={weeklyOutput.columns}
          maxSeconds={weeklyOutput.maxSeconds}
          totalWeekSeconds={weeklyOutput.totalWeekSeconds}
          totalSessionsCount={weeklyOutput.totalSessionsCount}
        />

        <NextUpAndPortfolioSection
          nextEvent={nextEvent}
          checkedInEventIds={checkedInEventIds}
          team={team}
          projects={projects}
          tasks={tasks}
          accentHex={accentHex}
          onToggleCheckIn={toggleEventCheckIn}
          onNavigateCalendar={() => setActiveRoute('Calendar')}
          onNavigateProjects={() => setActiveRoute('Projects')}
          onOpenNewProject={() => setNewProjectModalOpen(true)}
          onSelectProject={(id) => openProjectDialog(id)}
        />

        <CompletionRingsChart
          ringsProjects={ringsProjects}
          projects={projects}
          tasks={tasks}
          onSelectProject={(id) => openProjectDialog(id)}
        />

        <TeamAndTimerSection
          team={team}
          tasks={tasks}
          timerSeconds={timerSeconds}
          timerRunning={timerRunning}
          timerTaskId={timerTaskId}
          onSelectMember={(id) => setSelectedProfileMemberId(id)}
          onOpenInviteMember={() => setInviteOpen(true)}
          onToggleTimer={toggleTimer}
          onResetTimer={resetTimer}
          onSetTimerTask={setTimerTask}
        />
      </div>

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
};
