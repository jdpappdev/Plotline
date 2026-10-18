export const DEFAULT_MEMBER_CAPACITY_HOURS = 60;
export const DEFAULT_PROJECT_BUDGET = 150000;
export const INITIAL_PROJECT_CODE_BASE = 107;
export const IMPORTED_PROJECT_CODE_BASE = 110;
export const SAMPLE_BATCH_PROJECT_CODE_BASE = 120;
export const INITIAL_TASK_CODE_BASE = 100;
export const DEFAULT_SUBTASKS_TOTAL = 4;
export const DEFAULT_CYCLE_DAYS = 5;

export const PRIORITY_ESTIMATE_HOURS = {
  High: 14,
  Medium: 10,
  Low: 6,
} as const;

export const TASK_FACTOR_BANDS = {
  Done: [0.55, 0.7] as [number, number],
  'In Review': [0.5, 0.65] as [number, number],
  'In Progress': [0.25, 0.4] as [number, number],
  Backlog: [0, 0] as [number, number],
};

export const SEED_TASK_FACTORS: Record<string, number> = {
  'tsk-h-1': 0.62,
  'tsk-h-2': 0.6,
  'tsk-h-3': 0.625,
  'tsk-h-4': 0.6,
  'tsk-f-1': 0.6,
  'tsk-f-2': 0.625,
  'tsk-o-1': 0.6,
  'tsk-o-2': 0.625,
  'tsk-a-1': 0.6,
  'tsk-a-2': 0.6,
  'tsk-a-3': 0.6,
  'tsk-l-1': 0.625,
  'tsk-l-2': 0.6,
  'tsk-l-3': 0.625,
  'tsk-l-4': 0.6,
  'tsk-h-6': 0.575,
  'tsk-o-4': 0.55,
  'tsk-a-4': 0.575,
  'tsk-h-5': 1 / 3,
  'tsk-f-3': 0.3214,
  'tsk-f-4': 0.325,
  'tsk-o-3': 0.3182,
};

export const SESSION_LOOKBACK_DAYS = 60;
export const TENTHS_PER_HOUR = 10;
export const SECONDS_PER_TENTH_HOUR = 360;
export const MIN_CHUNK_TENTHS = 5;
export const MAX_CHUNK_TENTHS = 30;
export const TARGET_CHUNK_TENTHS = 21;
export const MAX_PERSON_DAILY_TENTHS = 60;
export const MAX_TEAM_DAILY_TENTHS = 120;
export const DEFAULT_SESSION_HOUR = 14;
export const RECENT_SESSION_BUFFER_MS = 15 * 60 * 1000;
export const SESSION_ORDER_STEP_MS = 20 * 60 * 1000;
export const FALLBACK_START_OFFSET_DAYS = -10;
export const MIN_COMPLETED_START_BUFFER_DAYS = 5;
export const COMPLETED_START_EXTRA_DAYS = 6;
