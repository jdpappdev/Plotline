import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  Pause,
  Play,
  Plus,
  Square,
  Video,
  X,
} from 'lucide-react';
import {
  formatDuration,
  formatLoggedDuration,
  Project,
  TaskItem,
  TeamMember,
  usePlotlineStore,
} from '../store';
import { ContourGlyph } from '../utils/contourGlyph';

interface CountUpNumeralProps {
  value: number;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}

function CountUpNumeral({
  value,
  suffix = '',
  className = '',
  style,
}: CountUpNumeralProps) {
  return (
    <span
      data-value={value}
      className={`font-display-num tabular-nums ${className}`}
      style={style}
    >
      {value}
      {suffix}
    </span>
  );
}

function formatTimerHMS(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatShortDate(isoDate: string): string {
  if (!isoDate) return '—';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const dateObj = new Date(year, month, day);
  if (Number.isNaN(dateObj.getTime())) return isoDate;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const ACCENT_TINTS = [
  'var(--accent-tint-1)',
  'var(--accent-tint-2)',
  'var(--accent-tint-3)',
  'var(--accent-tint-4)',
  'var(--accent-tint-5)',
];

function taskStatusBadge(status: TaskItem['status']): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'Done':
      return {
        label: 'Completed',
        bg: '#E8F4EC',
        text: '#216E3E',
        border: '#B5DFC4',
      };
    case 'In Progress':
      return {
        label: 'In Progress',
        bg: '#FEF5E6',
        text: '#9B5B0B',
        border: '#F5D69E',
      };
    case 'In Review':
      return {
        label: 'In Review',
        bg: 'var(--accent-soft)',
        text: 'var(--accent)',
        border: 'var(--accent-border)',
      };
    case 'Backlog':
    default:
      return {
        label: 'Pending',
        bg: '#FBECEE',
        text: '#B43342',
        border: '#F1B9C0',
      };
  }
}

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
    importSampleBatch,
    toggleEventCheckIn,
    toggleTimer,
    resetTimer,
    setTimerTask,
  } = usePlotlineStore();

  // Task selector popover inside Focus card
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const taskPickerRef = useRef<HTMLDivElement>(null);

  // Hovered day column in Weekly Output
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Project Rings 700ms mount animation state
  const [ringsAnimated, setRingsAnimated] = useState<boolean>(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setRingsAnimated(true);
      return;
    }
    const id = requestAnimationFrame(() => {
      setRingsAnimated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!taskPickerOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (taskPickerRef.current && !taskPickerRef.current.contains(e.target as Node)) {
        setTaskPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [taskPickerOpen]);

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
    const map = new Map<string, { project: Project; tint: string }>();
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
  const memberCollaborationRows = useMemo(() => {
    const uniqueMembers = new Map<string, TeamMember>();
    for (const m of team) {
      if (!uniqueMembers.has(m.id)) {
        uniqueMembers.set(m.id, m);
      }
    }
    const tasksByUpdatedAt = [...uniqueTasks].sort(
      (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
    );

    const rows = Array.from(uniqueMembers.values()).map((member) => {
      const assignedTask =
        (timerRunning
          ? tasksByUpdatedAt.find(
              (t) =>
                (t.assigneeId === member.id || t.coAssigneeId === member.id) &&
                t.id === timerTaskId
            )
          : undefined) ||
        tasksByUpdatedAt.find(
          (t) => t.assigneeId === member.id || t.coAssigneeId === member.id
        ) ||
        tasksByUpdatedAt[0];
      return { member, task: assignedTask };
    });

    return rows
      .sort((a, b) => (b.task?.updatedAt ?? 0) - (a.task?.updatedAt ?? 0))
      .slice(0, 4);
  }, [team, uniqueTasks, timerRunning, timerTaskId]);

  // --- Store-Derived Metrics ---
  // Row 1: Four equal stat cards (3 cols each): Total, Ended, Running, Pending
  const totalCount = uniqueProjects.length + uniqueTasks.length;
  const endedCount =
    uniqueProjects.filter((p) => p.status === 'Completed').length +
    uniqueTasks.filter((t) => t.status === 'Done').length;
  const runningCount =
    uniqueProjects.filter((p) => p.status === 'On Track' || p.status === 'At Risk').length +
    uniqueTasks.filter((t) => t.status === 'In Progress' || t.status === 'In Review').length;
  const pendingCount =
    uniqueProjects.filter((p) => p.status === 'Planning').length +
    uniqueTasks.filter((t) => t.status === 'Backlog').length;

  // Row 2 Col 1-6: Weekly output — 7 slim columns (~28px wide, 8px radius), segmented by project with 2px gaps
  const todayWeekdayIndex = new Date().getDay();

  const dayOrder =
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
        ];

  const weeklyColumns = useMemo(() => {
    return dayOrder.map((d, idx) => {
      const daySessions = focusSessions.filter(
        (s) => (s.daysAgo === undefined || s.daysAgo < 7) && s.weekdayIndex === d.dayIndex
      );
      const byProject = new Map<
        string,
        {
          projectId: string;
          projectName: string;
          tint: string;
          seconds: number;
          hours: number;
        }
      >();

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

  // Row 2 Col 7-9: Next up (formerly Reminders)
  const nextEvent = events[0];
  const isMeetingStarted = nextEvent
    ? checkedInEventIds.includes(nextEvent.id)
    : false;

  // Row 3 Col 6-9: Project rings — up to 4 concentric rings for the projects due soonest
  const soonestProjects = useMemo(() => {
    return [...uniqueProjects]
      .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
      .slice(0, 4);
  }, [uniqueProjects]);

  const overallRingsProgress = useMemo(() => {
    if (soonestProjects.length === 0) return 0;
    const sum = soonestProjects.reduce((acc, p) => acc + p.progress, 0);
    return Math.round(sum / soonestProjects.length);
  }, [soonestProjects]);

  const ringRadii = [60, 49, 38, 27];
  const ringStrokeWidth = 6;

  // Active Focus Task
  const activeFocusTask = useMemo(
    () => tasks.find((t) => t.id === timerTaskId) || tasks[0],
    [tasks, timerTaskId]
  );

  return (
    <div className="max-w-[1360px] mx-auto lg:h-full flex flex-col gap-3">
      {/* Header Row: Page title + one-line subtitle, "New project" primary button, "Import" secondary */}
      <div
        style={{ '--stagger-index': 0 } as React.CSSProperties}
        className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0"
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)] leading-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5 truncate">
            Plan, prioritize, and coordinate field engineering streams with clarity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setNewProjectModalOpen(true)}
            style={{ backgroundColor: 'var(--accent)' }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>New project</span>
          </button>

          <button
            type="button"
            onClick={() => importSampleBatch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[var(--surface-elevated)] text-[var(--ink-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-sunken)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Responsive Grid:
          - >=1024px (lg): 12 columns, locked 3 rows so 1440x900 fits with no scroll
          - 640px–1023px (sm): 2 columns
          - <640px: 1 column */}
      <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[114px_minmax(0,1fr)_minmax(0,1fr)] gap-3.5">
        {/* ==================== ROW 1: FOUR EQUAL STAT CARDS (3 COLS EACH) ==================== */}
        {/* Card 1: Total (Uses --surface-accent, white text >=4.5:1) */}
        <div
          style={{
            '--stagger-index': 1,
            background: 'var(--surface-accent)',
          } as React.CSSProperties}
          className="plotline-enter sm:col-span-1 lg:col-span-3 rounded-[var(--radius-lg)] p-4 text-white flex flex-col justify-between shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white">Total</span>
            <button
              type="button"
              onClick={() => setNewProjectModalOpen(true)}
              aria-label="Add project"
              style={{ color: 'var(--accent-deep)' }}
              className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <CountUpNumeral
            value={totalCount}
            className="text-4xl font-semibold leading-none tracking-tight text-white"
          />
          <p className="text-xs text-white/90 truncate">
            {uniqueProjects.length} active streams and {tasks.length} deliverables
          </p>
        </div>

        {/* Card 2: Ended */}
        <div
          style={{ '--stagger-index': 2 } as React.CSSProperties}
          className="plotline-enter sm:col-span-1 lg:col-span-3 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[var(--ink-primary)]">Ended</span>
            <span className="w-7 h-7 rounded-full border border-[var(--border-strong)] text-[var(--ink-primary)] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <CountUpNumeral
            value={endedCount}
            className="text-4xl font-semibold leading-none tracking-tight text-[var(--ink-primary)]"
          />
          <p className="text-xs text-[var(--ink-secondary)] truncate">
            Verified and signed off this cycle
          </p>
        </div>

        {/* Card 3: Running */}
        <div
          style={{ '--stagger-index': 3 } as React.CSSProperties}
          className="plotline-enter sm:col-span-1 lg:col-span-3 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[var(--ink-primary)]">Running</span>
            <span className="w-7 h-7 rounded-full border border-[var(--border-strong)] text-[var(--ink-primary)] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <CountUpNumeral
            value={runningCount}
            className="text-4xl font-semibold leading-none tracking-tight text-[var(--ink-primary)]"
          />
          <p className="text-xs text-[var(--ink-secondary)] truncate">
            Active field execution across {uniqueProjects.length} streams
          </p>
        </div>

        {/* Card 4: Pending */}
        <div
          style={{ '--stagger-index': 4 } as React.CSSProperties}
          className="plotline-enter sm:col-span-1 lg:col-span-3 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[var(--ink-primary)]">Pending</span>
            <span className="w-7 h-7 rounded-full border border-[var(--border-strong)] text-[var(--ink-primary)] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <CountUpNumeral
            value={pendingCount}
            className="text-4xl font-semibold leading-none tracking-tight text-[var(--ink-primary)]"
          />
          <p className="text-xs text-[var(--ink-secondary)] truncate">
            Scheduled in planning and intake queue
          </p>
        </div>

        {/* ==================== ROW 2: WEEKLY OUTPUT (6) + NEXT UP (3) + PROJECTS (3) ==================== */}
        {/* Weekly Output (6 cols): 7 slim columns (~28px wide, 8px radius), segmented by project with 2px gaps */}
        <section
          aria-labelledby="weekly-output-heading"
          style={{ '--stagger-index': 5 } as React.CSSProperties}
          className="plotline-enter sm:col-span-2 lg:col-span-6 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between min-h-0 relative"
        >
          <div className="flex items-center justify-between shrink-0">
            <h2
              id="weekly-output-heading"
              className="text-base font-semibold text-[var(--ink-primary)]"
            >
              Weekly Output
            </h2>
            <span
              data-testid="weekly-output-total"
              data-seconds={weekTotalSeconds}
              className="text-xs text-[var(--ink-muted)] font-ui-tabular"
            >
              {weekStart === 'monday' ? 'Mon–Sun' : 'Sun–Sat'} ·{' '}
              {formatDuration(weekTotalSeconds)} total
            </span>
          </div>

          {/* Seven slim columns (~28px wide, 8px radius), segmented by project with 2px gaps */}
          <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 pt-7 pb-1 px-2 min-h-[140px]">
            {weeklyColumns.map((col, colIdx) => {
              const colHeightPct =
                col.totalSeconds > 0
                  ? Math.max(
                      24,
                      Math.min(100, Math.round((col.totalHours / maxDailyHours) * 100))
                    )
                  : 18;
              const isHovered = hoveredDayIndex === col.dayIndex;
              const tooltipPosClass =
                colIdx <= 1
                  ? 'left-0'
                  : colIdx >= 5
                  ? 'right-0'
                  : 'left-1/2 -translate-x-1/2';

              return (
                <div
                  key={col.key}
                  onMouseEnter={() => setHoveredDayIndex(col.dayIndex)}
                  onMouseLeave={() => setHoveredDayIndex(null)}
                  onFocus={() => setHoveredDayIndex(col.dayIndex)}
                  onBlur={() => setHoveredDayIndex(null)}
                  tabIndex={0}
                  aria-label={`${col.full}: ${col.formattedTotal} across ${col.segments.length} projects`}
                  className="relative flex-1 h-full flex flex-col items-center justify-end gap-1.5 group rounded-[var(--radius-sm)]"
                >
                  {/* Hover Per-Project Breakdown Tooltip */}
                  {isHovered && (
                    <div
                      role="tooltip"
                      className={`absolute bottom-full mb-2 ${tooltipPosClass} w-48 sm:w-52 bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-lg p-2.5 z-30 pointer-events-none text-[11px] space-y-1.5`}
                    >
                      <div className="flex items-center justify-between font-semibold text-[var(--ink-primary)] border-b border-[var(--border-hairline)] pb-1">
                        <span>
                          {col.full} {col.isToday ? '(Today)' : ''}
                        </span>
                        <span className="font-ui-tabular" style={{ color: 'var(--accent)' }}>
                          {col.formattedTotal}
                        </span>
                      </div>
                      {col.segments.length === 0 ? (
                        <p className="text-[var(--ink-muted)]">No sessions logged</p>
                      ) : (
                        <div className="space-y-1">
                          {col.segments.map((seg) => (
                            <div
                              key={seg.projectId}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: seg.tint }}
                                />
                                <span className="truncate text-[var(--ink-secondary)]">
                                  {seg.projectName}
                                </span>
                              </span>
                              <span className="font-ui-tabular font-semibold text-[var(--ink-primary)] shrink-0">
                                {formatDuration(seg.seconds)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative w-full flex-1 flex items-end justify-center">
                    {/* Slim 28px column container with 8px radius and 2px segment gaps */}
                    <div
                      data-testid={col.isToday ? 'weekly-output-today-column' : undefined}
                      style={{
                        height: `${colHeightPct}%`,
                        outline: col.isToday ? '2px solid var(--accent)' : undefined,
                        outlineOffset: col.isToday ? '2px' : undefined,
                      }}
                      className="relative w-[28px] rounded-[8px] flex flex-col justify-end gap-[2px] p-[1px] transition-all duration-250 ease-plotline"
                    >
                      {/* Today's Total-Duration Label */}
                      {col.isToday && (
                        <span
                          data-testid="weekly-output-today-hours"
                          data-seconds={col.totalSeconds}
                          style={{ color: 'var(--accent)' }}
                          className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-elevated)] border border-[var(--accent-border)] text-[10px] font-semibold font-ui-tabular whitespace-nowrap shadow-2xs"
                        >
                          {col.formattedTotal}
                        </span>
                      )}

                      {col.segments.length === 0 ? (
                        <div className="w-full h-full rounded-[6px] bg-[var(--surface-sunken)]" />
                      ) : (
                        col.segments.map((seg) => {
                          const segShare =
                            col.totalSeconds > 0
                              ? (seg.seconds / col.totalSeconds) * 100
                              : 100;
                          return (
                            <div
                              key={seg.projectId}
                              style={{
                                height: `${Math.max(14, segShare)}%`,
                                backgroundColor: seg.tint,
                              }}
                              className="w-full rounded-[6px] transition-all duration-250 ease-plotline"
                            />
                          );
                        })
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-medium ${
                      col.isToday
                        ? 'font-bold text-[var(--ink-primary)]'
                        : 'text-[var(--ink-muted)]'
                    }`}
                  >
                    {col.short}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Next up (3 cols — renamed from Reminders; Start meeting button uses --accent) */}
        <section
          aria-labelledby="next-up-heading"
          style={{ '--stagger-index': 6 } as React.CSSProperties}
          className="plotline-enter sm:col-span-1 lg:col-span-3 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-2 min-h-0"
        >
          <h2
            id="next-up-heading"
            className="text-base font-semibold text-[var(--ink-primary)] shrink-0"
          >
            Next up
          </h2>

          {nextEvent ? (
            <>
              <div className="my-auto space-y-1">
                <h3
                  className="text-base sm:text-lg font-semibold leading-snug line-clamp-2"
                  style={{ color: 'var(--accent)' }}
                >
                  {nextEvent.title}
                </h3>
                <p className="text-xs text-[var(--ink-secondary)]">
                  Time : {nextEvent.startTime} - {nextEvent.endTime}
                </p>
                <p className="text-xs text-[var(--ink-muted)] truncate">
                  {nextEvent.location}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleEventCheckIn(nextEvent.id)}
                style={{
                  backgroundColor: 'var(--accent)',
                }}
                className="w-full py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer shrink-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]"
              >
                <Video className="w-4 h-4 shrink-0" />
                <span>{isMeetingStarted ? 'Meeting Active' : 'Start meeting'}</span>
              </button>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-2">
              <ContourGlyph seed="dashboard-next-up-empty" size={38} />
              <p className="text-xs text-[var(--ink-secondary)]">
                No upcoming meetings scheduled.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveRoute('Calendar');
                  window.history.replaceState(null, '', '#/calendar');
                }}
                style={{ color: 'var(--accent)' }}
                className="text-xs font-semibold hover:underline cursor-pointer"
              >
                + Schedule in Calendar
              </button>
            </div>
          )}
        </section>

        {/* Projects (3 cols — shows 5 rows with 36px deterministic contourGlyph icon tiles and NO inner scroll) */}
        <section
          aria-labelledby="projects-card-heading"
          style={{ '--stagger-index': 7 } as React.CSSProperties}
          className="plotline-enter sm:col-span-1 lg:col-span-3 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-1.5 min-h-0 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 shrink-0">
            <h2
              id="projects-card-heading"
              className="text-base font-semibold text-[var(--ink-primary)]"
            >
              Projects
            </h2>
            <button
              type="button"
              onClick={() => setNewProjectModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[var(--border-strong)] text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          </div>

          {uniqueProjects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-2">
              <ContourGlyph seed="dashboard-projects-empty" size={38} />
              <p className="text-xs text-[var(--ink-secondary)]">
                No active project streams yet.
              </p>
              <button
                type="button"
                onClick={() => setNewProjectModalOpen(true)}
                style={{ color: 'var(--accent)' }}
                className="text-xs font-semibold hover:underline cursor-pointer"
              >
                + Create first project
              </button>
            </div>
          ) : (
            <ul className="flex-1 flex flex-col justify-between min-h-0 overflow-hidden">
              {uniqueProjects.slice(0, 5).map((project) => {
                const isNew = project.id === lastAddedProjectId;
                return (
                  <li
                    key={project.id}
                    className={`flex items-center gap-2.5 py-0.5 rounded-[var(--radius-sm)] ${
                      isNew ? 'plotline-row-new' : ''
                    }`}
                  >
                    <span
                      className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0"
                      title={`Contour glyph for ${project.name}`}
                    >
                      <ContourGlyph seed={project.id} size={36} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--ink-primary)] truncate leading-tight">
                        {project.name}
                      </p>
                      <p className="text-[10px] text-[var(--ink-muted)] truncate leading-tight">
                        Due date: {formatShortDate(project.targetDate)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ==================== ROW 3: IN MOTION (5) + PROJECT RINGS (4) + FOCUS (3) ==================== */}
        {/* In motion (5 cols — renamed from Team Collaboration; one row per unique member) */}
        <section
          aria-labelledby="in-motion-heading"
          style={{ '--stagger-index': 8 } as React.CSSProperties}
          className="plotline-enter sm:col-span-2 lg:col-span-5 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-2 min-h-0 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 shrink-0">
            <h2
              id="in-motion-heading"
              className="text-base font-semibold text-[var(--ink-primary)]"
            >
              In motion
            </h2>
            <button
              type="button"
              onClick={() => setNewProjectModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[var(--border-strong)] text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Stream</span>
            </button>
          </div>

          {memberCollaborationRows.length === 0 || tasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-2">
              <ContourGlyph seed="dashboard-in-motion-empty" size={38} />
              <p className="text-xs text-[var(--ink-secondary)]">
                No deliverables in motion right now.
              </p>
              <button
                type="button"
                onClick={() => setNewTaskModalOpen(true)}
                style={{ color: 'var(--accent)' }}
                className="text-xs font-semibold hover:underline cursor-pointer"
              >
                + Dispatch a task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-hairline)] flex-1 flex flex-col justify-around min-h-0">
              {memberCollaborationRows.map(({ member, task }) => {
                if (!task) return null;
                const badge = taskStatusBadge(task.status);
                const isTaskRunning = timerRunning && task.id === timerTaskId;
                return (
                  <div
                    key={member.id}
                    className="py-1 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        {member.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)] truncate leading-tight">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-[var(--ink-secondary)] truncate">
                          Working on{' '}
                          <span className="font-medium text-[var(--ink-primary)]">
                            {task.title}
                          </span>
                          {task.loggedSeconds ? (
                            <span
                              className="ml-1.5 font-ui-tabular font-semibold"
                              style={{ color: 'var(--accent)' }}
                            >
                              (+{formatLoggedDuration(task.loggedSeconds)})
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isTaskRunning && (
                        <span
                          style={{
                            backgroundColor: 'var(--accent-soft)',
                            color: 'var(--accent)',
                            borderColor: 'var(--accent-border)',
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] border text-[10px] font-semibold whitespace-nowrap"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                          <span>Running</span>
                        </span>
                      )}
                      <span
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                          borderColor: badge.border,
                        }}
                        className="px-2 py-0.5 rounded-[var(--radius-xs)] border text-[11px] font-medium whitespace-nowrap shrink-0"
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Project Rings (4 cols — up to 4 concentric rings for the projects due soonest, track var(--line), round caps, arcs in accent tints, animated from 0 over 700ms on mount) */}
        <section
          aria-labelledby="project-rings-heading"
          style={{ '--stagger-index': 9 } as React.CSSProperties}
          className="plotline-enter sm:col-span-1 lg:col-span-4 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between min-h-0"
        >
          <div className="flex items-center justify-between shrink-0">
            <h2
              id="project-rings-heading"
              className="text-base font-semibold text-[var(--ink-primary)]"
            >
              Project Rings
            </h2>
            <span className="text-[11px] text-[var(--ink-muted)]">Due soonest</span>
          </div>

          {/* Concentric Rings + Compact Legend */}
          {soonestProjects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-2">
              <ContourGlyph seed="dashboard-rings-empty" size={38} />
              <p className="text-xs text-[var(--ink-secondary)]">
                Add a project to view completion rings.
              </p>
            </div>
          ) : (
            <div className="my-auto flex items-center justify-between gap-2.5 min-h-0">
              <div className="relative w-[112px] h-[112px] xl:w-[132px] xl:h-[132px] flex items-center justify-center shrink-0 mx-auto">
                <svg
                  viewBox="0 0 136 136"
                  className="w-full h-full overflow-visible"
                  aria-label={`Overall project completion ${overallRingsProgress}%`}
                >
                  {soonestProjects.map((proj, idx) => {
                    const r = ringRadii[idx] ?? 27;
                    const circumference = 2 * Math.PI * r;
                    const targetPct = Math.min(100, Math.max(0, proj.progress));
                    const dashOffset = ringsAnimated
                      ? circumference - (targetPct / 100) * circumference
                      : circumference;
                    const tint = ACCENT_TINTS[idx % ACCENT_TINTS.length];

                    return (
                      <g key={proj.id}>
                        {/* Track var(--line) */}
                        <circle
                          cx="68"
                          cy="68"
                          r={r}
                          fill="none"
                          stroke="var(--line)"
                          strokeWidth={ringStrokeWidth}
                        />
                        {/* Animated Arc in Accent Tint */}
                        <circle
                          cx="68"
                          cy="68"
                          r={r}
                          fill="none"
                          stroke={tint}
                          strokeWidth={ringStrokeWidth}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          transform="rotate(-90 68 68)"
                          style={{
                            transition:
                              'stroke-dashoffset 700ms var(--ease-plotline), stroke 250ms var(--ease-plotline)',
                          }}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Center Overall % in Serif Numeral Face */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <CountUpNumeral
                    value={overallRingsProgress}
                    suffix="%"
                    className="text-xl font-semibold text-[var(--ink-primary)] leading-none"
                  />
                  <span className="text-[9px] text-[var(--ink-muted)] mt-0.5">
                    Overall
                  </span>
                </div>
              </div>

              {/* Compact Legend (Name + %) */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {soonestProjects.map((proj, idx) => {
                  const tint = ACCENT_TINTS[idx % ACCENT_TINTS.length];
                  return (
                    <div
                      key={proj.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tint }}
                        />
                        <span className="text-[11px] font-medium text-[var(--ink-secondary)] truncate">
                          {proj.name}
                        </span>
                      </span>
                      <span className="text-[11px] font-semibold font-ui-tabular text-[var(--ink-primary)] shrink-0">
                        {proj.progress}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Focus (3 cols — renamed from Time Tracker; large white contourGlyph at 8-10% opacity seeded from active task id; tappable "Focusing on: [task]" line under buttons) */}
        <section
          aria-labelledby="focus-card-heading"
          data-tour="timer"
          ref={taskPickerRef}
          style={{
            '--stagger-index': 10,
            background: 'var(--surface-accent)',
          } as React.CSSProperties}
          className="plotline-enter sm:col-span-1 lg:col-span-3 time-tracker-surface rounded-[var(--radius-lg)] p-3.5 text-white flex flex-col justify-between w-full lg:h-full max-h-[212px] self-start relative overflow-hidden"
        >
          {/* Large Contour Glyph Texture in White at 8–10% Opacity, Seeded from Active Task ID */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -bottom-6 z-0 flex items-center justify-center"
          >
            <ContourGlyph
              seed={activeFocusTask?.id || 'focus-default'}
              size={210}
              stroke="#ffffff"
              strokeWidth={1.25}
              minOpacity={0.08}
              maxOpacity={0.10}
            />
          </div>

          {/* Top-left title "Focus" 13px/500 in white + pulsing red dot ONLY while running */}
          <div className="relative z-10 flex items-center justify-between shrink-0">
            <h2
              id="focus-card-heading"
              className="text-[13px] font-medium text-white leading-none"
            >
              Focus
            </h2>
            {timerRunning && (
              <span
                aria-label="Recording active"
                className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"
              />
            )}
          </div>

          {/* Centered HH:MM:SS in UI sans, tabular-nums, white */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center">
            <div
              data-testid="focus-timer-readout"
              className="font-ui-tabular text-[32px] xl:text-[38px] font-semibold tracking-tight leading-none text-white text-center select-none"
            >
              {formatTimerHMS(timerSeconds)}
            </div>

            {/* Two 44px round buttons with 12px between: white play/pause (icon in --accent-deep) & red stop (logs session & resets) */}
            <div className="mt-2.5 flex items-center justify-center gap-3 shrink-0">
              <button
                type="button"
                onClick={toggleTimer}
                aria-label={timerRunning ? 'Pause timer' : 'Start timer'}
                style={{ color: 'var(--accent-deep)' }}
                className="w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xs"
              >
                {timerRunning ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                aria-label="Stop and log focus session"
                className="w-[44px] h-[44px] rounded-full bg-[#DC2626] text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xs"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* Tappable "Focusing on: [task]" line under the buttons */}
          <div className="relative z-20 pt-1 shrink-0">
            <button
              type="button"
              onClick={() => setTaskPickerOpen((prev) => !prev)}
              aria-expanded={taskPickerOpen}
              aria-haspopup="listbox"
              className="w-full px-2.5 py-1 rounded-[var(--radius-sm)] bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] text-white flex items-center justify-between gap-1.5 cursor-pointer transition-colors"
            >
              <span className="truncate text-left">
                <span className="text-white/75">Focusing on: </span>
                <span className="font-semibold text-white">
                  {activeFocusTask?.title || 'Select task'}
                </span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/80 shrink-0" />
            </button>

            {/* Task Chooser Popover */}
            {taskPickerOpen && (
              <div
                role="listbox"
                aria-label="Choose task to focus on"
                className="absolute bottom-full mb-1.5 left-0 right-0 max-h-44 overflow-y-auto bg-[var(--surface-elevated)] text-[var(--ink-primary)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-xl p-1 z-40 space-y-0.5"
              >
                {tasks.map((t) => {
                  const isCurrent = t.id === activeFocusTask?.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="option"
                      aria-selected={isCurrent}
                      onClick={() => {
                        setTimerTask(t.id);
                        setTaskPickerOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-[var(--radius-xs)] text-xs flex items-center justify-between gap-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-[var(--accent-soft)] font-semibold text-[var(--ink-primary)]'
                          : 'hover:bg-[var(--surface-sunken)] text-[var(--ink-primary)]'
                      }`}
                    >
                      <span className="truncate">
                        <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                          {t.code}
                        </span>{' '}
                        · {t.title}
                      </span>
                      {isCurrent && (
                        <Check
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: 'var(--accent)' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
