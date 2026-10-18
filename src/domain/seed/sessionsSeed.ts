import type { FocusSession, Project, TaskItem, TaskStatus } from '../types';
import {
  computeDaysAgoFromIso,
  computeDaysBetweenIso,
  getIsoDateOffset,
  getTodayIsoDate,
} from '../../lib/dates';
import { dedupeById } from '../../lib/format';
import {
  COMPLETED_START_EXTRA_DAYS,
  DEFAULT_SESSION_HOUR,
  FALLBACK_START_OFFSET_DAYS,
  MAX_CHUNK_TENTHS,
  MAX_PERSON_DAILY_TENTHS,
  MAX_TEAM_DAILY_TENTHS,
  MIN_CHUNK_TENTHS,
  MIN_COMPLETED_START_BUFFER_DAYS,
  RECENT_SESSION_BUFFER_MS,
  SECONDS_PER_TENTH_HOUR,
  SEED_TASK_FACTORS,
  SESSION_LOOKBACK_DAYS,
  SESSION_ORDER_STEP_MS,
  TARGET_CHUNK_TENTHS,
  TASK_FACTOR_BANDS,
  TENTHS_PER_HOUR,
} from './constants';

interface WeekdaySlot {
  dateStr: string;
  daysAgo: number;
  weekdayIdx: number;
  baseTimeMs: number;
}

interface DraftChunk {
  id: string;
  task: TaskItem;
  slot: WeekdaySlot;
  tenths: number;
  slotOrder: number;
}

export function getTaskFactorBand(status: TaskStatus): [number, number] {
  return TASK_FACTOR_BANDS[status] ?? TASK_FACTOR_BANDS.Backlog;
}

function buildEligibleWeekdayMap(nowMs: number): Map<string, WeekdaySlot> {
  const weekdayByDate = new Map<string, WeekdaySlot>();
  for (let daysAgo = SESSION_LOOKBACK_DAYS; daysAgo >= 0; daysAgo--) {
    const dateStr = getIsoDateOffset(-daysAgo);
    const parts = dateStr.split('-').map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    const weekdayIdx = dateObj.getDay();
    if (weekdayIdx === 0 || weekdayIdx === 6) continue;

    const defaultSessionMs = new Date(
      parts[0],
      parts[1] - 1,
      parts[2],
      DEFAULT_SESSION_HOUR,
      0,
      0
    ).getTime();
    const baseTimeMs =
      daysAgo === 0 ? Math.min(nowMs - RECENT_SESSION_BUFFER_MS, defaultSessionMs) : defaultSessionMs;
    if (baseTimeMs > nowMs) continue;

    weekdayByDate.set(dateStr, {
      dateStr,
      daysAgo,
      weekdayIdx,
      baseTimeMs,
    });
  }
  return weekdayByDate;
}

export function createSeedFocusSessions(tasks: TaskItem[], _projects: Project[]): FocusSession[] {
  const nowMs = Date.now();
  const todayIso = getTodayIsoDate();

  tasks.forEach((task) => {
    task.loggedSeconds = 0;
    if (!task.startDate) {
      task.startDate = task.completedDate
        ? getIsoDateOffset(
            -Math.max(
              MIN_COMPLETED_START_BUFFER_DAYS,
              computeDaysAgoFromIso(task.completedDate) + COMPLETED_START_EXTRA_DAYS
            )
          )
        : getIsoDateOffset(-COMPLETED_START_EXTRA_DAYS);
    }
    if (task.status === 'Done' && task.completedDate) {
      task.cycleDays = computeDaysBetweenIso(task.startDate, task.completedDate);
      task.onTime = task.completedDate <= task.dueDate;
    }
  });

  const weekdayByDate = buildEligibleWeekdayMap(nowMs);
  const personDayTenths = new Map<string, number>();
  const teamDayTenths = new Map<string, number>();

  const getPersonDayKey = (memberId: string, dateStr: string) => `${memberId}|${dateStr}`;
  const getPersonTenths = (memberId: string, dateStr: string) =>
    personDayTenths.get(getPersonDayKey(memberId, dateStr)) ?? 0;
  const getTeamTenths = (dateStr: string) => teamDayTenths.get(dateStr) ?? 0;

  const draftChunks: DraftChunk[] = [];

  tasks.forEach((task) => {
    if (task.status === 'Backlog') {
      task.loggedSeconds = 0;
      return;
    }

    const [minF, maxF] = getTaskFactorBand(task.status);
    const rawFactor = SEED_TASK_FACTORS[task.id] ?? (minF + maxF) / 2;
    const clampedFactor = Math.min(maxF, Math.max(minF, rawFactor));
    const targetTenths = Math.round(task.estimateHours * clampedFactor * TENTHS_PER_HOUR);
    if (targetTenths <= 0) return;

    const startIso = task.startDate || getIsoDateOffset(FALLBACK_START_OFFSET_DAYS);
    const endIso =
      task.status === 'Done' && task.completedDate
        ? task.completedDate <= todayIso
          ? task.completedDate
          : todayIso
        : todayIso;

    const eligibleSlots = Array.from(weekdayByDate.values())
      .filter((s) => s.dateStr >= startIso && s.dateStr <= endIso)
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    if (eligibleSlots.length === 0) return;

    const minChunks = Math.ceil(targetTenths / MAX_CHUNK_TENTHS);
    const maxChunks = Math.max(1, Math.floor(targetTenths / MIN_CHUNK_TENTHS));
    const desiredChunks = Math.round(targetTenths / TARGET_CHUNK_TENTHS);
    const chunkCount = Math.min(
      eligibleSlots.length,
      Math.max(minChunks, Math.min(maxChunks, desiredChunks))
    );

    const baseTenths = Math.floor(targetTenths / chunkCount);
    const remTenths = targetTenths % chunkCount;
    const chunkTenthsList: number[] = Array.from({ length: chunkCount }, (_, idx) =>
      idx < remTenths ? baseTenths + 1 : baseTenths
    );

    if (
      chunkCount >= 2 &&
      chunkTenthsList[0] + 1 <= MAX_CHUNK_TENTHS &&
      chunkTenthsList[chunkCount - 1] - 1 >= MIN_CHUNK_TENTHS &&
      chunkTenthsList[0] === chunkTenthsList[chunkCount - 1]
    ) {
      chunkTenthsList[0] += 1;
      chunkTenthsList[chunkCount - 1] -= 1;
    }

    const usedDates = new Set<string>();
    chunkTenthsList.forEach((cTenths, chunkIdx) => {
      const candidates = eligibleSlots
        .filter((s) => !usedDates.has(s.dateStr))
        .sort((a, b) => {
          const aPersonOk =
            getPersonTenths(task.assigneeId, a.dateStr) + cTenths <= MAX_PERSON_DAILY_TENTHS ? 0 : 1;
          const bPersonOk =
            getPersonTenths(task.assigneeId, b.dateStr) + cTenths <= MAX_PERSON_DAILY_TENTHS ? 0 : 1;
          if (aPersonOk !== bPersonOk) return aPersonOk - bPersonOk;

          const aTeam = getTeamTenths(a.dateStr);
          const bTeam = getTeamTenths(b.dateStr);
          if (aTeam !== bTeam) return aTeam - bTeam;

          return a.dateStr.localeCompare(b.dateStr);
        });

      const chosen = candidates[0] || eligibleSlots[chunkIdx % eligibleSlots.length];
      usedDates.add(chosen.dateStr);

      personDayTenths.set(
        getPersonDayKey(task.assigneeId, chosen.dateStr),
        getPersonTenths(task.assigneeId, chosen.dateStr) + cTenths
      );
      teamDayTenths.set(chosen.dateStr, getTeamTenths(chosen.dateStr) + cTenths);

      draftChunks.push({
        id: `fcs-seed-${chosen.dateStr}-${task.id}-${chunkIdx}`,
        task,
        slot: chosen,
        tenths: cTenths,
        slotOrder: chunkIdx,
      });
    });
  });

  for (const [dateStr, totalTenths] of teamDayTenths.entries()) {
    if (totalTenths > MAX_TEAM_DAILY_TENTHS) {
      const scale = MAX_TEAM_DAILY_TENTHS / totalTenths;
      const dayChunks = draftChunks.filter((c) => c.slot.dateStr === dateStr);
      dayChunks.forEach((c) => {
        c.tenths = Math.max(MIN_CHUNK_TENTHS, Math.floor(c.tenths * scale));
      });
    }
  }

  const sessions: FocusSession[] = draftChunks
    .sort((a, b) => b.slot.daysAgo - a.slot.daysAgo || a.id.localeCompare(b.id))
    .map((chunk, idx) => {
      const secs = chunk.tenths * SECONDS_PER_TENTH_HOUR;
      const hrs = Number((chunk.tenths / TENTHS_PER_HOUR).toFixed(1));
      chunk.task.loggedSeconds = (chunk.task.loggedSeconds || 0) + secs;

      const createdAtMs = Math.min(
        nowMs - (idx + 1) * 1000,
        chunk.slot.baseTimeMs + chunk.slotOrder * SESSION_ORDER_STEP_MS
      );

      return {
        id: chunk.id,
        taskId: chunk.task.id,
        projectId: chunk.task.projectId,
        memberId: chunk.task.assigneeId,
        weekdayIndex: chunk.slot.weekdayIdx,
        date: chunk.slot.dateStr,
        daysAgo: chunk.slot.daysAgo,
        seconds: secs,
        hours: hrs,
        createdAt: new Date(createdAtMs).toISOString(),
      };
    });

  return dedupeById(sessions);
}
