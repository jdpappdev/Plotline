import type { TaskStatus } from '../domain/types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const UNRESOLVED_DAYS_AGO = 9999;
const DAYS_IN_WEEK = 7;

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getIsoDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function toIsoDateString(year: number, monthIndex: number, day: number): string {
  const d = new Date(year, monthIndex, day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
}

export function computeDaysAgoFromIso(dateIso: string): number {
  if (!dateIso) return UNRESOLVED_DAYS_AGO;
  const todayIso = getTodayIsoDate();
  const todayParts = todayIso.split('-').map(Number);
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3 || todayParts.length !== 3) return UNRESOLVED_DAYS_AGO;
  const todayUtc = Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]);
  const dateUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
  return Math.round((todayUtc - dateUtc) / MS_PER_DAY);
}

export function computeDaysBetweenIso(startIso: string, endIso: string): number {
  if (!startIso || !endIso) return 0;
  const sParts = startIso.split('-').map(Number);
  const eParts = endIso.split('-').map(Number);
  if (sParts.length !== 3 || eParts.length !== 3) return 0;
  const sUtc = Date.UTC(sParts[0], sParts[1] - 1, sParts[2]);
  const eUtc = Date.UTC(eParts[0], eParts[1] - 1, eParts[2]);
  return Math.max(0, Math.round((eUtc - sUtc) / MS_PER_DAY));
}

export function getMondayFirstRowIndex(dateIso: string): number {
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3) return 0;
  const jsDay = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getDay();
  return (jsDay + 6) % DAYS_IN_WEEK;
}

export function computeDaysLeftLabel(dueDateIso: string, status: TaskStatus): string {
  if (status === 'Done') return 'Completed';
  const today = new Date(`${getTodayIsoDate()}T00:00:00`);
  const due = new Date(`${dueDateIso}T00:00:00`);
  if (Number.isNaN(due.getTime())) return dueDateIso;
  const diffDays = Math.round((due.getTime() - today.getTime()) / MS_PER_DAY);
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Due today';
  return `${diffDays}d left`;
}

export function isDueWithinWeek(dueDateIso: string): boolean {
  const today = new Date(`${getTodayIsoDate()}T00:00:00`);
  const due = new Date(`${dueDateIso}T00:00:00`);
  if (Number.isNaN(due.getTime())) return false;
  const diffDays = Math.round((due.getTime() - today.getTime()) / MS_PER_DAY);
  return diffDays >= 0 && diffDays <= DAYS_IN_WEEK;
}
