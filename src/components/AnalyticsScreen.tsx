import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { usePlotlineStore } from '../store';
import { Project, TeamMember } from '../domain/types';
import {
  AnalyticsRangeKey,
  computeLargestRemainderPercentages,
  formatShortMonthDay,
} from '../domain/derivations/analytics';
import { computeDaysAgoFromIso, formatDuration } from '../domain/derivations/time';
import { getIsoDateOffset } from '../lib/clock';
import {
  getTaskCycleDays,
  isTaskCompletedInRange,
  isTaskCompletedOnTime,
} from '../domain/derivations/tasks';
import { AnchoredPopover } from '../ui/Popover';
import { AnalyticsKpiGrid } from './analytics/AnalyticsKpiGrid';
import { ThroughputChart } from './analytics/ThroughputChart';
import { ProjectDistributionCard } from './analytics/ProjectDistributionCard';
import {
  ActivityHeatmapCard,
  getHeatmapBg,
  getHeatmapLevel,
} from './analytics/ActivityHeatmapCard';
import { ContributorBreakdownCard } from './analytics/ContributorBreakdownCard';
import { AnalyticsDailyPoint } from './analytics/types';

export { getHeatmapBg, getHeatmapLevel };

const ACCENT_TINTS = [
  'var(--accent-tint-1)',
  'var(--accent-tint-2)',
  'var(--accent-tint-3)',
  'var(--accent-tint-4)',
  'var(--accent-tint-5)',
];

export default function AnalyticsScreen() {
  const { projects, tasks, team, focusSessions, pushToast } = usePlotlineStore();

  const [mounted, setMounted] = useState(false);
  const [donutAnimated, setDonutAnimated] = useState(false);
  const [range, setRange] = useState<AnalyticsRangeKey>('30D');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);
  const exportTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      setMounted(true);
      innerId = requestAnimationFrame(() => {
        setDonutAnimated(true);
      });
    });
    return () => {
      cancelAnimationFrame(outerId);
      if (innerId) cancelAnimationFrame(innerId);
    };
  }, []);

  const rangeDays = range === '7D' ? 7 : range === '30D' ? 30 : 90;

  const uniqueProjects = useMemo(() => {
    const map = new Map<string, Project>();
    for (const p of projects) {
      if (!map.has(p.id)) map.set(p.id, p);
    }
    return Array.from(map.values());
  }, [projects]);

  const uniqueTeam = useMemo(() => {
    const map = new Map<string, TeamMember>();
    for (const m of team) {
      if (!map.has(m.id)) map.set(m.id, m);
    }
    return Array.from(map.values());
  }, [team]);

  // Normalize sessions with daysAgo and exact seconds
  const normalizedSessions = useMemo(() => {
    return focusSessions.map((s) => {
      const resolvedSeconds =
        typeof s.seconds === 'number' && s.seconds >= 0
          ? Math.round(s.seconds)
          : Math.round((s.hours || 0) * 3600);
      return {
        ...s,
        resolvedSeconds,
        resolvedDaysAgo: typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date),
      };
    });
  }, [focusSessions]);

  // Compute current period (0 .. rangeDays - 1) and previous period (rangeDays .. 2 * rangeDays - 1)
  const analyticsData = useMemo(() => {
    const currentSessions = normalizedSessions.filter(
      (s) => s.resolvedDaysAgo >= 0 && s.resolvedDaysAgo < rangeDays
    );
    const prevSessions = normalizedSessions.filter(
      (s) => s.resolvedDaysAgo >= rangeDays && s.resolvedDaysAgo < rangeDays * 2
    );

    // Strictly count store tasks whose completion date falls in the range
    const currentCompletedTasks = tasks.filter((t) => isTaskCompletedInRange(t, 0, rangeDays));
    const prevCompletedTasks = tasks.filter((t) =>
      isTaskCompletedInRange(t, rangeDays, rangeDays * 2)
    );

    const currentTasksCompleted = currentCompletedTasks.length;
    const prevTasksCompleted = prevCompletedTasks.length;

    // Sum seconds first, then format
    const currentTotalSeconds = currentSessions.reduce((acc, s) => acc + s.resolvedSeconds, 0);
    const prevTotalSeconds = prevSessions.reduce((acc, s) => acc + s.resolvedSeconds, 0);

    const currentHours = Number((currentTotalSeconds / 3600).toFixed(1));
    const prevHours = Number((prevTotalSeconds / 3600).toFixed(1));
    const currentFormattedDuration = formatDuration(currentTotalSeconds);

    // On-time delivery = completed on or before due; Cycle time = average of completion minus start days
    const currentOnTimeCount = currentCompletedTasks.filter(isTaskCompletedOnTime).length;
    const prevOnTimeCount = prevCompletedTasks.filter(isTaskCompletedOnTime).length;

    const currentOnTimePct =
      currentTasksCompleted > 0
        ? Math.round((currentOnTimeCount / currentTasksCompleted) * 100)
        : 100;
    const prevOnTimePct =
      prevTasksCompleted > 0 ? Math.round((prevOnTimeCount / prevTasksCompleted) * 100) : 100;

    const currentCycleAvg =
      currentTasksCompleted > 0
        ? Number(
            (
              currentCompletedTasks.reduce((acc, t) => acc + getTaskCycleDays(t), 0) /
              currentTasksCompleted
            ).toFixed(1)
          )
        : 0;
    const prevCycleAvg =
      prevTasksCompleted > 0
        ? Number(
            (
              prevCompletedTasks.reduce((acc, t) => acc + getTaskCycleDays(t), 0) /
              prevTasksCompleted
            ).toFixed(1)
          )
        : 0;

    // Deltas below 3 completed tasks or 30 logged hours in the previous period show "New"
    const tasksDeltaIsNew = prevTasksCompleted < 3;
    const hoursDeltaIsNew = prevHours < 30;
    const onTimeDeltaIsNew = prevTasksCompleted < 3;
    const cycleDeltaIsNew = prevTasksCompleted < 3;

    const tasksDeltaPct =
      prevTasksCompleted > 0
        ? Number(
            (((currentTasksCompleted - prevTasksCompleted) / prevTasksCompleted) * 100).toFixed(1)
          )
        : 100;
    const hoursDeltaPct =
      prevTotalSeconds > 0
        ? Number((((currentTotalSeconds - prevTotalSeconds) / prevTotalSeconds) * 100).toFixed(1))
        : 100;
    const onTimeDeltaPct = Number((currentOnTimePct - prevOnTimePct).toFixed(1));
    const cycleDeltaPct = Number(
      (((currentCycleAvg - prevCycleAvg) / Math.max(0.5, prevCycleAvg)) * 100).toFixed(1)
    );

    // Build daily series for current and previous windows (chronological: oldest -> today)
    const dailyCurrent: AnalyticsDailyPoint[] = [];

    const dailyPrevious: Array<{
      seconds: number;
      hours: number;
      tasks: number;
    }> = [];

    for (let d = rangeDays - 1; d >= 0; d--) {
      const dateStr = getIsoDateOffset(-d);
      const prevDateStr = getIsoDateOffset(-(d + rangeDays));
      const dayCurr = currentSessions.filter((s) => s.resolvedDaysAgo === d);
      const dayPrev = prevSessions.filter((s) => s.resolvedDaysAgo === d + rangeDays);

      const dayTasksCurr = currentCompletedTasks.filter((t) => t.completedDate === dateStr);
      const dayTasksPrev = prevCompletedTasks.filter((t) => t.completedDate === prevDateStr);

      const sCurr = dayCurr.reduce((a, b) => a + b.resolvedSeconds, 0);
      const hCurr = Number((sCurr / 3600).toFixed(2));
      const tCurr = dayTasksCurr.length;
      const otCurr =
        tCurr > 0
          ? Math.round((dayTasksCurr.filter(isTaskCompletedOnTime).length / tCurr) * 100)
          : currentOnTimePct;
      const cycCurr =
        tCurr > 0
          ? Number((dayTasksCurr.reduce((a, b) => a + getTaskCycleDays(b), 0) / tCurr).toFixed(1))
          : currentCycleAvg;

      dailyCurrent.push({
        daysAgo: d,
        date: dateStr,
        label: formatShortMonthDay(dateStr),
        seconds: sCurr,
        hours: hCurr,
        formattedDuration: formatDuration(sCurr),
        tasks: tCurr,
        onTimePct: otCurr,
        cycleDays: cycCurr,
      });

      const sPrev = dayPrev.reduce((a, b) => a + b.resolvedSeconds, 0);
      dailyPrevious.push({
        seconds: sPrev,
        hours: Number((sPrev / 3600).toFixed(2)),
        tasks: dayTasksPrev.length,
      });
    }

    // Add 7-day moving average to dailyCurrent
    const chartPoints = dailyCurrent.map((pt, idx) => {
      const winStart = Math.max(0, idx - 6);
      const slice = dailyCurrent.slice(winStart, idx + 1);
      const sliceAvgSeconds = slice.reduce((a, b) => a + b.seconds, 0) / Math.max(1, slice.length);
      const avg7d = Number((sliceAvgSeconds / 3600).toFixed(1));
      const prevHoursPt = dailyPrevious[idx]?.hours ?? 0;
      return {
        ...pt,
        prevHours: prevHoursPt,
        avg7d,
      };
    });

    // Sparkline 7-bucket arrays for the 4 KPI cards
    const bucketSize = Math.max(1, Math.floor(dailyCurrent.length / 7));
    const tasksSpark: number[] = [];
    const hoursSpark: number[] = [];
    const onTimeSpark: number[] = [];
    const cycleSpark: number[] = [];

    for (let i = 0; i < 7; i++) {
      const slice = dailyCurrent.slice(i * bucketSize, (i + 1) * bucketSize);
      if (slice.length === 0) continue;
      tasksSpark.push(slice.reduce((a, b) => a + b.tasks, 0));
      const sliceSeconds = slice.reduce((a, b) => a + b.seconds, 0);
      hoursSpark.push(Number((sliceSeconds / 3600).toFixed(1)));
      onTimeSpark.push(Math.round(slice.reduce((a, b) => a + b.onTimePct, 0) / slice.length));
      cycleSpark.push(
        Number((slice.reduce((a, b) => a + b.cycleDays, 0) / slice.length).toFixed(2))
      );
    }

    // Donut: Time by project — sort by hours descending, ensure integer percentages sum to 100%
    const sortedProjectTotals = uniqueProjects
      .map((proj) => {
        const projSessions = currentSessions.filter((s) => s.projectId === proj.id);
        const secs = projSessions.reduce((a, b) => a + b.resolvedSeconds, 0);
        const hrs = Number((secs / 3600).toFixed(1));
        return {
          project: proj,
          seconds: secs,
          hours: hrs,
          formattedDuration: formatDuration(secs),
        };
      })
      .filter((item) => item.seconds > 0)
      .sort((a, b) => b.seconds - a.seconds);

    const totalProjectSeconds = Math.max(
      1,
      sortedProjectTotals.reduce((a, b) => a + b.seconds, 0)
    );

    const slicePercentages = computeLargestRemainderPercentages(
      sortedProjectTotals.map((item) => item.seconds)
    );

    const projectShares = sortedProjectTotals.map((item, idx) => ({
      ...item,
      tint: ACCENT_TINTS[idx % ACCENT_TINTS.length],
      pct: slicePercentages[idx] ?? 0,
      exactFraction: item.seconds / totalProjectSeconds,
    }));

    // Contributors: task counts strictly from store tasks completed in range (by assigneeId)
    const contributors = uniqueTeam
      .map((member) => {
        const memberSessions = currentSessions.filter((s) => s.memberId === member.id);
        const secs = memberSessions.reduce((a, b) => a + b.resolvedSeconds, 0);
        const hrs = Number((secs / 3600).toFixed(1));
        const completed = currentCompletedTasks.filter((t) => t.assigneeId === member.id).length;
        return {
          member,
          seconds: secs,
          hours: hrs,
          formattedDuration: formatDuration(secs),
          tasksCompleted: completed,
        };
      })
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted || b.seconds - a.seconds);

    return {
      currentTasksCompleted,
      prevTasksCompleted,
      tasksDeltaPct,
      tasksDeltaIsNew,
      tasksSpark,
      currentTotalSeconds,
      currentFormattedDuration,
      currentHours,
      prevHours,
      hoursDeltaPct,
      hoursDeltaIsNew,
      hoursSpark,
      currentOnTimePct,
      onTimeDeltaPct,
      onTimeDeltaIsNew,
      onTimeSpark,
      currentCycleAvg,
      cycleDeltaPct,
      cycleDeltaIsNew,
      cycleSpark,
      chartPoints,
      projectShares,
      contributors,
      dailyCurrent,
    };
  }, [normalizedSessions, rangeDays, tasks, uniqueProjects, uniqueTeam]);

  const exportDateEnd = analyticsData.chartPoints.at(-1)?.date ?? getIsoDateOffset(0);
  const exportDateStart = analyticsData.chartPoints[0]?.date ?? getIsoDateOffset(-(rangeDays - 1));
  const exportFilenameDate = `${exportDateStart}_${exportDateEnd}`;

  const exportRows = useMemo(() => {
    const kpiRows = [
      {
        metric: 'Tasks completed',
        value: analyticsData.currentTasksCompleted,
        unit: 'tasks',
        previous: analyticsData.prevTasksCompleted,
        change_pct: analyticsData.tasksDeltaIsNew ? 'New' : analyticsData.tasksDeltaPct,
      },
      {
        metric: 'Focus hours',
        value: analyticsData.currentHours,
        unit: 'hours',
        previous: analyticsData.prevHours,
        change_pct: analyticsData.hoursDeltaIsNew ? 'New' : analyticsData.hoursDeltaPct,
      },
      {
        metric: 'On-time delivery',
        value: analyticsData.currentOnTimePct,
        unit: 'share_pct',
        previous: Number(
          (analyticsData.currentOnTimePct - analyticsData.onTimeDeltaPct).toFixed(1)
        ),
        change_pct: analyticsData.onTimeDeltaIsNew ? 'New' : analyticsData.onTimeDeltaPct,
      },
      {
        metric: 'Average cycle time',
        value: analyticsData.currentCycleAvg,
        unit: 'days',
        previous: Number(
          (analyticsData.currentCycleAvg / (1 + analyticsData.cycleDeltaPct / 100)).toFixed(1)
        ),
        change_pct: analyticsData.cycleDeltaIsNew ? 'New' : analyticsData.cycleDeltaPct,
      },
    ];
    return {
      kpi: kpiRows,
      projects: analyticsData.projectShares.map((p) => ({
        code: p.project.code,
        name: p.project.name,
        hours: p.hours,
        share_pct: p.pct,
      })),
      contributors: analyticsData.contributors.map((c) => ({
        name: c.member.name,
        role: c.member.role,
        hours: c.hours,
        tasks_completed: c.tasksCompleted,
      })),
      daily: analyticsData.chartPoints.map((pt) => ({
        date: pt.date,
        current: pt.hours,
        previous: pt.prevHours,
        avg_7d: pt.avg7d,
      })),
    };
  }, [analyticsData]);

  const downloadCsv = (filename: string, rows: Array<Record<string, string | number>>) => {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const escapeCsv = (value: string | number) => {
      const text = String(value ?? '');
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(',')),
    ].join('\r\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    pushToast(`Exported ${filename}`, 'UTF-8 CSV with typed numeric columns.');
  };

  const handleExportXlsx = async () => {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    Object.entries(exportRows).forEach(([name, rawRows]) => {
      const rows = rawRows as Array<Record<string, string | number>>;
      const sheet = XLSX.utils.json_to_sheet(rows);
      const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1');
      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: col })];
        if (cell) cell.s = { font: { bold: true } };
      }
      sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
      sheet['!cols'] = Object.keys(rows[0] ?? {}).map((header) => ({
        wch: Math.max(header.length, ...rows.map((row) => String(row[header] ?? '').length)) + 2,
      }));
      XLSX.utils.book_append_sheet(workbook, sheet, name.charAt(0).toUpperCase() + name.slice(1));
    });
    XLSX.writeFile(workbook, `plotline-full-report-${exportFilenameDate}.xlsx`);
    pushToast('Exported full report workbook', 'Four fitted sheets with frozen headers.');
  };

  const handleExport = (kind: keyof typeof exportRows) => {
    const filenames = {
      kpi: `plotline-kpi-${exportFilenameDate}.csv`,
      projects: `plotline-projects-${exportFilenameDate}.csv`,
      contributors: `plotline-contributors-${exportFilenameDate}.csv`,
      daily: `plotline-daily-${exportFilenameDate}.csv`,
    };
    downloadCsv(filenames[kind], exportRows[kind]);
  };

  if (!mounted) {
    return (
      <div className="max-w-[1360px] mx-auto space-y-4 pb-6 min-w-0 animate-pulse">
        <div className="h-10 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="h-28 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)]" />
          <div className="h-28 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)]" />
          <div className="h-28 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)]" />
          <div className="h-28 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          <div className="lg:col-span-7 h-64 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)]" />
          <div className="lg:col-span-5 h-64 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto space-y-4 pb-6 min-w-0">
      {/* Header Row: Title + 7D/30D/90D toggle + Export Menu */}
      <div
        style={{ '--stagger-index': 0 } as React.CSSProperties}
        className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">Analytics</h1>
          <p
            data-testid="analytics-subtitle"
            className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5"
          >
            Delivery pace, focus time by project, and cycle time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* 7D / 30D / 90D Toggle */}
          <div
            role="group"
            aria-label="Analytics time range"
            className="inline-flex items-center bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-full p-1 gap-1"
          >
            {(['7D', '30D', '90D'] as AnalyticsRangeKey[]).map((key) => {
              const active = range === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setRange(key);
                    setHoveredPointIdx(null);
                  }}
                  aria-pressed={active}
                  style={
                    active ? { backgroundColor: 'var(--accent)', color: '#ffffff' } : undefined
                  }
                  className={`px-3.5 py-1.5 min-h-[40px] sm:min-h-0 sm:py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? ''
                      : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          <button
            ref={exportTriggerRef}
            type="button"
            onClick={() => setExportMenuOpen((prev) => !prev)}
            aria-expanded={exportMenuOpen}
            aria-haspopup="menu"
            data-testid="analytics-export-trigger"
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs sm:text-sm font-semibold bg-[var(--surface-elevated)] text-[var(--ink-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
          </button>

          <AnchoredPopover
            isOpen={exportMenuOpen}
            onClose={() => setExportMenuOpen(false)}
            triggerRef={exportTriggerRef}
            title="Export analytics"
            eyebrow={`${range} Window`}
            role="menu"
            align="end"
            placement="bottom"
            widthClass="w-56"
            dataTestId="analytics-export-menu"
          >
            {(
              [
                ['kpi', 'KPI summary (.csv)'],
                ['projects', 'Projects (.csv)'],
                ['contributors', 'Contributors (.csv)'],
                ['daily', 'Daily series (.csv)'],
              ] as const
            ).map(([kind, label]) => (
              <button
                key={kind}
                type="button"
                role="menuitem"
                onClick={() => {
                  handleExport(kind);
                  setExportMenuOpen(false);
                }}
                className="block w-full min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
              >
                {label}
              </button>
            ))}
            <div className="my-1 border-t border-[var(--border-hairline)]" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                void handleExportXlsx();
                setExportMenuOpen(false);
              }}
              className="block w-full min-h-[44px] sm:min-h-0 rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs font-semibold text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
            >
              Full report (.xlsx)
            </button>
          </AnchoredPopover>
        </div>
      </div>

      {/* Row 1: Four KPI Cards (2x2 on <1024px, 4 cols on >=1024px) */}
      <AnalyticsKpiGrid
        range={range}
        currentTasksCompleted={analyticsData.currentTasksCompleted}
        tasksDeltaPct={analyticsData.tasksDeltaPct}
        tasksDeltaIsNew={analyticsData.tasksDeltaIsNew}
        tasksSpark={analyticsData.tasksSpark}
        currentTotalSeconds={analyticsData.currentTotalSeconds}
        currentFormattedDuration={analyticsData.currentFormattedDuration}
        hoursDeltaPct={analyticsData.hoursDeltaPct}
        hoursDeltaIsNew={analyticsData.hoursDeltaIsNew}
        hoursSpark={analyticsData.hoursSpark}
        currentOnTimePct={analyticsData.currentOnTimePct}
        onTimeDeltaPct={analyticsData.onTimeDeltaPct}
        onTimeDeltaIsNew={analyticsData.onTimeDeltaIsNew}
        onTimeSpark={analyticsData.onTimeSpark}
        currentCycleAvg={analyticsData.currentCycleAvg}
        cycleDeltaPct={analyticsData.cycleDeltaPct}
        cycleDeltaIsNew={analyticsData.cycleDeltaIsNew}
        cycleSpark={analyticsData.cycleSpark}
      />

      {/* Row 2: Throughput Line Chart (Cols 1-7) + Donut "Time by project" (Cols 8-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <ThroughputChart
          range={range}
          chartPoints={analyticsData.chartPoints}
          hoveredPointIdx={hoveredPointIdx}
          onHoverPointChange={setHoveredPointIdx}
        />

        <ProjectDistributionCard
          range={range}
          currentFormattedDuration={analyticsData.currentFormattedDuration}
          projectShares={analyticsData.projectShares}
          donutAnimated={donutAnimated}
          selectedProjectId={selectedProjectId}
          onToggleProject={(projectId) =>
            setSelectedProjectId((prev) => (prev === projectId ? null : projectId))
          }
        />
      </div>

      {/* Row 3: Calendar-Style Activity Heatmap (Cols 1-6) + Top Contributors (Cols 7-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <ActivityHeatmapCard
          range={range}
          dailyCurrent={analyticsData.dailyCurrent}
          selectedHeatmapDate={selectedHeatmapDate}
          onToggleDate={(dateIso) =>
            setSelectedHeatmapDate((prev) => (prev === dateIso ? null : dateIso))
          }
        />

        <ContributorBreakdownCard range={range} contributors={analyticsData.contributors} />
      </div>
    </div>
  );
}
