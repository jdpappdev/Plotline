import React from 'react';
import { Calendar, CheckCircle2, MapPin, Plus, Video } from 'lucide-react';
import type { CalendarEvent, Project, TaskItem, TeamMember } from '../../domain/types';
import { getProjectProgress, getProjectStatus } from '../../domain/derivations';
import { formatDateBadge, formatShortDate } from '../../lib/format';
import { contourGlyph } from '../../lib/contourGlyph';
import { ACCENT_THEMES } from '../../lib/theme';
import { MotionCard } from '../../ui/Motion';
import { EventCategoryChip, ProjectStatusChip } from '../../ui/StatusChips';

interface NextUpAndPortfolioProps {
  nextEvent: CalendarEvent | null;
  checkedInEventIds: string[];
  team: TeamMember[];
  projects: Project[];
  tasks: TaskItem[];
  accentHex: string;
  onToggleCheckIn: (eventId: string) => void;
  onNavigateCalendar: () => void;
  onNavigateProjects: () => void;
  onOpenNewProject: () => void;
  onSelectProject: (projectId: string) => void;
}

export const NextUpAndPortfolioSection: React.FC<NextUpAndPortfolioProps> = ({
  nextEvent,
  checkedInEventIds,
  team,
  projects,
  tasks,
  accentHex,
  onToggleCheckIn,
  onNavigateCalendar,
  onNavigateProjects,
  onOpenNewProject,
  onSelectProject,
}) => {
  const isCheckedIn = nextEvent ? checkedInEventIds.includes(nextEvent.id) : false;
  const dateBadge = nextEvent ? formatDateBadge(nextEvent.date) : null;

  return (
    <>
      <MotionCard index={5} className="col-span-12 lg:col-span-4 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Next Up</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Upcoming calendar session</p>
          </div>
          <button
            type="button"
            onClick={onNavigateCalendar}
            className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
          >
            Full schedule
          </button>
        </div>

        {nextEvent && dateBadge ? (
          <div className="flex flex-col justify-between flex-1 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <span className="text-[9px] font-extrabold text-[var(--accent)] tracking-wider">
                      {dateBadge.monthShort}
                    </span>
                    <span className="text-[15px] font-extrabold text-slate-900 leading-none font-mono-tabular">
                      {dateBadge.dayNum}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <EventCategoryChip category={nextEvent.category} />
                    <h3 className="text-[14px] font-bold text-slate-900 truncate mt-1">
                      {nextEvent.title}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-2 font-mono-tabular">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {formatShortDate(nextEvent.date)} · {nextEvent.startTime} – {nextEvent.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{nextEvent.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                {nextEvent.attendeeIds.slice(0, 4).map((id) => {
                  const member = team.find((m) => m.id === id);
                  if (!member) return null;
                  return (
                    <span
                      key={id}
                      title={member.name}
                      className="w-6 h-6 rounded-full bg-slate-800 text-white text-[9px] font-bold inline-flex items-center justify-center ring-2 ring-white"
                    >
                      {member.initials}
                    </span>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => onToggleCheckIn(nextEvent.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  isCheckedIn
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-xs'
                }`}
              >
                {isCheckedIn ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Meeting</span>
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5" />
                    <span>Start Meeting</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[12px] text-slate-400">
            No upcoming sessions scheduled.
          </div>
        )}
      </MotionCard>

      <MotionCard index={7} className="col-span-12 lg:col-span-4 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 tracking-tight"> Projects</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Active studio workstreams</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewProject}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={onNavigateProjects}
              className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
            >
              All ({projects.length})
            </button>
          </div>
        </div>

        <div className="space-y-2 my-auto">
          {projects.slice(0, 5).map((proj) => {
            const status = getProjectStatus(proj, tasks);
            const progress = getProjectProgress(proj, tasks);
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={contourGlyph(proj.id, accentHex || ACCENT_THEMES.tide.hex)}
                    alt=""
                    className="w-8 h-8 rounded-lg shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-slate-900 truncate group-hover:text-[var(--accent)] transition-colors">
                      {proj.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono-tabular">
                      Due {formatShortDate(proj.targetDate)} · {progress}%
                    </div>
                  </div>
                </div>
                <ProjectStatusChip status={status} className="shrink-0" />
              </div>
            );
          })}
        </div>
      </MotionCard>
    </>
  );
};
