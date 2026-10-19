import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ChevronDown, Download } from 'lucide-react';
import { usePlotlineStore } from '../store'; import { Project, TaskItem, TeamMember, CalendarEvent, EventCategory, AccentName, RouteId } from '../domain/types';;
import { computeDaysAgoFromIso, formatDuration } from '../domain/derivations/time';
import { getIsoDateOffset } from '../lib/clock';
import {
  getTaskCycleDays,
  isTaskCompletedInRange,
  isTaskCompletedOnTime,
} from '../domain/derivations/tasks';
import { AnchorBox, AnchoredPopover, AnchoredTooltip } from '../ui/Popover';
import { ContourGlyph } from '../utils/contourGlyph';

type RangeKey = '7D' | '30D' | '90D';

const ACCENT_TINTS = [
  'var(--accent-tint-1)',
  'var(--accent-tint-2)',
  'var(--accent-tint-3)',
  'var(--accent-tint-4)',
  'var(--accent-tint-5)',
];

const WEEKDAY_ROW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function formatShortMonthDay(dateIso: string): string {
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3) return dateIso;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMondayFirstRowIndex(dateIso: string): number {
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3) return 0;
  const jsDay = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getDay();
  return (jsDay + 6) % 7; // Mon = 0 .. Sun = 6
}

interface SparklineProps {
  values: number[];
  id: string;
}

function SvgSparkline({ values, id }: SparklineProps) {
  if (values.length < 2) return null;
  const width = 96;
  const height = 28;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values, minVal + 0.1);
  const span = maxVal - minVal || 1;

  const pts = values.map((v, idx) => {
    const x = (idx / (values.length - 1)) * (width - 4) + 2;
    const y = height - 4 - ((v - minVal) / span) * (height - 8);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `M ${pts[0].x},${height} L ${pts
    .map((p) => `${p.x},${p.y}`)
    .join(' L ')} L ${pts[pts.length - 1].x},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-16 sm:w-24 h-auto overflow-visible shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${id})`} />
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polyline}
      />
    </svg>
  );
}

// 5 clearly different shades for the calendar heatmap
export function getHeatmapLevel(hours: number): 0 | 1 | 2 | 3 | 4 {
  if (hours <= 0) return 0;
  if (hours < 3.5) return 1;
  if (hours < 5.0) return 2;
  if (hours < 6.5) return 3;
  return 4;
}

export function getHeatmapBg(hours: number): string {
  const level = getHeatmapLevel(hours);
  switch (level) {
    case 0:
      return 'var(--surface-sunken)';
    case 1:
      return 'color-mix(in oklab, var(--accent) 24%, var(--surface-sunken))';
    case 2:
      return 'color-mix(in oklab, var(--accent) 48%, var(--surface-sunken))';
    case 3:
      return 'color-mix(in oklab, var(--accent) 74%, var(--surface-sunken))';
    case 4:
    default:
      return 'var(--accent)';
  }
}

export default function AnalyticsScreen() {
  const { projects, tasks, team, focusSessions, pushToast } = usePlotlineStore();

  const [mounted, setMounted] = useState(false);
  const [donutAnimated, setDonutAnimated] = useState(false);
  const [range, setRange] = useState<RangeKey>('30D');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [tooltipAnchorRect, setTooltipAnchorRect] = useState<AnchorBox | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);
  const exportTriggerRef = useRef<HTMLButtonElement | null>(null);
  const throughputSvgRef = useRef<SVGSVGElement | null>(null);

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
    const dailyCurrent: Array<{
      daysAgo: number;
      date: string;
      label: string;
      seconds: number;
      hours: number;
      formattedDuration: string;
      tasks: number;
      onTimePct: number;
      cycleDays: number;
    }> = [];

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

    // Largest Remainder Method so integer percentages sum to exactly 100%
    const rawPercentages = sortedProjectTotals.map(
      (item) => (item.seconds / totalProjectSeconds) * 100
    );
    const flooredPercentages = rawPercentages.map((p) => Math.floor(p));
    let remainderToDistribute =
      sortedProjectTotals.length > 0 ? 100 - flooredPercentages.reduce((a, b) => a + b, 0) : 0;
    const indicesByRemainder = rawPercentages
      .map((p, idx) => ({ idx, rem: p - flooredPercentages[idx] }))
      .sort((a, b) => b.rem - a.rem);

    for (let i = 0; i < indicesByRemainder.length && remainderToDistribute > 0; i++) {
      flooredPercentages[indicesByRemainder[i].idx] += 1;
      remainderToDistribute -= 1;
    }

    const projectShares = sortedProjectTotals.map((item, idx) => ({
      ...item,
      tint: ACCENT_TINTS[idx % ACCENT_TINTS.length],
      pct: flooredPercentages[idx] ?? 0,
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

  // Build calendar-style heatmap structure: 7 rows (Mon–Sun), columns = weeks
  const heatmapCalendar = useMemo(() => {
    const days = analyticsData.dailyCurrent;
    if (days.length === 0) {
      return {
        numWeeks: 1,
        weekHeaders: [''],
        rows: WEEKDAY_ROW_LABELS.map((label, rIdx) => ({
          label,
          rowIndex: rIdx,
          cells: [null as (typeof days)[number] | null],
        })),
      };
    }

    const firstRow = getMondayFirstRowIndex(days[0].date);
    const numWeeks = Math.ceil((firstRow + days.length) / 7);

    const matrix: Array<Array<(typeof days)[number] | null>> = Array.from({ length: 7 }, () =>
      Array.from({ length: numWeeks }, () => null)
    );

    const weekHeaders: string[] = Array.from({ length: numWeeks }, () => '');

    days.forEach((day, idx) => {
      const offset = firstRow + idx;
      const colIdx = Math.floor(offset / 7);
      const rowIdx = offset % 7;
      matrix[rowIdx][colIdx] = day;
      if (!weekHeaders[colIdx]) {
        weekHeaders[colIdx] = day.label;
      }
    });

    return {
      numWeeks,
      weekHeaders,
      rows: WEEKDAY_ROW_LABELS.map((label, rIdx) => ({
        label,
        rowIndex: rIdx,
        cells: matrix[rIdx],
      })),
    };
  }, [analyticsData.dailyCurrent]);

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

  // Throughput SVG geometry
  const svgW = 620;
  const svgH = 190;
  const padL = 32;
  const padR = 14;
  const padT = 16;
  const padB = 26;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxChartVal = useMemo(() => {
    const vals = analyticsData.chartPoints.flatMap((p) => [p.hours, p.prevHours, p.avg7d]);
    return Math.max(9, ...vals);
  }, [analyticsData.chartPoints]);

  const chartCoords = useMemo(() => {
    const n = analyticsData.chartPoints.length;
    return analyticsData.chartPoints.map((pt, idx) => {
      const x = padL + (n <= 1 ? 0 : (idx / (n - 1)) * plotW);
      const yCurr = padT + plotH - (pt.hours / maxChartVal) * plotH;
      const yPrev = padT + plotH - (pt.prevHours / maxChartVal) * plotH;
      const yAvg = padT + plotH - (pt.avg7d / maxChartVal) * plotH;
      return {
        ...pt,
        x: Number(x.toFixed(1)),
        yCurr: Number(yCurr.toFixed(1)),
        yPrev: Number(yPrev.toFixed(1)),
        yAvg: Number(yAvg.toFixed(1)),
      };
    });
  }, [analyticsData.chartPoints, maxChartVal, plotH, plotW]);

  // Today (Sunday) = 0h, so the dashed segment is omitted when today has 0 hours
  const todayHasHours = (chartCoords.at(-1)?.seconds ?? 0) > 0;
  const solidChartCoords = todayHasHours
    ? chartCoords.slice(0, Math.max(1, chartCoords.length - 1))
    : chartCoords;
  const currentLineSolidPoints = solidChartCoords.map((p) => `${p.x},${p.yCurr}`).join(' ');
  const currentLineTodayDashedPoints =
    todayHasHours && chartCoords.length >= 2
      ? chartCoords
          .slice(-2)
          .map((p) => `${p.x},${p.yCurr}`)
          .join(' ')
      : '';
  const prevLinePoints = chartCoords.map((p) => `${p.x},${p.yPrev}`).join(' ');
  const avgLinePoints = chartCoords.map((p) => `${p.x},${p.yAvg}`).join(' ');
  const currentAreaPath =
    chartCoords.length > 1
      ? `M ${chartCoords[0].x},${padT + plotH} L ${chartCoords
          .map((p) => `${p.x},${p.yCurr}`)
          .join(' L ')} L ${chartCoords[chartCoords.length - 1].x},${padT + plotH} Z`
      : '';

  const hoveredPoint = hoveredPointIdx !== null ? chartCoords[hoveredPointIdx] || null : null;

  const updateThroughputTooltipRect = useCallback(
    (idx: number | null) => {
      if (idx === null || !throughputSvgRef.current) {
        setTooltipAnchorRect(null);
        return;
      }
      const pt = chartCoords[idx];
      if (!pt) {
        setTooltipAnchorRect(null);
        return;
      }
      const svgRect = throughputSvgRef.current.getBoundingClientRect();
      const px = svgRect.left + (pt.x / svgW) * svgRect.width;
      const py = svgRect.top + (pt.yCurr / svgH) * svgRect.height;
      setTooltipAnchorRect({
        top: py - 10,
        bottom: py + 10,
        left: px - 10,
        right: px + 10,
        width: 20,
        height: 20,
      });
    },
    [chartCoords, svgH, svgW]
  );

  useEffect(() => {
    updateThroughputTooltipRect(hoveredPointIdx);
  }, [hoveredPointIdx, updateThroughputTooltipRect]);

  const selectedProjectShare = useMemo(
    () =>
      selectedProjectId
        ? analyticsData.projectShares.find((p) => p.project.id === selectedProjectId) || null
        : null,
    [analyticsData.projectShares, selectedProjectId]
  );

  const selectedHeatmapDay = useMemo(
    () =>
      selectedHeatmapDate
        ? analyticsData.dailyCurrent.find((d) => d.date === selectedHeatmapDate) || null
        : null,
    [analyticsData.dailyCurrent, selectedHeatmapDate]
  );

  // Donut geometry — segments sum to 100% with zero grey gap
  const donutRadius = 54;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulativeDonutPct = 0;

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
            {(['7D', '30D', '90D'] as RangeKey[]).map((key) => {
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
      <div
        data-testid="analytics-kpi-grid"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5"
      >
        {/* KPI 1: Tasks completed */}
        <div
          style={{ '--stagger-index': 1 } as React.CSSProperties}
          className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-3 min-w-0"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--ink-secondary)] truncate">
              Tasks completed
            </span>
            {analyticsData.tasksDeltaIsNew ? (
              <span
                data-testid="kpi-delta-tasks"
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] shrink-0"
              >
                New
              </span>
            ) : (
              <span
                data-testid="kpi-delta-tasks"
                className={`inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-ui-tabular shrink-0 ${
                  analyticsData.tasksDeltaPct >= 0 ? 'text-[#216E3E]' : 'text-[#B43342]'
                }`}
              >
                {analyticsData.tasksDeltaPct >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
                {analyticsData.tasksDeltaPct >= 0 ? '+' : ''}
                {analyticsData.tasksDeltaPct}%
              </span>
            )}
          </div>

          <div className="flex items-end justify-between gap-1.5 sm:gap-2 min-w-0">
            <div className="min-w-0">
              <span
                data-testid="kpi-tasks-completed"
                className="text-2xl sm:text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none block truncate"
              >
                {analyticsData.currentTasksCompleted}
              </span>
              <span className="block text-[10px] sm:text-[11px] text-[var(--ink-muted)] mt-1 truncate">
                vs. previous {range}
              </span>
            </div>
            <SvgSparkline values={analyticsData.tasksSpark} id="tasks" />
          </div>
        </div>

        {/* KPI 2: Focus hours */}
        <div
          style={{ '--stagger-index': 2 } as React.CSSProperties}
          className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-3 min-w-0"
        >
          <div className="flex items-center justify-between gap-1">
            <span
              data-testid="kpi-focus-hours-label"
              className="text-[11px] sm:text-xs font-semibold text-[var(--ink-secondary)] truncate"
            >
              Focus hours
            </span>
            {analyticsData.hoursDeltaIsNew ? (
              <span
                data-testid="kpi-delta-hours"
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] shrink-0"
              >
                New
              </span>
            ) : (
              <span
                data-testid="kpi-delta-hours"
                className={`inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-ui-tabular shrink-0 ${
                  analyticsData.hoursDeltaPct >= 0 ? 'text-[#216E3E]' : 'text-[#B43342]'
                }`}
              >
                {analyticsData.hoursDeltaPct >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
                {analyticsData.hoursDeltaPct >= 0 ? '+' : ''}
                {analyticsData.hoursDeltaPct}%
              </span>
            )}
          </div>

          <div className="flex items-end justify-between gap-1.5 sm:gap-2 min-w-0">
            <div className="min-w-0">
              <span
                data-testid="kpi-hours-tracked"
                data-seconds={analyticsData.currentTotalSeconds}
                className="text-2xl sm:text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none block truncate"
              >
                {analyticsData.currentFormattedDuration}
              </span>
              <span className="block text-[10px] sm:text-[11px] text-[var(--ink-muted)] mt-1 truncate">
                vs. previous {range}
              </span>
            </div>
            <SvgSparkline values={analyticsData.hoursSpark} id="hours" />
          </div>
        </div>

        {/* KPI 3: On-time delivery */}
        <div
          style={{ '--stagger-index': 3 } as React.CSSProperties}
          className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-3 min-w-0"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--ink-secondary)] truncate">
              On-time delivery
            </span>
            {analyticsData.onTimeDeltaIsNew ? (
              <span
                data-testid="kpi-delta-ontime"
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] shrink-0"
              >
                New
              </span>
            ) : (
              <span
                data-testid="kpi-delta-ontime"
                className={`inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-ui-tabular shrink-0 ${
                  analyticsData.onTimeDeltaPct >= 0 ? 'text-[#216E3E]' : 'text-[#B43342]'
                }`}
              >
                {analyticsData.onTimeDeltaPct >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
                {analyticsData.onTimeDeltaPct >= 0 ? '+' : ''}
                {analyticsData.onTimeDeltaPct}%
              </span>
            )}
          </div>

          <div className="flex items-end justify-between gap-1.5 sm:gap-2 min-w-0">
            <div className="min-w-0">
              <span
                data-testid="kpi-ontime-delivery"
                className="text-2xl sm:text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none block truncate"
              >
                {analyticsData.currentOnTimePct}%
              </span>
              <span className="block text-[10px] sm:text-[11px] text-[var(--ink-muted)] mt-1 truncate">
                vs. previous {range}
              </span>
            </div>
            <SvgSparkline values={analyticsData.onTimeSpark} id="ontime" />
          </div>
        </div>

        {/* KPI 4: Average cycle time */}
        <div
          style={{ '--stagger-index': 4 } as React.CSSProperties}
          className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-3 min-w-0"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--ink-secondary)] truncate">
              Avg cycle time
            </span>
            {analyticsData.cycleDeltaIsNew ? (
              <span
                data-testid="kpi-delta-cycle"
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] shrink-0"
              >
                New
              </span>
            ) : (
              <span
                data-testid="kpi-delta-cycle"
                className={`inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-ui-tabular shrink-0 ${
                  analyticsData.cycleDeltaPct <= 0 ? 'text-[#216E3E]' : 'text-[#B43342]'
                }`}
              >
                {analyticsData.cycleDeltaPct <= 0 ? (
                  <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
                {analyticsData.cycleDeltaPct >= 0 ? '+' : ''}
                {analyticsData.cycleDeltaPct}%
              </span>
            )}
          </div>

          <div className="flex items-end justify-between gap-1.5 sm:gap-2 min-w-0">
            <div className="min-w-0">
              <span
                data-testid="kpi-cycle-time"
                className="text-2xl sm:text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none block truncate"
              >
                {analyticsData.currentCycleAvg}d
              </span>
              <span className="block text-[10px] sm:text-[11px] text-[var(--ink-muted)] mt-1 truncate">
                vs. previous {range}
              </span>
            </div>
            <SvgSparkline values={analyticsData.cycleSpark} id="cycle" />
          </div>
        </div>
      </div>

      {/* Row 2: Throughput Line Chart (Cols 1-7) + Donut "Time by project" (Cols 8-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Throughput Line Chart (7 cols) */}
        <section
          aria-labelledby="throughput-chart-heading"
          style={{ '--stagger-index': 5 } as React.CSSProperties}
          className="plotline-enter lg:col-span-7 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3 relative min-w-0"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2
                id="throughput-chart-heading"
                className="text-base font-semibold text-[var(--ink-primary)]"
              >
                Throughput ({range})
              </h2>
              <p className="text-xs text-[var(--ink-secondary)]">
                Daily focus hours vs. previous {range} and 7-day moving average
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[var(--ink-secondary)] flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                <span>Current</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 border-b border-dashed border-[var(--ink-muted)]" />
                <span>Previous</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent-tint-2)' }}
                />
                <span>7d Avg</span>
              </span>
            </div>
          </div>

          <div className="relative w-full">
            {/* Hover / Tap Tooltip rendered via Portal to document.body */}
            <AnchoredTooltip
              isOpen={Boolean(hoveredPoint && tooltipAnchorRect)}
              anchorRect={tooltipAnchorRect}
              dataTestId="throughput-tooltip"
              className="px-3 py-1.5 text-[11px] flex items-center flex-wrap gap-x-3 gap-y-1 font-ui-tabular max-w-[calc(100vw-16px)]"
            >
              {hoveredPoint && (
                <>
                  <span className="font-semibold text-[var(--ink-primary)]">
                    {hoveredPoint.label}
                    {hoveredPoint.daysAgo === 0 ? ' (today)' : ''}
                  </span>
                  <span style={{ color: 'var(--accent)' }} className="font-semibold">
                    Current: {hoveredPoint.formattedDuration}
                  </span>
                  <span className="text-[var(--ink-secondary)]">
                    Prev: {hoveredPoint.prevHours}h
                  </span>
                  <span className="text-[var(--ink-muted)]">7d Avg: {hoveredPoint.avg7d}h</span>
                </>
              )}
            </AnchoredTooltip>

            <svg
              ref={throughputSvgRef}
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-auto overflow-visible select-none touch-manipulation"
              onMouseLeave={() => setHoveredPointIdx(null)}
            >
              <defs>
                <linearGradient id="throughput-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {[0, 0.5, 1].map((frac) => {
                const y = padT + frac * plotH;
                const val = Math.round(maxChartVal * (1 - frac));
                return (
                  <g key={frac}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={svgW - padR}
                      y2={y}
                      stroke="var(--border-hairline)"
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 6}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="var(--ink-muted)"
                    >
                      {val}h
                    </text>
                  </g>
                );
              })}

              {/* Area under current line */}
              {currentAreaPath && <path d={currentAreaPath} fill="url(#throughput-area-grad)" />}

              {/* Previous Period Dashed Line */}
              <polyline
                fill="none"
                stroke="var(--ink-muted)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                points={prevLinePoints}
              />

              {/* 7-Day Moving Average Line */}
              <polyline
                fill="none"
                stroke="var(--accent-tint-2)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={avgLinePoints}
              />

              {/* Current Period Solid Line */}
              <polyline
                data-testid="throughput-current-solid"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={currentLineSolidPoints}
              />

              {/* Incomplete Current Day Dashed Segment (omitted when Today = 0h) */}
              {currentLineTodayDashedPoints && (
                <polyline
                  data-testid="throughput-today-dashed"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.25"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={currentLineTodayDashedPoints}
                />
              )}

              {/* Crosshair & Active Point */}
              {hoveredPoint && (
                <g>
                  <line
                    x1={hoveredPoint.x}
                    y1={padT}
                    x2={hoveredPoint.x}
                    y2={padT + plotH}
                    stroke="var(--accent)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.yCurr}
                    r="4.5"
                    fill="var(--accent)"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Invisible Hover & Tap Columns for Smooth Crosshair Scrubbing */}
              {chartCoords.map((pt, idx) => {
                const colWidth = plotW / Math.max(1, chartCoords.length);
                return (
                  <rect
                    key={pt.date}
                    data-testid={`throughput-hit-${idx}`}
                    x={pt.x - colWidth / 2}
                    y={padT}
                    width={colWidth}
                    height={plotH}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoveredPointIdx(idx)}
                    onTouchStart={() => setHoveredPointIdx(idx)}
                    onClick={() => setHoveredPointIdx((prev) => (prev === idx ? null : idx))}
                  />
                );
              })}

              {/* X-axis Labels (non-overlapping start/middle/end anchors) */}
              {chartCoords.map((pt, idx) => {
                const isFirst = idx === 0;
                const isMid = idx === Math.floor(chartCoords.length / 2);
                const isLast = idx === chartCoords.length - 1;
                if (!isFirst && !isMid && !isLast) return null;
                return (
                  <text
                    key={pt.date}
                    x={pt.x}
                    y={svgH - 6}
                    textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                    fontSize="10"
                    fill="var(--ink-muted)"
                  >
                    {pt.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </section>

        {/* Donut "Time by project" with ContourGlyph Legend sorted by hours descending (5 cols) */}
        <section
          aria-labelledby="donut-project-heading"
          style={{ '--stagger-index': 6 } as React.CSSProperties}
          className="plotline-enter lg:col-span-5 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3 min-w-0"
        >
          <div className="flex items-center justify-between">
            <h2
              id="donut-project-heading"
              className="text-base font-semibold text-[var(--ink-primary)]"
            >
              Time by project
            </h2>
            <span className="text-xs text-[var(--ink-muted)] font-ui-tabular">
              {analyticsData.currentFormattedDuration} total
            </span>
          </div>

          {analyticsData.projectShares.length === 0 ? (
            <div className="my-auto py-6 flex flex-col items-center justify-center text-center gap-2">
              <ContourGlyph seed="analytics-projects-empty" size={42} />
              <p className="text-xs text-[var(--ink-secondary)]">
                No project hours recorded in this window.
              </p>
            </div>
          ) : (
            <div className="flex flex-col xl:flex-row items-center gap-4 my-auto">
              {/* Custom SVG Donut — segments sum to 100% with no grey gap */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg data-testid="donut-svg" viewBox="0 0 136 136" className="w-full h-full">
                  {analyticsData.projectShares.map((item, idx) => {
                    const isLast = idx === analyticsData.projectShares.length - 1;
                    const startPct = cumulativeDonutPct;
                    const segPct = isLast ? Math.max(0, 100 - startPct) : item.pct;
                    cumulativeDonutPct += segPct;
                    const startArc = (startPct / 100) * donutCircumference;
                    const targetArc = (segPct / 100) * donutCircumference + 0.35;
                    const drawnLength = donutAnimated ? targetArc : 0;
                    const offset = -startArc;
                    const isSelected = selectedProjectId === item.project.id;
                    return (
                      <circle
                        key={item.project.id}
                        data-testid={`donut-segment-${item.project.id}`}
                        data-pct={segPct}
                        data-start-pct={startPct}
                        data-target-arc={Number(targetArc.toFixed(2))}
                        cx="68"
                        cy="68"
                        r={donutRadius}
                        fill="none"
                        stroke={item.tint}
                        strokeWidth={isSelected ? '17' : '14'}
                        strokeDasharray={`${drawnLength} ${donutCircumference}`}
                        strokeDashoffset={offset}
                        transform="rotate(-90 68 68)"
                        style={{
                          transition:
                            'stroke-dasharray 700ms var(--ease-plotline), stroke-width 150ms var(--ease-plotline), stroke 250ms var(--ease-plotline)',
                        }}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedProjectId((prev) =>
                            prev === item.project.id ? null : item.project.id
                          )
                        }
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                  <span className="text-lg font-display-num font-semibold text-[var(--ink-primary)] leading-none truncate max-w-full">
                    {selectedProjectShare
                      ? selectedProjectShare.formattedDuration
                      : analyticsData.currentFormattedDuration}
                  </span>
                  <span className="text-[10px] text-[var(--ink-muted)] mt-0.5 truncate max-w-[92px]">
                    {selectedProjectShare
                      ? `${selectedProjectShare.project.code} (${selectedProjectShare.pct}%)`
                      : `${range} logged`}
                  </span>
                </div>
              </div>

              {/* Project Legend sorted by hours descending */}
              <div data-testid="donut-project-legend" className="flex-1 w-full space-y-2 min-w-0">
                {analyticsData.projectShares.map((item) => {
                  const isSelected = selectedProjectId === item.project.id;
                  return (
                    <button
                      key={item.project.id}
                      type="button"
                      onClick={() =>
                        setSelectedProjectId((prev) =>
                          prev === item.project.id ? null : item.project.id
                        )
                      }
                      className={`w-full flex items-center justify-between gap-2 text-xs p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--surface-sunken)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.tint }}
                        />
                        <span className="w-6 h-6 rounded-[var(--radius-xs)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                          <ContourGlyph seed={item.project.id} size={22} />
                        </span>
                        <span className="font-medium text-[var(--ink-primary)] truncate">
                          {item.project.name}
                        </span>
                      </div>
                      <span
                        data-testid={`project-share-${item.project.id}`}
                        data-seconds={item.seconds}
                        data-hours={item.hours}
                        data-pct={item.pct}
                        className="font-ui-tabular font-semibold text-[var(--ink-secondary)] shrink-0"
                      >
                        {item.formattedDuration} ({item.pct}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Row 3: Calendar-Style Activity Heatmap (Cols 1-6) + Top Contributors (Cols 7-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Calendar-Style Activity Heatmap: 7 rows Mon–Sun, columns = weeks (6 cols) */}
        <section
          aria-labelledby="activity-heatmap-heading"
          style={{ '--stagger-index': 7 } as React.CSSProperties}
          className="plotline-enter lg:col-span-6 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3 min-w-0"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2
                id="activity-heatmap-heading"
                className="text-base font-semibold text-[var(--ink-primary)]"
              >
                Activity Heatmap
              </h2>
              <p className="text-xs text-[var(--ink-secondary)]">
                Daily studio intensity across the {range} window (Mon–Sun by week)
              </p>
            </div>
            <span className="text-xs text-[var(--ink-muted)] shrink-0">
              {selectedHeatmapDay
                ? `${selectedHeatmapDay.label}: ${selectedHeatmapDay.formattedDuration} (${selectedHeatmapDay.tasks} tasks)`
                : `${analyticsData.dailyCurrent.length} days`}
            </span>
          </div>

          <div className="py-1 space-y-1.5">
            {/* Week column headers */}
            <div className="flex items-center gap-2">
              <span className="w-8 shrink-0" aria-hidden="true" />
              <div
                style={{
                  gridTemplateColumns: `repeat(${heatmapCalendar.numWeeks}, minmax(0, 1fr))`,
                }}
                className="grid gap-1.5 flex-1 min-w-0"
              >
                {heatmapCalendar.weekHeaders.map((header, wIdx) => (
                  <span
                    key={wIdx}
                    className="text-[10px] text-[var(--ink-muted)] font-ui-tabular truncate text-center"
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>

            {/* 7 Rows (Mon–Sun), Columns = Weeks */}
            <div
              data-testid="activity-heatmap-grid"
              role="grid"
              aria-label="Activity heatmap calendar (7 rows Mon to Sun by week)"
              className="grid grid-rows-7 gap-1.5"
            >
              {heatmapCalendar.rows.map((row) => (
                <div
                  key={row.label}
                  role="row"
                  data-testid={`heatmap-row-${row.label.toLowerCase()}`}
                  className="flex items-center gap-2 min-w-0"
                >
                  <span className="w-8 shrink-0 text-[10px] font-medium text-[var(--ink-muted)] select-none">
                    {row.label}
                  </span>
                  <div
                    style={{
                      gridTemplateColumns: `repeat(${heatmapCalendar.numWeeks}, minmax(0, 1fr))`,
                    }}
                    className="grid gap-1.5 flex-1 min-w-0"
                  >
                    {row.cells.map((day, colIdx) => {
                      if (!day) {
                        return (
                          <span
                            key={`empty-${row.label}-${colIdx}`}
                            aria-hidden="true"
                            className="h-6 sm:h-6 rounded-[var(--radius-xs)] opacity-25 border border-dashed border-[var(--border-hairline)]"
                          />
                        );
                      }
                      const isSelected = selectedHeatmapDate === day.date;
                      const shadeLevel = getHeatmapLevel(day.hours);
                      return (
                        <button
                          key={day.date}
                          type="button"
                          role="gridcell"
                          data-testid={`heatmap-cell-${day.date}`}
                          data-level={shadeLevel}
                          data-hours={day.hours}
                          onClick={() =>
                            setSelectedHeatmapDate((prev) => (prev === day.date ? null : day.date))
                          }
                          title={`${day.label} (${row.label}): ${day.formattedDuration} (${day.tasks} tasks)`}
                          aria-label={`${day.label} (${row.label}): ${day.formattedDuration}, ${day.tasks} tasks`}
                          style={{
                            backgroundColor: getHeatmapBg(day.hours),
                          }}
                          className={`h-6 sm:h-6 rounded-[var(--radius-xs)] transition-transform hover:scale-105 cursor-pointer ${
                            isSelected ? 'ring-2 ring-[var(--ink-primary)]' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)] pt-1 border-t border-[var(--border-hairline)]">
            <span>Lower cadence</span>
            <div data-testid="heatmap-legend-swatches" className="flex items-center gap-1">
              {[0, 2.5, 4.2, 5.8, 7.5].map((h, idx) => (
                <span
                  key={idx}
                  data-level={idx}
                  className="w-3 h-3 rounded-[2px]"
                  style={{ backgroundColor: getHeatmapBg(h) }}
                  title={idx === 0 ? '0h' : `Level ${idx}`}
                />
              ))}
            </div>
            <span>Peak cadence</span>
          </div>
        </section>

        {/* Top Contributors List (6 cols) */}
        <section
          aria-labelledby="top-contributors-heading"
          style={{ '--stagger-index': 8 } as React.CSSProperties}
          className="plotline-enter lg:col-span-6 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3 min-w-0"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                id="top-contributors-heading"
                className="text-base font-semibold text-[var(--ink-primary)]"
              >
                Top Contributors
              </h2>
              <p className="text-xs text-[var(--ink-secondary)]">
                Specialists ranked by completed deliverables and focus hours ({range})
              </p>
            </div>
          </div>

          {analyticsData.contributors.length === 0 ? (
            <div className="my-auto py-6 flex flex-col items-center justify-center text-center gap-2">
              <ContourGlyph seed="analytics-contributors-empty" size={42} />
              <p className="text-xs text-[var(--ink-secondary)]">
                No contributor telemetry available yet.
              </p>
            </div>
          ) : (
            <div data-testid="contributors-list" className="space-y-2.5">
              {analyticsData.contributors.map((entry) => {
                const maxContributorSeconds = Math.max(
                  1,
                  ...analyticsData.contributors.map((c) => c.seconds)
                );
                const barPct = Math.round((entry.seconds / maxContributorSeconds) * 100);
                return (
                  <div
                    key={entry.member.id}
                    data-testid={`contributor-row-${entry.member.id}`}
                    data-tasks={entry.tasksCompleted}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          style={{ backgroundColor: 'var(--accent)' }}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                        >
                          {entry.member.initials}
                        </span>
                        <span className="font-semibold text-[var(--ink-primary)] truncate">
                          {entry.member.name}
                        </span>
                        <span className="text-[11px] text-[var(--ink-muted)] truncate hidden sm:inline">
                          · {entry.member.role}
                        </span>
                      </div>
                      <span
                        data-testid={`contributor-metrics-${entry.member.id}`}
                        className="font-ui-tabular font-semibold text-[var(--ink-primary)] shrink-0"
                      >
                        {entry.formattedDuration} · {entry.tasksCompleted} tasks
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden">
                      <div
                        style={{
                          width: `${barPct}%`,
                          backgroundColor: 'var(--accent)',
                        }}
                        className="h-full rounded-full transition-all duration-300 ease-plotline"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
