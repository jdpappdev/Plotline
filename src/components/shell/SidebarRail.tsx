import React from 'react';
import { ChevronLeft, ChevronRight, Compass, LogOut } from 'lucide-react';
import { RouteId } from '../../domain/types';
import { ROUTES } from './types';

export interface SidebarRailProps {
  activeRoute: RouteId;
  railCollapsed: boolean;
  effectiveRailCollapsed: boolean;
  onNavigate: (routeId: RouteId) => void;
  onToggleRail: () => void;
  onOpenLogoutConfirm: () => void;
}

export function SidebarRail({
  activeRoute,
  railCollapsed,
  effectiveRailCollapsed,
  onNavigate,
  onToggleRail,
  onOpenLogoutConfirm,
}: SidebarRailProps) {
  return (
    <aside
      aria-label="Primary Navigation"
      data-tour="sidebar"
      style={{
        width: effectiveRailCollapsed ? '64px' : '216px',
        transitionProperty: 'width, transform',
        transitionDuration: 'var(--duration-normal)',
        transitionTimingFunction: 'var(--ease-plotline)',
        zIndex: 'var(--z-sticky-header)',
      }}
      className="hidden sm:flex flex-col shrink-0 h-full min-h-0 bg-[var(--surface-elevated)] border-r border-[var(--border-hairline)] select-none"
    >
      {/* Brand Header inside Rail */}
      <div className="h-14 px-3 flex items-center justify-center lg:justify-between border-b border-[var(--border-hairline)] shrink-0">
        <button
          type="button"
          onClick={() => onNavigate('Dashboard')}
          className={`flex items-center gap-2.5 min-w-0 min-h-[44px] min-w-[44px] ${
            effectiveRailCollapsed ? 'justify-center' : 'px-1'
          } text-left group focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded-[var(--radius-sm)] cursor-pointer`}
          title="Plotline — Return to Dashboard"
        >
          <span
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 text-white transition-colors duration-160 ease-plotline"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Compass className="w-4 h-4" />
          </span>
          {!effectiveRailCollapsed && (
            <span className="block text-base font-semibold tracking-tight text-[var(--ink-primary)] truncate">
              Plotline
            </span>
          )}
        </button>
      </div>

      {/* Route Navigation List */}
      <nav
        className="flex-1 py-3 px-2 space-y-1 overflow-y-auto min-h-0"
        aria-label="Workspace Views"
      >
        {ROUTES.map((route) => {
          const Icon = route.icon;
          const isActive = activeRoute === route.id;
          const showLabels = !effectiveRailCollapsed;

          return (
            <button
              key={route.id}
              type="button"
              onClick={() => onNavigate(route.id)}
              title={effectiveRailCollapsed ? route.label : undefined}
              aria-label={effectiveRailCollapsed ? route.label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center ${
                showLabels ? 'justify-start px-3' : 'justify-center px-0'
              } min-h-[44px] lg:min-h-[40px] h-11 lg:h-10 rounded-[var(--radius-sm)] text-sm font-medium transition-colors duration-160 ease-plotline whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--ink-primary)] font-semibold'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ color: isActive ? 'var(--accent)' : 'currentColor' }}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                {showLabels && <span className="truncate">{route.label}</span>}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Rail Controls: Logout & Collapse Toggle */}
      <div className="p-2 border-t border-[var(--border-hairline)] space-y-1 shrink-0">
        <button
          type="button"
          onClick={onOpenLogoutConfirm}
          title={effectiveRailCollapsed ? 'Log out' : undefined}
          aria-label={effectiveRailCollapsed ? 'Log out' : undefined}
          className={`w-full flex items-center ${
            !effectiveRailCollapsed ? 'justify-start px-3 gap-3' : 'justify-center px-0'
          } min-h-[44px] lg:min-h-[36px] h-11 lg:h-9 rounded-[var(--radius-sm)] text-xs font-medium text-[var(--ink-secondary)] hover:text-[#C9352B] hover:bg-[#FBECEE]/60 transition-colors cursor-pointer`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!effectiveRailCollapsed && <span>Log out</span>}
        </button>

        <button
          type="button"
          onClick={onToggleRail}
          aria-label={railCollapsed ? 'Expand navigation rail' : 'Collapse navigation rail'}
          title={railCollapsed ? 'Expand rail' : 'Collapse rail'}
          className={`hidden lg:flex w-full items-center ${
            railCollapsed ? 'justify-center px-0' : 'justify-between px-3'
          } h-9 rounded-[var(--radius-sm)] text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors duration-160 ease-plotline whitespace-nowrap cursor-pointer`}
        >
          {!railCollapsed && <span>Collapse rail</span>}
          {railCollapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <ChevronLeft className="w-4 h-4 shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
