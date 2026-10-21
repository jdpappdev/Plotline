import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AnalyticsScreen from './components/AnalyticsScreen';
import CalendarScreen from './components/CalendarScreen';
import DashboardScreen from './components/DashboardScreen';
import HelpScreen from './components/HelpScreen';
import ProjectsScreen from './components/ProjectsScreen';
import SettingsScreen from './components/SettingsScreen';
import TasksScreen from './components/TasksScreen';
import TeamScreen from './components/TeamScreen';
import { MobileTabBar } from './components/shell/MobileTabBar';
import { ShellOverlays } from './components/shell/ShellOverlays';
import { SidebarRail } from './components/shell/SidebarRail';
import { TopBarHeader } from './components/shell/TopBarHeader';
import { resolveRouteFromLocation } from './components/shell/types';
import { applyAccentCssVariables, RouteId, usePlotlineStore } from './store';
import { ContourGlyph } from './utils/contourGlyph';
import { pluralize } from './utils/string';

export default function App() {
  const {
    projects,
    tasks,
    team,
    accent,
    activeRoute,
    railCollapsed,
    searchQuery,
    currentUser,
    timerRunning,
    timerSeconds,
    timerTaskId,
    toasts,
    newProjectModalOpen,
    newTaskModalOpen,
    isSignedOut,
    setActiveRoute,
    toggleRail,
    setSearchQuery,
    setNewProjectModalOpen,
    setNewTaskModalOpen,
    setCommandPaletteOpen,
    setSignedOut,
    setAccent,
    addProject,
    addTask,
    tickTimer,
    toggleTimer,
    resetTimer,
    pushToast,
    dismissToast,
  } = usePlotlineStore();

  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Track tablet viewport (640px - 1023px) to force collapsed icon rail
  const [isTabletViewport, setIsTabletViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 640 && window.innerWidth < 1024;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const w = window.innerWidth;
      setIsTabletViewport(w >= 640 && w < 1024);
      if (w >= 640) {
        setMoreSheetOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveRailCollapsed = isTabletViewport ? true : railCollapsed;

  // Sync CSS variable on mount and whenever accent changes
  useEffect(() => {
    applyAccentCssVariables(accent);
  }, [accent]);

  // Global Focus Timer ticker in the App Shell so elapsed time persists across route changes
  useEffect(() => {
    if (!timerRunning) return;
    const intervalId = window.setInterval(() => {
      tickTimer();
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [timerRunning, tickTimer]);

  // Sync route with URL hash/pathname for deep-linking, 404 handling & reload persistence
  useEffect(() => {
    const syncLocation = () => {
      const next = resolveRouteFromLocation();
      setActiveRoute(next);
    };
    syncLocation();
    window.addEventListener('hashchange', syncLocation);
    window.addEventListener('popstate', syncLocation);
    return () => {
      window.removeEventListener('hashchange', syncLocation);
      window.removeEventListener('popstate', syncLocation);
    };
  }, [setActiveRoute]);

  // Keyboard shortcuts (Cmd/Ctrl+K, N, T, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!usePlotlineStore.getState().commandPaletteOpen);
        return;
      }

      const isEditableElement = (el: Element | EventTarget | null): boolean => {
        if (!el || !(el instanceof HTMLElement)) return false;
        const tag = el.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
        if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') return true;
        return el.closest('[contenteditable="true"]') !== null;
      };

      const isInput = isEditableElement(e.target) || isEditableElement(document.activeElement);
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey || e.shiftKey;
      const storeState = usePlotlineStore.getState();
      const isDialogOpen =
        isSignedOut ||
        logoutConfirmOpen ||
        newProjectModalOpen ||
        newTaskModalOpen ||
        storeState.commandPaletteOpen ||
        storeState.importModalOpen ||
        storeState.selectedProjectIdForDialog !== null ||
        storeState.selectedProfileMemberId !== null ||
        document.querySelector('[role="dialog"]') !== null;

      if (!isInput && !hasModifier && !isDialogOpen) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setNewProjectModalOpen(true);
          return;
        }
        if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          setNewTaskModalOpen(true);
          return;
        }
      }

      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMoreSheetOpen(false);
        setSearchFocused(false);
        setLogoutConfirmOpen(false);
        if (newProjectModalOpen) setNewProjectModalOpen(false);
        if (newTaskModalOpen) setNewTaskModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSignedOut,
    logoutConfirmOpen,
    newProjectModalOpen,
    newTaskModalOpen,
    setCommandPaletteOpen,
    setNewProjectModalOpen,
    setNewTaskModalOpen,
  ]);

  const handleNavigate = useCallback(
    (routeId: RouteId) => {
      setActiveRoute(routeId);
      window.history.replaceState(null, '', `#${routeId.toLowerCase()}`);
      setMoreSheetOpen(false);
    },
    [setActiveRoute]
  );

  const activeFocusTask = useMemo(
    () => tasks.find((t) => t.id === timerTaskId) || tasks[0],
    [tasks, timerTaskId]
  );

  // Signed-Out Screen ("Sign back in" restores the session without deleting anything)
  if (isSignedOut) {
    return (
      <div className="h-[100dvh] overflow-y-auto flex items-center justify-center bg-[var(--surface-canvas)] text-[var(--ink-primary)] p-4">
        <div className="w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-8 text-center space-y-5 shadow-sm plotline-enter">
          <div className="mx-auto w-16 h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
            <ContourGlyph seed={currentUser.id} size={48} />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              Session Locked
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
              Signed out of Plotline
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
              Your workspace for{' '}
              <span className="font-semibold text-[var(--ink-primary)]">{currentUser.name}</span> (
              {pluralize(projects.length, 'project')}, {pluralize(tasks.length, 'task')}) is safely
              preserved in local storage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSignedOut(false);
              pushToast(
                `Welcome back, ${currentUser.name}`,
                'Session restored with all data intact.'
              );
            }}
            style={{ backgroundColor: 'var(--accent)' }}
            className="w-full min-h-[44px] py-2.5 px-5 rounded-full text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer shadow-2xs"
          >
            Sign back in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex min-h-0 bg-[var(--surface-canvas)] text-[var(--ink-primary)] selection:bg-[var(--accent-soft)] selection:text-[var(--ink-primary)]">
      {/* Collapsing Icon Rail: hidden on <640px, collapsed 64px rail at 640-1023px, expandable on >=1024px */}
      <SidebarRail
        activeRoute={activeRoute}
        railCollapsed={railCollapsed}
        effectiveRailCollapsed={effectiveRailCollapsed}
        onNavigate={handleNavigate}
        onToggleRail={toggleRail}
        onOpenLogoutConfirm={() => setLogoutConfirmOpen(true)}
      />

      {/* Main Content Column (no overflow: hidden clipping) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full">
        {/* Top Bar:
            - On <640px: Logo, Search Icon (opens ⌘K palette full-screen), Avatar (44px touch targets)
            - On >=640px: Search Input + ⌘K trigger, User Chip */}
        <TopBarHeader
          projects={projects}
          tasks={tasks}
          team={team}
          accent={accent}
          searchQuery={searchQuery}
          currentUser={currentUser}
          searchFocused={searchFocused}
          userMenuOpen={userMenuOpen}
          onSetSearchQuery={setSearchQuery}
          onSetSearchFocused={setSearchFocused}
          onSetUserMenuOpen={setUserMenuOpen}
          onSetCommandPaletteOpen={setCommandPaletteOpen}
          onSetAccent={setAccent}
          onNavigate={handleNavigate}
          onOpenLogoutConfirm={() => setLogoutConfirmOpen(true)}
        />

        {/* Route Change 2px Top Accent Sweep Line (400ms) */}
        <div
          key={`sweep-${activeRoute}`}
          className="plotline-route-sweep shrink-0"
          aria-hidden="true"
        />

        {/* Main Viewport Canvas:
            Vertical touch scroll with min-h-0 and safe bottom padding for mobile tab bar + mini timer pill */}
        <main
          key={`route-${activeRoute}`}
          style={{
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            zIndex: 'var(--z-content)',
          }}
          className={`flex-1 min-h-0 min-w-0 contour-surface motion-route px-4 sm:px-6 pt-3 overflow-x-hidden overflow-y-auto ${
            timerRunning
              ? 'pb-[calc(9.5rem+env(safe-area-inset-bottom))] sm:pb-6'
              : 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-6'
          }`}
        >
          {activeRoute === 'Dashboard' ? (
            <DashboardScreen />
          ) : activeRoute === 'Projects' ? (
            <ProjectsScreen />
          ) : activeRoute === 'Tasks' ? (
            <TasksScreen />
          ) : activeRoute === 'Calendar' ? (
            <CalendarScreen />
          ) : activeRoute === 'Analytics' ? (
            <AnalyticsScreen />
          ) : activeRoute === 'Team' ? (
            <TeamScreen />
          ) : activeRoute === 'Settings' ? (
            <SettingsScreen />
          ) : activeRoute === 'Help' ? (
            <HelpScreen />
          ) : (
            <div
              data-testid="not-found-screen"
              className="max-w-lg mx-auto my-12 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-8 text-center space-y-5 plotline-enter"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
                <ContourGlyph seed="plotline-404-uncharted-sector" size={56} />
              </div>

              <div className="space-y-1.5">
                <span
                  className="block text-4xl font-display-num font-semibold leading-none"
                  style={{ color: 'var(--accent)' }}
                >
                  404
                </span>
                <h1 className="text-xl font-bold tracking-tight text-[var(--ink-primary)]">
                  Uncharted sector — page not found
                </h1>
                <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
                  The requested coordinates (
                  {typeof window !== 'undefined'
                    ? window.location.hash || window.location.pathname
                    : '#/404'}
                  ) do not match any active workspace view in Plotline.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNavigate('Dashboard')}
                  style={{ backgroundColor: 'var(--accent)' }}
                  className="min-h-[44px] px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Return to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('Tasks')}
                  className="min-h-[44px] px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[var(--surface-sunken)] text-[var(--ink-primary)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                >
                  Open Tasks
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Tab Bar, Mini Focus Timer Pill, and "More" Bottom Sheet (<640px) */}
      <MobileTabBar
        activeRoute={activeRoute}
        moreSheetOpen={moreSheetOpen}
        timerRunning={timerRunning}
        timerSeconds={timerSeconds}
        activeFocusTask={activeFocusTask}
        onNavigate={handleNavigate}
        onSetMoreSheetOpen={setMoreSheetOpen}
        onToggleTimer={toggleTimer}
        onResetTimer={resetTimer}
        onOpenLogoutConfirm={() => setLogoutConfirmOpen(true)}
      />

      {/* Global Shell Modals, Overlays, and Toast Notifications */}
      <ShellOverlays
        team={team}
        currentUser={currentUser}
        toasts={toasts}
        timerRunning={timerRunning}
        newProjectModalOpen={newProjectModalOpen}
        newTaskModalOpen={newTaskModalOpen}
        logoutConfirmOpen={logoutConfirmOpen}
        onNavigate={handleNavigate}
        onSetNewProjectModalOpen={setNewProjectModalOpen}
        onSetNewTaskModalOpen={setNewTaskModalOpen}
        onSetLogoutConfirmOpen={setLogoutConfirmOpen}
        onSetSignedOut={setSignedOut}
        onAddProject={addProject}
        onAddTask={addTask}
        onDismissToast={dismissToast}
      />
    </div>
  );
}
