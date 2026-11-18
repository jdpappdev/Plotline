import { Project, TaskItem, TeamMember } from '../types';
import { getTodayIsoDate } from '../../lib/clock';

const MAX_RINGS_PROJECTS = 4;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type DerivedProjectStatus = 'Ended' | 'Pending' | 'Running';
export type ProjectSortField = 'dueDate' | 'progress' | 'name';
export type ProjectStatusFilter = 'all' | 'running' | 'pending' | 'ended';

export function getProjectProgress(project: Project, tasks: TaskItem[]): number {
  const projTasks = tasks.filter((t) => t.projectId === project.id);
  if (projTasks.length === 0) return 0;
  const doneCount = projTasks.filter((t) => t.status === 'Done').length;
  return Math.round((doneCount / projTasks.length) * 100);
}

export function getProjectStatus(project: Project, tasks: TaskItem[]): DerivedProjectStatus {
  if (project.statusOverride) {
    return project.statusOverride;
  }
  const projTasks = tasks.filter((t) => t.projectId === project.id);
  if (projTasks.length === 0) {
    return 'Pending';
  }
  if (projTasks.every((t) => t.status === 'Done')) {
    return 'Ended';
  }
  const hasStartedTask = projTasks.some(
    (t) => t.status === 'In Progress' || t.status === 'In Review' || t.status === 'Done'
  );
  if (!hasStartedTask) {
    return 'Pending';
  }
  return 'Running';
}

export function getProjectHealth(project: Project, tasks: TaskItem[]): 'At risk' | 'On track' {
  const today = getTodayIsoDate();
  const projTasks = tasks.filter((t) => t.projectId === project.id);
  const hasOverdue = projTasks.some(
    (t) => t.status !== 'Done' && Boolean(t.dueDate) && t.dueDate < today
  );
  return hasOverdue ? 'At risk' : 'On track';
}

export function getProjectTaskSummary(
  projectId: string,
  tasks: TaskItem[]
): {
  projectTasks: TaskItem[];
  totalCount: number;
  doneCount: number;
  openCount: number;
} {
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const doneCount = projectTasks.filter((t) => t.status === 'Done').length;
  return {
    projectTasks,
    totalCount: projectTasks.length,
    doneCount,
    openCount: projectTasks.length - doneCount,
  };
}

export interface ProjectStatusCounts {
  totalCount: number;
  endedCount: number;
  runningCount: number;
  pendingCount: number;
  endedPct: number;
  runningPct: number;
  pendingPct: number;
}

export function computeProjectStatusCounts(
  projects: Project[],
  tasks: TaskItem[]
): ProjectStatusCounts {
  let endedCount = 0;
  let runningCount = 0;
  let pendingCount = 0;

  projects.forEach((p) => {
    const status = getProjectStatus(p, tasks);
    if (status === 'Ended') endedCount += 1;
    else if (status === 'Pending') pendingCount += 1;
    else runningCount += 1;
  });

  const totalCount = projects.length;
  const safeTotal = Math.max(1, totalCount);

  return {
    totalCount,
    endedCount,
    runningCount,
    pendingCount,
    endedPct: Math.round((endedCount / safeTotal) * 100),
    runningPct: Math.round((runningCount / safeTotal) * 100),
    pendingPct: Math.round((pendingCount / safeTotal) * 100),
  };
}

export function filterAndSortProjects(
  projects: Project[],
  tasks: TaskItem[],
  team: TeamMember[],
  options: {
    statusFilter: ProjectStatusFilter;
    sortField: ProjectSortField;
    searchQuery: string;
  }
): Project[] {
  const normalizedQuery = options.searchQuery.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    const status = getProjectStatus(p, tasks);
    if (options.statusFilter === 'running' && status !== 'Running') return false;
    if (options.statusFilter === 'pending' && status !== 'Pending') return false;
    if (options.statusFilter === 'ended' && status !== 'Ended') return false;

    if (!normalizedQuery) return true;
    const lead = team.find((m) => m.id === p.leadId);
    return (
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.code.toLowerCase().includes(normalizedQuery) ||
      p.client.toLowerCase().includes(normalizedQuery) ||
      (lead ? lead.name.toLowerCase().includes(normalizedQuery) : false)
    );
  });

  return [...filtered].sort((a, b) => {
    if (options.sortField === 'dueDate') {
      return a.targetDate.localeCompare(b.targetDate);
    }
    if (options.sortField === 'progress') {
      return getProjectProgress(b, tasks) - getProjectProgress(a, tasks);
    }
    return a.name.localeCompare(b.name);
  });
}

export function getRingsProjects(
  projects: Project[],
  tasks: TaskItem[]
): Array<{ project: Project; progress: number }> {
  const unfinished = projects.filter((p) => getProjectStatus(p, tasks) !== 'Ended');
  unfinished.sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  return unfinished.slice(0, MAX_RINGS_PROJECTS).map((p) => ({
    project: p,
    progress: getProjectProgress(p, tasks),
  }));
}

export interface ParsedImportRow {
  rowNumber: number;
  name: string;
  client: string;
  targetDate: string;
  status: DerivedProjectStatus;
  valid: boolean;
  duplicate: boolean;
  error?: string;
}

function parseImportStatus(rawStatus: string | undefined): {
  status: DerivedProjectStatus;
  valid: boolean;
} {
  const clean = (rawStatus || 'pending').trim().toLowerCase();
  if (clean === 'pending') return { status: 'Pending', valid: true };
  if (clean === 'running' || clean === 'on track' || clean === 'at risk') {
    return { status: 'Running', valid: true };
  }
  if (clean === 'ended' || clean === 'completed') return { status: 'Ended', valid: true };
  return { status: 'Pending', valid: false };
}

function isValidIsoDateString(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function parseCsvRecords(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let inQuotes = false;
  let afterQuote = false;

  const pushField = () => {
    record.push(field.trim());
    field = '';
    afterQuote = false;
  };
  const pushRecord = () => {
    pushField();
    if (record.some((value) => value.length > 0)) records.push(record);
    record = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const isLineBreak = char === '\n' || char === '\r';

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
        afterQuote = true;
      } else {
        field += char;
      }
      continue;
    }

    if (afterQuote) {
      if (char === ',') {
        pushField();
      } else if (isLineBreak) {
        if (char === '\r' && text[i + 1] === '\n') i += 1;
        pushRecord();
      } else if (!/\s/.test(char)) {
        throw new Error('Unexpected text after a quoted CSV field.');
      }
      continue;
    }

    if (char === '"') {
      if (field.trim().length > 0) throw new Error('Unexpected quote in an unquoted CSV field.');
      field = '';
      inQuotes = true;
    } else if (char === ',') {
      pushField();
    } else if (isLineBreak) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      pushRecord();
    } else {
      field += char;
    }
  }

  if (inQuotes) throw new Error('CSV contains an unclosed quoted field.');
  if (field.length > 0 || record.length > 0 || afterQuote) pushRecord();
  return records;
}

export function parseAndValidateImportRows(
  rawText: string,
  existingProjects: Project[]
): {
  rows: ParsedImportRow[];
  validRows: Array<{
    name: string;
    client: string;
    targetDate: string;
    status: DerivedProjectStatus;
  }>;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
} {
  const trimmed = rawText.trim();
  const rawRecords: Array<{
    name: string;
    client: string;
    targetDate: string;
    statusRaw: string;
  }> = [];

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      list.forEach((item) => {
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          rawRecords.push({
            name: String(obj.name ?? obj.title ?? '').trim(),
            client: String(obj.client ?? 'Independent Partner').trim(),
            targetDate: String(obj.due_date ?? obj.targetDate ?? obj.dueDate ?? '').trim(),
            statusRaw: String(obj.status ?? 'pending').trim(),
          });
        }
      });
    } catch {
      rawRecords.push({ name: '', client: '', targetDate: '', statusRaw: 'invalid-json' });
    }
  } else if (trimmed) {
    try {
      const csvRecords = parseCsvRecords(trimmed);
      const headers =
        csvRecords[0]?.map((value) => value.toLowerCase().replace(/[\s-]+/g, '_')) ?? [];
      const nameIndex = headers.findIndex((header) => header === 'name' || header === 'title');
      const clientIndex = headers.indexOf('client');
      const dateIndex = headers.findIndex((header) =>
        ['due_date', 'duedate', 'target_date', 'targetdate'].includes(header)
      );
      const statusIndex = headers.indexOf('status');
      const hasHeader = nameIndex !== -1 && dateIndex !== -1;
      const dataRecords = hasHeader ? csvRecords.slice(1) : csvRecords;

      dataRecords.forEach((parts) => {
        const valueAt = (index: number, fallback = '') =>
          index < 0 ? fallback : (parts[index] ?? fallback);
        rawRecords.push({
          name: valueAt(hasHeader ? nameIndex : 0),
          client: valueAt(hasHeader ? clientIndex : 1, 'Independent Partner'),
          targetDate: valueAt(hasHeader ? dateIndex : 2),
          statusRaw: valueAt(hasHeader ? statusIndex : 3, 'pending'),
        });
      });
    } catch {
      rawRecords.push({
        name: 'Malformed CSV payload',
        client: '—',
        targetDate: '—',
        statusRaw: 'invalid-csv',
      });
    }
  }

  const seenKeys = new Set(
    existingProjects.map((p) => `${p.name.trim().toLowerCase()}|${p.targetDate.trim()}`)
  );

  const rows: ParsedImportRow[] = rawRecords.map((rec, idx) => {
    const statusParsed = parseImportStatus(rec.statusRaw);
    if (rec.statusRaw === 'invalid-csv') {
      return {
        rowNumber: idx + 1,
        name: rec.name,
        client: rec.client,
        targetDate: rec.targetDate,
        status: 'Pending',
        valid: false,
        duplicate: false,
        error: 'Invalid CSV quoting or field structure',
      };
    }
    if (rec.statusRaw === 'invalid-json') {
      return {
        rowNumber: idx + 1,
        name: 'Malformed JSON payload',
        client: '—',
        targetDate: '—',
        status: 'Pending',
        valid: false,
        duplicate: false,
        error: 'Invalid JSON syntax',
      };
    }

    if (!rec.name) {
      return {
        rowNumber: idx + 1,
        name: '—',
        client: rec.client || '—',
        targetDate: rec.targetDate || '—',
        status: statusParsed.status,
        valid: false,
        duplicate: false,
        error: 'Missing project name',
      };
    }

    if (!isValidIsoDateString(rec.targetDate)) {
      return {
        rowNumber: idx + 1,
        name: rec.name,
        client: rec.client || 'Independent Partner',
        targetDate: rec.targetDate || '—',
        status: statusParsed.status,
        valid: false,
        duplicate: false,
        error: 'Target date must be YYYY-MM-DD',
      };
    }

    if (!statusParsed.valid) {
      return {
        rowNumber: idx + 1,
        name: rec.name,
        client: rec.client || 'Independent Partner',
        targetDate: rec.targetDate,
        status: 'Pending',
        valid: false,
        duplicate: false,
        error: 'Status must be pending, running, or ended',
      };
    }

    const dedupeKey = `${rec.name.toLowerCase()}|${rec.targetDate}`;
    if (seenKeys.has(dedupeKey)) {
      return {
        rowNumber: idx + 1,
        name: rec.name,
        client: rec.client || 'Independent Partner',
        targetDate: rec.targetDate,
        status: statusParsed.status,
        valid: false,
        duplicate: true,
        error: 'Duplicate name + due date',
      };
    }

    seenKeys.add(dedupeKey);
    return {
      rowNumber: idx + 1,
      name: rec.name,
      client: rec.client || 'Independent Partner',
      targetDate: rec.targetDate,
      status: statusParsed.status,
      valid: true,
      duplicate: false,
    };
  });

  const validRows = rows
    .filter((r) => r.valid)
    .map((r) => ({
      name: r.name,
      client: r.client,
      targetDate: r.targetDate,
      status: r.status,
    }));

  return {
    rows,
    validRows,
    validCount: validRows.length,
    duplicateCount: rows.filter((r) => r.duplicate).length,
    invalidCount: rows.filter((r) => !r.valid && !r.duplicate).length,
  };
}
