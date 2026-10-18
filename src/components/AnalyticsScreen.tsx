import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import {
  FocusSession,
  formatDuration,
  getIsoDateOffset,
  Project,
  TeamMember,
  usePlotlineStore,
} from '../store';
import { ContourGlyph } from '../utils/contourGlyph';

type RangeKey = '7D' | '30D' | '90D';

const ACCENT_TINTS = [
  'var(--accent-tint-1)',
  'var(--accent-tint-2)',
  'var(--accent-tint-3)',
  'var(--accent-tint-4)',
  'var(--accent-tint-5)',
];

function computeDaysAgoFromIso(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3) return 0;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatShortMonthDay(dateIso: string): string {
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3) return dateIso;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      className="overflow-visible shrink-0"
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

export default function AnalyticsScreen() {
  const {
    projects,
    tasks,
    team,
    focusSessions,
    pushToast,
  } = usePlotlineStore();

  const [range, setRange] = useState<RangeKey>('30D');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

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
        resolvedDaysAgo:
          typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date),
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

    const liveDoneBonus = tasks.filter((t) => t.status === 'Done').length;

    const currentTasksCompleted =
      currentSessions.reduce((acc, s) => acc + (s.tasksCompletedCount ?? 0), 0) +
      liveDoneBonus;
    const prevTasksCompleted = Math.max(
      1,
      prevSessions.reduce((acc, s) => acc + (s.tasksCompletedCount ?? 0), 0) +
        Math.max(1, liveDoneBonus - 1)
    );

    // Sum seconds first, then format
    const currentTotalSeconds = currentSessions.reduce(
      (acc, s) => acc + s.resolvedSeconds,
      0
    );
    const prevTotalSeconds = prevSessions.reduce(
      (acc, s) => acc + s.resolvedSeconds,
      0
    );

    const currentHours = Number((currentTotalSeconds / 3600).toFixed(1));
    const prevHours = Math.max(1, Number((prevTotalSeconds / 3600).toFixed(1)));
    const currentFormattedDuration = formatDuration(currentTotalSeconds);

    const currentOnTimeEvents = currentSessions.reduce(
      (acc, s) => acc + (s.onTimeCount ?? 0),
      0
    );
    const currentTaskEvents = Math.max(
      1,
      currentSessions.reduce((acc, s) => acc + (s.tasksCompletedCount ?? 0), 0)
    );
    const prevOnTimeEvents = prevSessions.reduce(
      (acc, s) => acc + (s.onTimeCount ?? 0),
      0
    );
    const prevTaskEvents = Math.max(
      1,
      prevSessions.reduce((acc, s) => acc + (s.tasksCompletedCount ?? 0), 0)
    );

    const currentOnTimePct = Math.min(
      99,
      Math.max(72, Math.round((currentOnTimeEvents / currentTaskEvents) * 100))
    );
    const prevOnTimePct = Math.min(
      98,
      Math.max(68, Math.round((prevOnTimeEvents / prevTaskEvents) * 100))
    );

    const currentCycleAvg = Number(
      (
        currentSessions.reduce((acc, s) => acc + (s.cycleDays ?? 2.2), 0) /
        Math.max(1, currentSessions.length)
      ).toFixed(1)
    );
    const prevCycleAvg = Number(
      (
        prevSessions.reduce((acc, s) => acc + (s.cycleDays ?? 2.5), 0) /
        Math.max(1, prevSessions.length)
      ).toFixed(1)
    );

    const tasksDeltaPct = Number(
      (((currentTasksCompleted - prevTasksCompleted) / prevTasksCompleted) * 100).toFixed(1)
    );
    const hoursDeltaPct = Number(
      (
        ((currentTotalSeconds - Math.max(3600, prevTotalSeconds)) /
          Math.max(3600, prevTotalSeconds)) *
        100
      ).toFixed(1)
    );
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
      const dayCurr = currentSessions.filter((s) => s.resolvedDaysAgo === d);
      const dayPrev = prevSessions.filter((s) => s.resolvedDaysAgo === d + rangeDays);

      const sCurr = dayCurr.reduce((a, b) => a + b.resolvedSeconds, 0);
      const hCurr = Number((sCurr / 3600).toFixed(2));
      const tCurr = dayCurr.reduce((a, b) => a + (b.tasksCompletedCount ?? 0), 0);
      const otCurr =
        tCurr > 0
          ? Math.round(
              (dayCurr.reduce((a, b) => a + (b.onTimeCount ?? 0), 0) / tCurr) * 100
            )
          : 92;
      const cycCurr =
        dayCurr.length > 0
          ? Number(
              (
                dayCurr.reduce((a, b) => a + (b.cycleDays ?? 2.2), 0) / dayCurr.length
              ).toFixed(1)
            )
          : 2.1;

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
        tasks: dayPrev.reduce((a, b) => a + (b.tasksCompletedCount ?? 0), 0),
      });
    }

    // Add 7-day moving average to dailyCurrent
    const chartPoints = dailyCurrent.map((pt, idx) => {
      const winStart = Math.max(0, idx - 6);
      const slice = dailyCurrent.slice(winStart, idx + 1);
      const sliceAvgSeconds =
        slice.reduce((a, b) => a + b.seconds, 0) / Math.max(1, slice.length);
      const avg7d = Number((sliceAvgSeconds / 3600).toFixed(1));
      const prevHoursPt = dailyPrevious[idx]?.hours ?? Number((pt.hours * 0.85).toFixed(1));
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
      onTimeSpark.push(
        Math.round(slice.reduce((a, b) => a + b.onTimePct, 0) / slice.length)
      );
      cycleSpark.push(
        Number(
          (slice.reduce((a, b) => a + b.cycleDays, 0) / slice.length).toFixed(2)
        )
      );
    }

    // Donut: Time by project (sum seconds first, then format)
    const projectTotals = uniqueProjects.map((proj, idx) => {
      const projSessions = currentSessions.filter((s) => s.projectId === proj.id);
      const secs = projSessions.reduce((a, b) => a + b.resolvedSeconds, 0);
      const hrs = Number((secs / 3600).toFixed(1));
      return {
        project: proj,
        seconds: secs,
        hours: hrs,
        formattedDuration: formatDuration(secs),
        tint: ACCENT_TINTS[idx % ACCENT_TINTS.length],
      };
    });
    const totalProjectSeconds = Math.max(
      1,
      projectTotals.reduce((a, b) => a + b.seconds, 0)
    );
    const projectShares = projectTotals.map((item) => ({
      ...item,
      pct: Math.round((item.seconds / totalProjectSeconds) * 100),
    }));

    // Top contributors (sum seconds first, then format)
    const contributors = uniqueTeam
      .map((member) => {
        const memberSessions = currentSessions.filter(
          (s) => s.memberId === member.id
        );
        const secs = memberSessions.reduce((a, b) => a + b.resolvedSeconds, 0);
        const hrs = Number((secs / 3600).toFixed(1));
        const completed =
          memberSessions.reduce((a, b) => a + (b.tasksCompletedCount ?? 0), 0) +
          tasks.filter(
            (t) =>
              (t.assigneeId === member.id || t.coAssigneeId === member.id) &&
              t.status === 'Done'
          ).length;
        return {
          member,
          seconds: secs,
          hours: hrs,
          formattedDuration: formatDuration(secs),
          tasksCompleted: completed,
        };
      })
      .sort((a, b) => b.seconds - a.seconds);

    return {
      currentTasksCompleted,
      tasksDeltaPct,
      tasksSpark,
      currentTotalSeconds,
      currentFormattedDuration,
      currentHours,
      hoursDeltaPct,
      hoursSpark,
      currentOnTimePct,
      onTimeDeltaPct,
      onTimeSpark,
      currentCycleAvg,
      cycleDeltaPct,
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
        previous: Number(
          (analyticsData.currentTasksCompleted / (1 + analyticsData.tasksDeltaPct / 100)).toFixed(1)
        ),
        change_pct: analyticsData.tasksDeltaPct,
      },
      {
        metric: 'Hours tracked',
        value: analyticsData.currentHours,
        unit: 'hours',
        previous: Number(
          (analyticsData.currentHours / (1 + analyticsData.hoursDeltaPct / 100)).toFixed(1)
        ),
        change_pct: analyticsData.hoursDeltaPct,
      },
      {
        metric: 'On-time delivery',
        value: analyticsData.currentOnTimePct,
        unit: 'share_pct',
        previous: Number((analyticsData.currentOnTimePct - analyticsData.onTimeDeltaPct).toFixed(1)),
        change_pct: analyticsData.onTimeDeltaPct,
      },
      {
        metric: 'Average cycle time',
        value: analyticsData.currentCycleAvg,
        unit: 'days',
        previous: Number(
          (analyticsData.currentCycleAvg / (1 + analyticsData.cycleDeltaPct / 100)).toFixed(1)
        ),
        change_pct: analyticsData.cycleDeltaPct,
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
    const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))].join('\r\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], { type: 'text/csv;charset=utf-8' });
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
    const vals = analyticsData.chartPoints.flatMap((p) => [
      p.hours,
      p.prevHours,
      p.avg7d,
    ]);
    return Math.max(8, ...vals);
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

  const currentLinePoints = chartCoords.map((p) => `${p.x},${p.yCurr}`).join(' ');
  const prevLinePoints = chartCoords.map((p) => `${p.x},${p.yPrev}`).join(' ');
  const avgLinePoints = chartCoords.map((p) => `${p.x},${p.yAvg}`).join(' ');
  const currentAreaPath =
    chartCoords.length > 1
      ? `M ${chartCoords[0].x},${padT + plotH} L ${chartCoords
          .map((p) => `${p.x},${p.yCurr}`)
          .join(' L ')} L ${chartCoords[chartCoords.length - 1].x},${padT + plotH} Z`
      : '';

  const hoveredPoint =
    hoveredPointIdx !== null ? chartCoords[hoveredPointIdx] || null : null;

  // Donut geometry
  const donutRadius = 54;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulativeDonutPct = 0;

  return (
    <div className="max-w-[1360px] mx-auto space-y-4 pb-6 min-w-0">
      {/* Header Row: Title + 7D/30D/90D toggle + Export CSV */}
      <div
        style={{ '--stagger-index': 0 } as React.CSSProperties}
        className="plotline-enter flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
            Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5">
            Delivery velocity, logged focus distribution, and studio cycle-time telemetry.
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
                    active
                      ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                      : undefined
                  }
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
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

          <details className="relative">
            <summary className="list-none inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[var(--surface-elevated)] text-[var(--ink-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
              <span>Export</span>
            </summary>
            <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-1.5 shadow-lg">
              {([
                ['kpi', 'KPI summary (.csv)'],
                ['projects', 'Projects (.csv)'],
                ['contributors', 'Contributors (.csv)'],
                ['daily', 'Daily series (.csv)'],
              ] as const).map(([kind, label]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => handleExport(kind)}
                  className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
                >
                  {label}
                </button>
              ))}
              <div className="my-1 border-t border-[var(--border-hairline)]" />
              <button
                type="button"
                onClick={() => void handleExportXlsx()}
                className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs font-semibold text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
              >
                Full report (.xlsx)
              </button>
            </div>
          </details>
        </div>
      </div>

      {/* Row 1: Four KPI Cards with Delta vs Previous Period & Custom SVG Sparkline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Tasks completed */}
        <div
          style={{ '--stagger-index': 1 } as React.CSSProperties}
          className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink-secondary)]">
              Tasks completed
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold font-ui-tabular ${
                analyticsData.tasksDeltaPct >= 0
                  ? 'text-[#216E3E]'
                  : 'text-[#B43342]'
              }`}
            >
              {analyticsData.tasksDeltaPct >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {analyticsData.tasksDeltaPct >= 0 ? '+' : ''}
              {analyticsData.tasksDeltaPct}%
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <span
                data-testid="kpi-tasks-completed"
                className="text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none"
              >
                {analyticsData.currentTasksCompleted}
              </span>
              <span className="block text-[11px] text-[var(--ink-muted)] mt-1">
                vs. previous {range}
              </span>
            </div>
            <SvgSparkline values={analyticsData.tasksSpark} id="tasks" />
          </div>
        </div>

        {/* KPI 2: Hours tracked */}
        <div
          style={{ '--stagger-index': 2 } as React.CSSProperties}
          className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink-secondary)]">
              Hours tracked
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold font-ui-tabular ${
                analyticsData.hoursDeltaPct >= 0
                  ? 'text-[#216E3E]'
                  : 'text-[#B43342]'
              }`}
            >
              {analyticsData.hoursDeltaPct >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {analyticsData.hoursDeltaPct >= 0 ? '+' : ''}
              {analyticsData.hoursDeltaPct}%
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <span
                data-testid="kpi-hours-tracked"
                data-seconds={analyticsData.currentTotalSeconds}
                className="text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none"
              >
                {analyticsData.currentFormattedDuration}
              </span>
              <span className="block text-[11px] text-[var(--ink-muted)] mt-1">
                vs. previous {range}
              </span>
            </div>
            <SvgSparkline values={analyticsData.hoursSpark} id="hours" />
          </div>
        </div>

        {/* KPI 3: On-time delivery */}
        <div
          style={{ '--stagger-index': 3 } as React.CSSProperties}
          className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink-secondary)]">
              On-time delivery
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold font-ui-tabular ${
                analyticsData.onTimeDeltaPct >= 0
                  ? 'text-[#216E3E]'
                  : 'text-[#B43342]'
              }`}
            >
              {analyticsData.onTimeDeltaPct >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {analyticsData.onTimeDeltaPct >= 0 ? '+' : ''}
              {analyticsData.onTimeDeltaPct}%
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <span
                data-testid="kpi-ontime-delivery"
                className="text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none"
              >
                {analyticsData.currentOnTimePct}%
              </span>
              <span className="block text-[11px] text-[var(--ink-muted)] mt-1">
                vs. previous {range}
              </span>
            </div>
            <SvgSparkline values={analyticsData.onTimeSpark} id="ontime" />
          </div>
        </div>

        {/* KPI 4: Average cycle time */}
        <div
          style={{ '--stagger-index': 4 } as React.CSSProperties}
          className="plotline-enter bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink-secondary)]">
              Average cycle time
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold font-ui-tabular ${
                analyticsData.cycleDeltaPct <= 0
                  ? 'text-[#216E3E]'
                  : 'text-[#B43342]'
              }`}
            >
              {analyticsData.cycleDeltaPct <= 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5" />
              )}
              {analyticsData.cycleDeltaPct >= 0 ? '+' : ''}
              {analyticsData.cycleDeltaPct}%
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <span
                data-testid="kpi-cycle-time"
                className="text-3xl font-display-num font-semibold text-[var(--ink-primary)] leading-none"
              >
                {analyticsData.currentCycleAvg}d
              </span>
              <span className="block text-[11px] text-[var(--ink-muted)] mt-1">
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
          className="plotline-enter lg:col-span-7 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3 relative"
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
                Daily hours tracked vs. previous {range} and 7-day moving average
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[var(--ink-secondary)]">
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
            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                role="tooltip"
                className="absolute top-1 right-2 bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-md px-3 py-2 text-[11px] z-20 pointer-events-none flex items-center gap-3 font-ui-tabular"
              >
                <span className="font-semibold text-[var(--ink-primary)]">
                  {hoveredPoint.label}
                </span>
                <span style={{ color: 'var(--accent)' }} className="font-semibold">
                  Current: {hoveredPoint.formattedDuration}
                </span>
                <span className="text-[var(--ink-secondary)]">
                  Prev: {hoveredPoint.prevHours}h
                </span>
                <span className="text-[var(--ink-muted)]">
                  7d Avg: {hoveredPoint.avg7d}h
                </span>
              </div>
            )}

            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-auto overflow-visible select-none"
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
              {currentAreaPath && (
                <path d={currentAreaPath} fill="url(#throughput-area-grad)" />
              )}

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
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={currentLinePoints}
              />

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
                    r="4"
                    fill="var(--accent)"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Invisible Hover Columns for Smooth Crosshair Scrubbing */}
              {chartCoords.map((pt, idx) => {
                const colWidth = plotW / Math.max(1, chartCoords.length);
                return (
                  <rect
                    key={pt.date}
                    x={pt.x - colWidth / 2}
                    y={padT}
                    width={colWidth}
                    height={plotH}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoveredPointIdx(idx)}
                  />
                );
              })}

              {/* X-axis Labels */}
              {chartCoords
                .filter(
                  (_, idx) =>
                    idx === 0 ||
                    idx === Math.floor(chartCoords.length / 2) ||
                    idx === chartCoords.length - 1
                )
                .map((pt) => (
                  <text
                    key={pt.date}
                    x={pt.x}
                    y={svgH - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--ink-muted)"
                  >
                    {pt.label}
                  </text>
                ))}
            </svg>
          </div>
        </section>

        {/* Donut "Time by project" with ContourGlyph Legend (5 cols) */}
        <section
          aria-labelledby="donut-project-heading"
          style={{ '--stagger-index': 6 } as React.CSSProperties}
          className="plotline-enter lg:col-span-5 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3"
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
            <div className="flex flex-col sm:flex-row items-center gap-4 my-auto">
              {/* Custom SVG Donut */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 136 136" className="w-full h-full">
                  <circle
                    cx="68"
                    cy="68"
                    r={donutRadius}
                    fill="none"
                    stroke="var(--line)"
                    strokeWidth="14"
                  />
                  {analyticsData.projectShares.map((item) => {
                    const segLength = (item.pct / 100) * donutCircumference;
                    const offset =
                      donutCircumference -
                      (cumulativeDonutPct / 100) * donutCircumference;
                    cumulativeDonutPct += item.pct;
                    return (
                      <circle
                        key={item.project.id}
                        cx="68"
                        cy="68"
                        r={donutRadius}
                        fill="none"
                        stroke={item.tint}
                        strokeWidth="14"
                        strokeDasharray={`${segLength} ${donutCircumference}`}
                        strokeDashoffset={offset}
                        transform="rotate(-90 68 68)"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-display-num font-semibold text-[var(--ink-primary)] leading-none">
                    {analyticsData.currentFormattedDuration}
                  </span>
                  <span className="text-[10px] text-[var(--ink-muted)] mt-0.5">
                    {range} logged
                  </span>
                </div>
              </div>

              {/* Project Legend with Contour Glyphs */}
              <div className="flex-1 w-full space-y-2 min-w-0">
                {analyticsData.projectShares.map((item) => (
                  <div
                    key={item.project.id}
                    className="flex items-center justify-between gap-2 text-xs"
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
                      className="font-ui-tabular font-semibold text-[var(--ink-secondary)] shrink-0"
                    >
                      {item.formattedDuration} ({item.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Row 3: Activity Heatmap (Cols 1-6) + Top Contributors (Cols 7-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Activity Heatmap (6 cols) */}
        <section
          aria-labelledby="activity-heatmap-heading"
          style={{ '--stagger-index': 7 } as React.CSSProperties}
          className="plotline-enter lg:col-span-6 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                id="activity-heatmap-heading"
                className="text-base font-semibold text-[var(--ink-primary)]"
              >
                Activity Heatmap
              </h2>
              <p className="text-xs text-[var(--ink-secondary)]">
                Daily studio intensity across the {range} window
              </p>
            </div>
            <span className="text-xs text-[var(--ink-muted)]">
              {analyticsData.dailyCurrent.length} days
            </span>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 py-2">
            {analyticsData.dailyCurrent.slice(-30).map((day) => {
              const intensity = Math.min(1, Math.max(0.14, day.hours / 7.5));
              return (
                <div
                  key={day.date}
                  title={`${day.label}: ${day.formattedDuration} (${day.tasks} tasks)`}
                  style={{
                    backgroundColor: 'var(--accent)',
                    opacity: Number(intensity.toFixed(2)),
                  }}
                  className="h-7 rounded-[var(--radius-xs)] transition-opacity hover:scale-105"
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)] pt-1 border-t border-[var(--border-hairline)]">
            <span>Lower cadence</span>
            <div className="flex items-center gap-1">
              {[0.2, 0.4, 0.65, 0.85, 1].map((op) => (
                <span
                  key={op}
                  className="w-3 h-3 rounded-[2px]"
                  style={{ backgroundColor: 'var(--accent)', opacity: op }}
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
          className="plotline-enter lg:col-span-6 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3"
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
                Specialists ranked by hours tracked and completed deliverables ({range})
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
            <div className="space-y-2.5">
              {analyticsData.contributors.slice(0, 5).map((entry) => {
                const maxContributorSeconds = Math.max(
                  1,
                  analyticsData.contributors[0]?.seconds || 1
                );
                const barPct = Math.round(
                  (entry.seconds / maxContributorSeconds) * 100
                );
                return (
                  <div key={entry.member.id} className="space-y-1">
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
                      <span className="font-ui-tabular font-semibold text-[var(--ink-primary)] shrink-0">
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
