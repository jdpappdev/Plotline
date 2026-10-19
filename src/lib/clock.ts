let fixedClockMs: number | null = null;
let timeOffsetMs = 0;

function parseNowParam(raw: string | null): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    if (Number.isFinite(num)) return num;
  }
  const parsed = new Date(trimmed).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

export function initClock() {
  if (
    typeof window !== 'undefined' &&
    window.location &&
    (import.meta.env.DEV || import.meta.env.VITE_ENABLE_TIME_TRAVEL)
  ) {
    const params = new URLSearchParams(window.location.search);
    const nowParam = params.get('now');
    if (nowParam) {
      const targetTime = parseNowParam(nowParam);
      if (targetTime !== null) {
        timeOffsetMs = targetTime - Date.now();
      }
    }
  }
}

export function setFixedClock(value: Date | string | number | null): void {
  if (value === null) {
    fixedClockMs = null;
    return;
  }
  if (value instanceof Date) {
    fixedClockMs = value.getTime();
    return;
  }
  if (typeof value === 'number') {
    fixedClockMs = value;
    return;
  }
  fixedClockMs = parseNowParam(value);
}

export const setClockOverride = setFixedClock;

export function getNowTimestamp(): number {
  if (fixedClockMs !== null) {
    return fixedClockMs;
  }
  return Date.now() + timeOffsetMs;
}

export const getNowMs = getNowTimestamp;

export function getNow(): Date {
  return new Date(getNowTimestamp());
}

export const getNowDate = getNow;

export function getTodayIsoDate(): string {
  const now = getNow();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getIsoDateOffset(daysOffset: number): string {
  const d = getNow();
  d.setDate(d.getDate() + daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
