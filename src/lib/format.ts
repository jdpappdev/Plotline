const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

export function formatDuration(totalSeconds: number): string {
  const secs = Math.max(0, Math.round(totalSeconds || 0));
  if (secs === 0) return '0m';
  if (secs < SECONDS_PER_MINUTE) return '<1m';
  if (secs < SECONDS_PER_HOUR) return `${Math.floor(secs / SECONDS_PER_MINUTE)}m`;
  return `${(secs / SECONDS_PER_HOUR).toFixed(1)}h`;
}

export function formatLoggedDuration(seconds: number): string {
  return formatDuration(seconds);
}

export function formatTimerHMS(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const mins = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const secs = totalSeconds % SECONDS_PER_MINUTE;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatShortDate(isoDate: string): string {
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

export function formatShortMonthDay(dateIso: string): string {
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3) return dateIso;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateBadge(isoDate: string): { monthShort: string; dayNum: string } {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return { monthShort: 'OCT', dayNum: '01' };
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(d.getTime())) return { monthShort: 'OCT', dayNum: '01' };
  return {
    monthShort: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    dayNum: String(d.getDate()).padStart(2, '0'),
  };
}

export function formatFullAgendaHeading(isoDate: string, todayIso: string): string {
  if (isoDate === todayIso) return "Today's Agenda";
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3) return `Agenda · ${isoDate}`;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  if (Number.isNaN(d.getTime())) return `Agenda · ${isoDate}`;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (item && typeof item.id === 'string' && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

export function computeInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return 'PL';
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
}
