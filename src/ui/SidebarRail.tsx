import React from 'react';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Compass,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Smartphone,
  Users,
} from 'lucide-react';
import type { RouteId } from '../domain/types';

interface SidebarRailProps {
  activeRoute: RouteId;
  railCollapsed: boolean;
  openTasksCount: number;
  onSelectRoute: (route: RouteId) => void;
  onToggleRail: () => void;
  onSignOut: () => void;
  onDownloadCompanionGuide: () => void;
}

const MENU_ITEMS: Array<{
  id: RouteId;
  label: string;
  icon: React.FC<{ className?: string }>;
  showBadge?: boolean;
}> = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Projects', label: 'Projects', icon: FolderKanban },
  { id: 'Tasks', label: 'Tasks', icon: CheckSquare, showBadge: true },
  { id: 'Calendar', label: 'Calendar', icon: Calendar },
  { id: 'Analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'Team', label: 'Team', icon: Users },
];

const GENERAL_ITEMS: Array<{
  id: RouteId;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'Settings', label: 'Settings', icon: Settings },
  { id: 'Help', label: 'Help', icon: HelpCircle },
];

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeRoute,
  railCollapsed,
  openTasksCount,
  onSelectRoute,
  onToggleRail,
  onSignOut,
  onDownloadCompanionGuide,
}) => {
  return (
    <aside
      className={`${
        railCollapsed ? 'w-[76px]' : 'w-[244px]'
      } shrink-0 bg-white border-r border-[#E6E8EE] flex flex-col justify-between transition-all duration-200 select-none`}
    >
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => onSelectRoute('Dashboard')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-xs shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            {!railCollapsed && (
              <div>
                <div className="text-[16px] font-extrabold text-slate-900 tracking-tight leading-none">
                  Plotline
                </div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  Operations Atlas
                </div>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleRail}
            aria-label={railCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {railCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="space-y-1">
          {!railCollapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Menu
            </div>
          )}
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectRoute(item.id)}
                title={railCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer relative ${
                  active
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--accent)]" />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-[var(--accent)]' : 'text-slate-400'
                    }`}
                  />
                  {!railCollapsed && <span>{item.label}</span>}
                </div>
                {!railCollapsed && item.showBadge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono-tabular font-bold ${
                      active
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {openTasksCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-1 pt-2 border-t border-slate-100">
          {!railCollapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              General
            </div>
          )}
          {GENERAL_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectRoute(item.id)}
                title={railCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[var(--accent)]' : 'text-slate-400'
                  }`}
                />
                {!railCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          <button
            type="button"
            onClick={onSignOut}
            title={railCollapsed ? 'Logout' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
            {!railCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {!railCollapsed && (
        <div className="p-4">
          <div className="timer-console-surface p-4 rounded-2xl space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-white leading-snug">
                Download Mobile Companion
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Track field sessions and review deliverables on the go.
              </p>
            </div>
            <button
              type="button"
              onClick={onDownloadCompanionGuide}
              className="w-full py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11px] font-bold transition-colors cursor-pointer"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
