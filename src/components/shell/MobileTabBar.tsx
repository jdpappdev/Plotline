import React, { useMemo } from 'react';
import { ChevronRight, LogOut, MoreHorizontal, Pause, Play, Square } from 'lucide-react';
import { RouteId, TaskItem } from '../../domain/types';
import { Dialog } from '../../ui/Dialog';
import { formatTimerHMS, MOBILE_MORE_ROUTES, MOBILE_PRIMARY_TABS } from './types';

export interface MobileTabBarProps {
  activeRoute: RouteId;
  moreSheetOpen: boolean;
  timerRunning: boolean;
  timerSeconds: number;
  activeFocusTask: TaskItem | undefined;
  onNavigate: (routeId: RouteId) => void;
  onSetMoreSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onOpenLogoutConfirm: () => void;
}

export function MobileTabBar({
  activeRoute,
  moreSheetOpen,
  timerRunning,
  timerSeconds,
  activeFocusTask,
  onNavigate,
  onSetMoreSheetOpen,
  onToggleTimer,
  onResetTimer,
  onOpenLogoutConfirm,
}: MobileTabBarProps) {
  const isMoreRouteActive = useMemo(
    () => MOBILE_MORE_ROUTES.some((r) => r.id === activeRoute),
    [activeRoute]
  );

  return (
    <>
      {/* Mini Focus Timer Pill above the tab bar on every screen (<640px) when running */}
      {timerRunning && (
        <div
          data-testid="mini-focus-timer-pill"
          style={{ zIndex: 'var(--z-sticky-header)' }}
          className="sm:hidden fixed left-3 right-3 bottom-[calc(56px+env(safe-area-inset-bottom)+8px)] time-tracker-surface text-white rounded-full px-3 py-1.5 shadow-lg flex items-center justify-between gap-2"
        >
          <button
            type="button"
            onClick={() => onNavigate('Dashboard')}
            className="flex items-center gap-2 min-w-0 flex-1 min-h-[44px] text-left cursor-pointer"
            aria-label={`Active focus timer ${formatTimerHMS(timerSeconds)} on ${activeFocusTask?.title || 'task'}. Tap to open Dashboard.`}
          >
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse shrink-0 ml-1" />
            <span className="font-ui-tabular text-xs font-bold tracking-tight shrink-0">
              {formatTimerHMS(timerSeconds)}
            </span>
            <span className="text-xs text-white/90 truncate">
              · {activeFocusTask?.title || 'Focus session'}
            </span>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onToggleTimer}
              aria-label="Pause focus timer"
              style={{ color: 'var(--accent-deep)' }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white flex items-center justify-center cursor-pointer shadow-2xs"
            >
              {timerRunning ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onResetTimer}
              aria-label="Stop and log focus session"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#DC2626] text-white flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar (<640px): Dashboard, Tasks, Calendar, Team, More */}
      <nav
        aria-label="Mobile Primary Navigation"
        data-testid="mobile-tab-bar"
        data-tour="mobile-tabbar"
        style={{ zIndex: 'var(--z-sticky-header)' }}
        className="sm:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface-elevated)]/95 backdrop-blur-md border-t border-[var(--border-hairline)] pb-[env(safe-area-inset-bottom)] px-1 select-none"
      >
        <div className="grid grid-cols-5 items-center h-14">
          {MOBILE_PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeRoute === tab.id && !moreSheetOpen;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[var(--ink-primary)] font-semibold'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                <span
                  style={{ color: isActive ? 'var(--accent)' : 'currentColor' }}
                  className="flex items-center justify-center"
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-[10px] leading-tight whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}

          {/* More Tab Button */}
          <button
            type="button"
            onClick={() => onSetMoreSheetOpen((prev) => !prev)}
            aria-expanded={moreSheetOpen}
            aria-haspopup="dialog"
            data-testid="mobile-tab-more"
            className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
              moreSheetOpen || isMoreRouteActive
                ? 'text-[var(--ink-primary)] font-semibold'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <span
              style={{
                color: moreSheetOpen || isMoreRouteActive ? 'var(--accent)' : 'currentColor',
              }}
              className="flex items-center justify-center"
            >
              <MoreHorizontal className="w-5 h-5" />
            </span>
            <span className="text-[10px] leading-tight whitespace-nowrap">More</span>
          </button>
        </div>
      </nav>

      {/* "More" Bottom Sheet (<640px): Projects, Analytics, Settings, Help, Log out */}
      <Dialog
        isOpen={moreSheetOpen}
        onClose={() => onSetMoreSheetOpen(false)}
        eyebrow="Workspace"
        title="More destinations"
      >
        <div className="p-4 space-y-1.5">
          {MOBILE_MORE_ROUTES.map((route) => {
            const Icon = route.icon;
            const isActive = activeRoute === route.id;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => onNavigate(route.id)}
                className={`w-full min-h-[48px] px-4 py-2.5 rounded-[var(--radius-md)] flex items-center justify-between gap-3 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--ink-primary)] font-semibold'
                    : 'text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span style={{ color: isActive ? 'var(--accent)' : 'var(--ink-secondary)' }}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span>{route.label}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--ink-muted)]" />
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-[var(--border-hairline)]">
            <button
              type="button"
              onClick={() => {
                onSetMoreSheetOpen(false);
                onOpenLogoutConfirm();
              }}
              className="w-full min-h-[48px] px-4 py-2.5 rounded-[var(--radius-md)] flex items-center gap-3 text-sm font-semibold text-[#C9352B] hover:bg-[#FBECEE]/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
