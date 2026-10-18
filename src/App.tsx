import { useEffect, useMemo } from 'react';
import { AnalyticsScreen } from './features/analytics';
import { CalendarScreen } from './features/calendar';
import { DashboardScreen } from './features/dashboard';
import { CommandPalette, HelpScreen, OnboardingTourModal } from './features/help';
import {
  ImportProjectsModal,
  NewProjectModal,
  ProjectDialog,
  ProjectsScreen,
} from './features/projects';
import { SettingsScreen } from './features/settings';
import { NewTaskModal, TasksScreen } from './features/tasks';
import { MemberProfileModal, TeamScreen } from './features/team';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import { SidebarRail } from './ui/SidebarRail';
import { SignedOutScreen } from './ui/SignedOutScreen';
import { ToastViewport } from './ui/Toast';
import { TopBar } from './ui/TopBar';

export function App() {
  const activeRoute = useWorkspaceStore((s) => s.activeRoute);
  const railCollapsed = useWorkspaceStore((s) => s.railCollapsed);
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const currentUser = useWorkspaceStore((s) => s.currentUser);
  const tasks = useWorkspaceStore((s) => s.tasks);
  const timerRunning = useWorkspaceStore((s) => s.timerRunning);
  const newTaskModalOpen = useWorkspaceStore((s) => s.newTaskModalOpen);
  const toasts = useWorkspaceStore((s) => s.toasts);
  const isSignedOut = useWorkspaceStore((s) => s.isSignedOut);

  const setActiveRoute = useWorkspaceStore((s) => s.setActiveRoute);
  const toggleRail = useWorkspaceStore((s) => s.toggleRail);
  const setSearchQuery = useWorkspaceStore((s) => s.setSearchQuery);
  const setCommandPaletteOpen = useWorkspaceStore((s) => s.setCommandPaletteOpen);
  const setNewProjectModalOpen = useWorkspaceStore((s) => s.setNewProjectModalOpen);
  const setNewTaskModalOpen = useWorkspaceStore((s) => s.setNewTaskModalOpen);
  const tickTimer = useWorkspaceStore((s) => s.tickTimer);
  const dismissToast = useWorkspaceStore((s) => s.dismissToast);
  const setSignedOut = useWorkspaceStore((s) => s.setSignedOut);
  const pushToast = useWorkspaceStore((s) => s.pushToast);

  const openTasksCount = useMemo(
    () => tasks.filter((t) => t.status !== 'Done').length,
    [tasks]
  );

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, tickTimer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (isInput) return;

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setNewProjectModalOpen(true);
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setNewTaskModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, setNewProjectModalOpen, setNewTaskModalOpen]);

  if (isSignedOut) {
    return (
      <SignedOutScreen
        currentUser={currentUser}
        onSignIn={() => setSignedOut(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] p-2 sm:p-3.5 flex items-stretch justify-center">
      <div className="w-full max-w-[1600px] bg-[var(--bg-shell)] rounded-[28px] border border-[#E6E8EE] shadow-[var(--shadow-shell)] flex overflow-hidden min-h-[calc(100vh-28px)]">
        <SidebarRail
          activeRoute={activeRoute}
          railCollapsed={railCollapsed}
          openTasksCount={openTasksCount}
          onSelectRoute={setActiveRoute}
          onToggleRail={toggleRail}
          onSignOut={() => setSignedOut(true)}
          onDownloadCompanionGuide={() =>
            pushToast(
              'Plotline Companion Specs',
              'iOS & Android field build links sent to your studio email.'
            )
          }
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar
            searchQuery={searchQuery}
            currentUser={currentUser}
            onSearchChange={setSearchQuery}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onNavigateRoute={setActiveRoute}
          />

          <main className="flex-1 overflow-y-auto p-5 sm:p-6">
            {activeRoute === 'Dashboard' && <DashboardScreen />}
            {activeRoute === 'Projects' && <ProjectsScreen />}
            {activeRoute === 'Tasks' && <TasksScreen />}
            {activeRoute === 'Calendar' && <CalendarScreen />}
            {activeRoute === 'Analytics' && <AnalyticsScreen />}
            {activeRoute === 'Team' && <TeamScreen />}
            {activeRoute === 'Settings' && <SettingsScreen />}
            {activeRoute === 'Help' && <HelpScreen />}
          </main>
        </div>
      </div>

      <NewProjectModal />
      <NewTaskModal open={newTaskModalOpen} onClose={() => setNewTaskModalOpen(false)} />
      <ProjectDialog />
      <ImportProjectsModal />
      <MemberProfileModal />
      <CommandPalette />
      <OnboardingTourModal />
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
