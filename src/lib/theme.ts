import type {
  AccentDefinition,
  AccentName,
  DerivedProjectStatus,
  EventCategory,
  PresenceStatus,
  TaskPriority,
  TaskStatus,
} from '../domain/types';

export const ACCENT_THEMES: Record<AccentName, AccentDefinition> = {
  tide: {
    id: 'tide',
    label: 'Tide',
    description: 'Deep marine chart blue (Default)',
    hex: '#204282',
    midHex: '#2c52a3',
    lightHex: '#789ce2',
    softHex: '#e9effa',
    borderHex: '#b8ccf2',
  },
  moss: {
    id: 'moss',
    label: 'Moss',
    description: 'Alpine forestry & botanical index',
    hex: '#2E6B47',
    midHex: '#3b8559',
    lightHex: '#84c29d',
    softHex: '#E8F2EC',
    borderHex: '#A7CBB5',
  },
  iris: {
    id: 'iris',
    label: 'Iris',
    description: 'High-altitude twilight contour violet',
    hex: '#5B43B8',
    midHex: '#6f56d1',
    lightHex: '#a594eb',
    softHex: '#EEEBF9',
    borderHex: '#BEB2EB',
  },
  signal: {
    id: 'signal',
    label: 'Signal',
    description: 'Signal-orange survey marker',
    hex: '#BE3A15',
    midHex: '#d94b24',
    lightHex: '#f59d84',
    softHex: '#FCECE7',
    borderHex: '#F3B7A5',
  },
};

export const ACCENT_TINTS = [
  'var(--accent-tint-1)',
  'var(--accent-tint-2)',
  'var(--accent-tint-3)',
  'var(--accent-tint-4)',
  'var(--accent-tint-5)',
] as const;

export function normalizeAccent(value: string | null | undefined): AccentName {
  if (!value) return 'tide';
  const lower = value.toLowerCase().trim();
  if (lower === 'tide' || lower === 'moss' || lower === 'iris' || lower === 'signal') {
    return lower;
  }
  return 'tide';
}

export function applyAccentCssVariables(accent: AccentName): void {
  if (typeof document === 'undefined') return;
  const theme = ACCENT_THEMES[accent] || ACCENT_THEMES.tide;
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.hex);
  root.style.setProperty('--accent-mid', theme.midHex);
  root.style.setProperty('--accent-light', theme.lightHex);
  root.style.setProperty('--accent-deep', 'color-mix(in oklab, var(--accent) 68%, black)');
  root.style.setProperty(
    '--surface-accent',
    'linear-gradient(155deg, var(--accent) 0%, var(--accent-deep) 100%)'
  );
  root.style.setProperty('--accent-hover', theme.midHex);
  root.style.setProperty('--accent-soft', theme.softHex);
  root.style.setProperty('--accent-border', theme.borderHex);
  root.setAttribute('data-accent', theme.id);
}

export function taskStatusBadge(status: TaskStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'Done':
      return { label: 'Completed', className: 'badge-status-done' };
    case 'In Progress':
      return { label: 'In Progress', className: 'badge-status-progress' };
    case 'In Review':
      return { label: 'In Review', className: 'badge-status-review' };
    case 'Backlog':
    default:
      return { label: 'Pending', className: 'badge-status-pending' };
  }
}

export function priorityChipClass(priority: TaskPriority): string {
  switch (priority) {
    case 'High':
      return 'badge-priority-high';
    case 'Medium':
      return 'badge-priority-medium';
    case 'Low':
    default:
      return 'badge-priority-low';
  }
}

export function projectStatusChipClass(status: DerivedProjectStatus): string {
  switch (status) {
    case 'Ended':
      return 'badge-project-ended';
    case 'Running':
      return 'badge-project-running';
    case 'Pending':
    default:
      return 'badge-project-pending';
  }
}

export function categoryChipClasses(category: EventCategory | undefined): {
  chipClass: string;
  dotClass: string;
} {
  switch (category) {
    case 'Meeting':
      return { chipClass: 'badge-category-meeting', dotClass: 'dot-category-meeting' };
    case 'Team':
      return { chipClass: 'badge-category-team', dotClass: 'dot-category-team' };
    case 'Review':
      return { chipClass: 'badge-category-review', dotClass: 'dot-category-review' };
    case 'Deadline':
      return { chipClass: 'badge-category-deadline', dotClass: 'dot-category-deadline' };
    case 'Social':
    default:
      return { chipClass: 'badge-category-social', dotClass: 'dot-category-social' };
  }
}

export function presenceDotClass(presence: PresenceStatus): string {
  switch (presence) {
    case 'online':
      return 'presence-dot-online';
    case 'away':
      return 'presence-dot-away';
    case 'offline':
    default:
      return 'presence-dot-offline';
  }
}

export function presenceTextLabel(presence: PresenceStatus): string {
  switch (presence) {
    case 'online':
      return 'Online';
    case 'away':
      return 'Away';
    case 'offline':
    default:
      return 'Offline';
  }
}
