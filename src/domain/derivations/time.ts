import { FocusSession, WeekStart } from '../types';
import { getNow, getTodayIsoDate } from '../../lib/clock';

export const SECONDS_PER_HOUR = 3600;

export function computeDaysAgoFromIso(dateIso: string): number {
  if (!dateIso) return 9999;
  const todayIso = getTodayIsoDate();
  const todayParts = todayIso.split('-').map(Number);
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3 || todayParts.length !== 3) return 9999;
  const todayUtc = Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]);
  const dateUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
  return Math.round((todayUtc - dateUtc) / (1000 * 60 * 60 * 24));
}

export function computeDaysBetweenIso(startIso: string, endIso: string): number {
  if (!startIso || !endIso) return 0;
  const sParts = startIso.split('-').map(Number);
  const eParts = endIso.split('-').map(Number);
  if (sParts.length !== 3 || eParts.length !== 3) return 0;
  const sUtc = Date.UTC(sParts[0], sParts[1] - 1, sParts[2]);
  const eUtc = Date.UTC(eParts[0], eParts[1] - 1, eParts[2]);
  return Math.max(0, Math.round((eUtc - sUtc) / (1000 * 60 * 60 * 24)));
}

export function formatDuration(totalSeconds: number): string {
  const secs = Math.max(0, Math.round(totalSeconds || 0));
  if (secs === 0) return '0m';
  if (secs < 60) return '<1m';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  return `${(secs / 3600).toFixed(1)}h`;
}

export function formatLoggedDuration(seconds: number): string {
  return formatDuration(seconds);
}

export function getSessionSeconds(session: FocusSession): number {
  return typeof session.seconds === 'number'
    ? Math.round(session.seconds)
    : Math.round((session.hours || 0) * SECONDS_PER_HOUR);
}

export interface WeeklyOutputColumn {
  label: string;
  weekdayIndex: number;
  seconds: number;
  hours: number;
  sessionsCount: number;
  isToday: boolean;
  isWeekend: boolean;
}

export function computeWeeklyOutputData(
  focusSessions: FocusSession[],
  weekStart: WeekStart
): {
  columns: WeeklyOutputColumn[];
  maxSeconds: number;
  totalWeekSeconds: number;
  totalSessionsCount: number;
} {
  const todayJsDay = getNow().getDay();
  const baseOrder =
    weekStart === 'sunday'
      ? [
          { label: 'S', weekdayIndex: 0 },
          { label: 'M', weekdayIndex: 1 },
          { label: 'T', weekdayIndex: 2 },
          { label: 'W', weekdayIndex: 3 },
          { label: 'T', weekdayIndex: 4 },
          { label: 'F', weekdayIndex: 5 },
          { label: 'S', weekdayIndex: 6 },
        ]
      : [
          { label: 'M', weekdayIndex: 1 },
          { label: 'T', weekdayIndex: 2 },
          { label: 'W', weekdayIndex: 3 },
          { label: 'T', weekdayIndex: 4 },
          { label: 'F', weekdayIndex: 5 },
          { label: 'S', weekdayIndex: 6 },
          { label: 'S', weekdayIndex: 0 },
        ];

  const currentWeekSessions = focusSessions.filter((s) => {
    const dAgo = typeof s.daysAgo === 'number' ? s.daysAgo : computeDaysAgoFromIso(s.date);
    return dAgo >= 0 && dAgo < 7;
  });

  const columns: WeeklyOutputColumn[] = baseOrder.map((col) => {
    const colSessions = currentWeekSessions.filter((s) => s.weekdayIndex === col.weekdayIndex);
    const totalSeconds = colSessions.reduce((acc, s) => acc + getSessionSeconds(s), 0);
    return {
      ...col,
      seconds: totalSeconds,
      hours: totalSeconds / SECONDS_PER_HOUR,
      sessionsCount: colSessions.length,
      isToday: col.weekdayIndex === todayJsDay,
      isWeekend: col.weekdayIndex === 0 || col.weekdayIndex === 6,
    };
  });

  const maxSeconds = Math.max(4.5 * SECONDS_PER_HOUR, ...columns.map((c) => c.seconds), 1);
  const totalWeekSeconds = columns.reduce((sum, col) => sum + col.seconds, 0);
  const totalSessionsCount = columns.reduce((sum, col) => sum + col.sessionsCount, 0);

  return {
    columns,
    maxSeconds,
    totalWeekSeconds,
    totalSessionsCount,
  };
}
