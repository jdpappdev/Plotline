import React, { useMemo } from 'react';
import { Download, Plus } from 'lucide-react';
import { usePlotlineStore } from '../store';
import { Project, TaskItem, TeamMember } from '../domain/types';
import { computeDaysAgoFromIso, formatDuration } from '../domain/derivations/time';
import { computeProjectStatusCounts } from '../domain/derivations/projects';
import { getMemberWorkload } from '../domain/derivations/team';
import { getNow } from '../lib/clock';
import { DashboardStatCards } from './dashboard/DashboardStatCards';
import { NextUpPanel } from './dashboard/NextUpPanel';
import { FocusTimerPanel } from './dashboard/FocusTimerPanel';
import { InMotionPanel } from './dashboard/InMotionPanel';
import { WeeklyOutputSection } from './dashboard/WeeklyOutputSection';
import { DashboardProjectsPanel } from './dashboard/DashboardProjectsPanel';
import { ProjectRingsSection } from './dashboard/ProjectRingsSection';
import {
  DashboardProjectTintEntry,
  MemberCollaborationRow,
  WeeklyOutputDayColumn,
  WeeklyOutputProjectSegment,
} from './dashboard/types';

const ACCENT_TINTS = [
  'var(--accent-tint-1)',
  'var(--accent-tint-2)',
  'var(--accent-tint-3)',
  'var(--accent-tint-4)',
  'var(--accent-tint-5)',
] as const;

export default function DashboardScreen() {
  const {
    projects,
    tasks,
    team,
    events,
    focusSessions,
    weekStart,
    lastAddedProjectId,
    checkedInEventIds,
    timerSeconds,
    timerRunning,
    timerTaskId,
    setNewProjectModalOpen,
    setNewTaskModalOpen,
    setActiveRoute,
    toggleEventCheckIn,
    toggleTimer,
    resetTimer,
    setTimerTask,
    openProjectDialog,
    setImportModalOpen,
    deleteProject,
  } = usePlotlineStore();

  // Dedupe project rows by id
  const uniqueProjects = useMemo(() => {
    const map = new Map<string, Project>();
    for (const p of projects) {
      if (!map.has(p.id)) {
        map.set(p.id, p);
      }
    }
    return Array.from(map.values());
  }, [projects]);

  const projectIndexMap = useMemo(() => {
    const map = new Map<string, DashboardProjectTintEntry>();
    uniqueProjects.forEach((p, idx) => {
      map.set(p.id, {
        project: p,
        tint: ACCENT_TINTS[idx % ACCENT_TINTS.length],
      });
    });
    return map;
  }, [uniqueProjects]);

  // Dedupe tasks by id (preserving column/store order)
  const uniqueTasks = useMemo(() => {
    const map = new Map<string, TaskItem>();
    for (const t of tasks) {
      if (!map.has(t.id)) {
        map.set(t.id, t);
      }
    }
    return Array.from(map.values());
  }, [tasks]);

  // Dedupe team members by id, pick each member's most recently updated task, and sort In motion by updatedAt descending
  const memberCollaborationRows = useMemo<MemberCollaborationRow[]>(() => {
    const uniqueMembers = new Map<string, TeamMember>();
    for (const m of team) {
      if (!uniqueMembers.has(m.id)) {
        uniqueMembers.set(m.id, m);
      }
    }
    const openTasks = uniqueTasks.filter((t) => t.status !== 'Done');
    const tasksByUpdatedAt = [...openTasks].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

    const rows: MemberCollaborationRow[] = [];
    for (const member of uniqueMembers.values()) {
      const memberOpenTasks = tasksByUpdatedAt.filter(
        (t) => t.assigneeId === member.id || t.coAssigneeId === member.id
      );
      if (memberOpenTasks.length === 0) continue;
      const assignedTask =
        (timerRunning ? memberOpenTasks.find((t) => t.id === timerTaskId) : undefined) ||
        memberOpenTasks[0];
      rows.push({
        member,
        task: assignedTask,
        workloadPct: getMemberWorkload(member.id, uniqueTasks),
      });
    }

    return rows.sort((a, b) => (b.task?.updatedAt ?? 0) - (a.task?.updatedAt ?? 0)).slice(0, 4);
  }, [team, uniqueTasks, timerRunning, timerTaskId]);

  // --- Store-Derived Metrics ---
  const { totalCount, endedCount, runningCount, pendingCount } = useMemo(
    () => computeProjectStatusCounts(uniqueProjects, tasks),
    [uniqueProjects, tasks]
  );
  const openTasksCount = uniqueTasks.filter((t) => t.status !== 'Done').length;

  // Weekly output — 7 slim columns, segmented by project with 2px gaps
  const todayWeekdayIndex = getNow().getDay();

  const dayOrder = useMemo(
    () =>
      weekStart === 'monday'
        ? [
            { dayIndex: 1, short: 'M', full: 'Monday' },
            { dayIndex: 2, short: 'T', full: 'Tuesday' },
            { dayIndex: 3, short: 'W', full: 'Wednesday' },
            { dayIndex: 4, short: 'T', full: 'Thursday' },
            { dayIndex: 5, short: 'F', full: 'Friday' },
            { dayIndex: 6, short: 'S', full: 'Saturday' },
            { dayIndex: 0, short: 'S', full: 'Sunday' },
          ]
        : [
            { dayIndex: 0, short: 'S', full: 'Sunday' },
            { dayIndex: 1, short: 'M', full: 'Monday' },
            { dayIndex: 2, short: 'T', full: 'Tuesday' },
            { dayIndex: 3, short: 'W', full: 'Wednesday' },
            { dayIndex: 4, short: 'T', full: 'Thursday' },
            { dayIndex: 5, short: 'F', full: 'Friday' },
            { dayIndex: 6, short: 'S', full: 'Saturday' },
          ],
    [weekStart]
  );

  const weeklyColumns = useMemo<WeeklyOutputDayColumn[]>(() => {
    return dayOrder.map((d, idx) => {
      const daySessions = focusSessions.filter((s) => {
        const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
        return dAgo >= 0 && dAgo < 7 && s.weekdayIndex === d.dayIndex;
      });
      const byProject = new Map<string, WeeklyOutputProjectSegment>();

      for (const s of daySessions) {
        const sessionSeconds =
          typeof s.seconds === 'number' && s.seconds >= 0
            ? Math.round(s.seconds)
            : Math.round((s.hours || 0) * 3600);
        if (sessionSeconds <= 0) continue;
        const meta = projectIndexMap.get(s.projectId);
        const projectName = meta?.project.name || 'Field Stream';
        const tint = meta?.tint || 'var(--accent)';
        const existing = byProject.get(s.projectId);
        if (existing) {
          existing.seconds += sessionSeconds;
          existing.hours = existing.seconds / 3600;
        } else {
          byProject.set(s.projectId, {
            projectId: s.projectId,
            projectName,
            tint,
            seconds: sessionSeconds,
            hours: sessionSeconds / 3600,
          });
        }
      }

      const segments = Array.from(byProject.values());
      const totalSeconds = segments.reduce((sum, seg) => sum + seg.seconds, 0);
      const totalHours = totalSeconds / 3600;
      const formattedTotal = formatDuration(totalSeconds);
      const isToday = d.dayIndex === todayWeekdayIndex;

      return {
        ...d,
        key: `${d.short}-${idx}`,
        segments,
        totalHours,
        totalSeconds,
        formattedTotal,
        isToday,
      };
    });
  }, [dayOrder, focusSessions, projectIndexMap, todayWeekdayIndex]);

  const weekTotalSeconds = useMemo(
    () => weeklyColumns.reduce((acc, c) => acc + c.totalSeconds, 0),
    [weeklyColumns]
  );

  const maxDailyHours = useMemo(
    () => Math.max(7.5, ...weeklyColumns.map((c) => c.totalHours)),
    [weeklyColumns]
  );

  // Next up
  const nextEvent = events[0];
  const isMeetingStarted = nextEvent ? checkedInEventIds.includes(nextEvent.id) : false;

  // Project rings — up to 4 concentric rings for the projects due soonest
  const soonestProjects = useMemo(() => {
    return [...uniqueProjects].sort((a, b) => a.targetDate.localeCompare(b.targetDate)).slice(0, 4);
  }, [uniqueProjects]);

  const overallRingsProgress = useMemo(() => {
    if (soonestProjects.length === 0) return 0;
    const sum = soonestProjects.reduce((acc, p) => acc + p.progress, 0);
    return Math.round(sum / soonestProjects.length);
  }, [soonestProjects]);

  // Active Focus Task
  const activeFocusTask = useMemo(
    () => tasks.find((t) => t.id === timerTaskId) || tasks[0],
    [tasks, timerTaskId]
  );

  const handleNavigateProjects = (statusFilter?: 'ended' | 'running' | 'pending') => {
    setActiveRoute('Projects');
    if (typeof window !== 'undefined') {
      const hash = statusFilter ? `#/projects?status=${statusFilter}` : '#/projects';
      window.history.pushState(null, '', hash);
    }
  };

  const handleOpenCalendar = () => {
    setActiveRoute('Calendar');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '#calendar');
    }
  };

  const handleOpenTask = (taskId: string) => {
    setActiveRoute('Tasks');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `#/tasks?taskId=${taskId}`);
    }
  };

  return (
    <div className="dashboard-shell max-w-[1360px] mx-auto flex min-w-0 flex-col gap-3">
      {/* Header Row: Page title + one-line subtitle, "New project" primary button, "Import" secondary */}
      <div
        style={{ '--stagger-index': 0 } as React.CSSProperties}
        className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0"
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)] leading-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5 truncate">
            Plan, prioritize, and track your studio's projects.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setNewProjectModalOpen(true)}
            style={{ backgroundColor: 'var(--accent)' }}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>New project</span>
          </button>

          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[var(--surface-elevated)] text-[var(--ink-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-sunken)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Responsive Grid:
          - <640px: 2-col base grid where the 4 stat cards are col-span-1 (2x2 grid) and all other cards are col-span-2 (single column) in exact order:
            stat cards (2x2), Next up, Focus timer, In motion, Weekly output, Projects, Project rings.
          - 640-1023px: 2 columns (sm:grid-cols-2).
          - >=1280px: 12-column desktop bento (xl:grid-cols-12). */}
      <div className="dashboard-grid flex-1 xl:min-h-0 min-w-0 grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-12 gap-3 sm:gap-3.5 [grid-auto-rows:auto]">
        <DashboardStatCards
          totalCount={totalCount}
          endedCount={endedCount}
          runningCount={runningCount}
          pendingCount={pendingCount}
          openTasksCount={openTasksCount}
          onNavigateProjects={handleNavigateProjects}
        />

        <NextUpPanel
          nextEvent={nextEvent}
          isMeetingStarted={isMeetingStarted}
          onOpenCalendar={handleOpenCalendar}
          onToggleCheckIn={toggleEventCheckIn}
        />

        <FocusTimerPanel
          tasks={tasks}
          activeFocusTask={activeFocusTask}
          timerSeconds={timerSeconds}
          timerRunning={timerRunning}
          onToggleTimer={toggleTimer}
          onResetTimer={resetTimer}
          onSelectTask={setTimerTask}
        />

        <InMotionPanel
          rows={memberCollaborationRows}
          hasTasks={tasks.length > 0}
          timerRunning={timerRunning}
          timerTaskId={timerTaskId}
          activityLabel="Activity notifications"
          onAddTask={() => setNewTaskModalOpen(true)}
          onOpenTask={handleOpenTask}
        />

        <WeeklyOutputSection
          weekStart={weekStart}
          weeklyColumns={weeklyColumns}
          weekTotalSeconds={weekTotalSeconds}
          maxDailyHours={maxDailyHours}
        />

        <DashboardProjectsPanel
          projects={uniqueProjects}
          lastAddedProjectId={lastAddedProjectId}
          onNewProject={() => setNewProjectModalOpen(true)}
          onOpenProject={openProjectDialog}
          onDeleteProject={deleteProject}
        />

        <ProjectRingsSection
          soonestProjects={soonestProjects}
          overallRingsProgress={overallRingsProgress}
          accentTints={ACCENT_TINTS}
          onOpenProject={openProjectDialog}
        />
      </div>
    </div>
  );
}
