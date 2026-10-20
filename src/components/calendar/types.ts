import { EventCategory } from '../../domain/types';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Meeting',
  'Team',
  'Review',
  'Deadline',
  'Social',
];

export interface CalendarDayCell {
  iso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

export function categoryChipStyles(category: EventCategory | undefined): {
  bg: string;
  fg: string;
  border: string;
  dot: string;
} {
  switch (category) {
    case 'Meeting':
      return {
        bg: 'var(--accent-soft)',
        fg: 'var(--accent)',
        border: 'var(--accent-border)',
        dot: 'var(--accent)',
      };
    case 'Team':
      return {
        bg: '#E8F4EC',
        fg: '#216E3E',
        border: '#B5DFC4',
        dot: '#216E3E',
      };
    case 'Review':
      return {
        bg: '#FEF5E6',
        fg: '#9B5B0B',
        border: '#F5D69E',
        dot: '#B86B14',
      };
    case 'Deadline':
      return {
        bg: '#FBECEE',
        fg: '#B43342',
        border: '#F1B9C0',
        dot: '#C9352B',
      };
    case 'Social':
    default:
      return {
        bg: '#EEEBF9',
        fg: '#5B43B8',
        border: '#BEB2EB',
        dot: '#5B43B8',
      };
  }
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
